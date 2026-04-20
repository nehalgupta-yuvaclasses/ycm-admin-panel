import { useMemo, useRef, type ChangeEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlogAuthorOption, BlogFormData } from "@/features/blogs/types";
import { blogService } from "@/services/blogService";
import { toast } from "sonner";

interface AuthorSectionProps {
  value: Pick<
    BlogFormData,
    "author_id" | "author_name" | "author_role" | "author_avatar_url" | "author_bio"
  >;
  authors: BlogAuthorOption[];
  onChange: (updates: Partial<BlogFormData>) => void;
}

export function AuthorSection({ value, authors, onChange }: AuthorSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedAuthor = useMemo(() => {
    return authors.find((author) => author.id === value.author_id) || null;
  }, [authors, value.author_id]);

  const initials = useMemo(() => {
    const source = value.author_name || selectedAuthor?.name || "Author";
    return source
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [selectedAuthor?.name, value.author_name]);

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const url = await blogService.uploadBlogImage(file);
      onChange({ author_avatar_url: url });
    } catch {
      toast.error("Failed to upload author avatar.");
    }
    event.target.value = "";
  };

  return (
    <section className="space-y-4 rounded-xl border border-border/60 bg-background p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">Author</p>
        <p className="text-xs text-muted-foreground">Link the article to a real person before publishing.</p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Author source</Label>
        <Select
          value={value.author_id || "custom"}
          onValueChange={(nextValue) => {
            if (nextValue === "custom") {
              onChange({ author_id: "" });
              return;
            }

            const author = authors.find((item) => item.id === nextValue);
            if (!author) return;

            onChange({
              author_id: author.id,
              author_name: author.name,
              author_role: author.role,
              author_avatar_url: author.avatar_url,
              author_bio: author.bio,
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose an author" />
          </SelectTrigger>
          <SelectContent>
            {authors.map((author) => (
              <SelectItem key={author.id} value={author.id}>
                {author.name}
              </SelectItem>
            ))}
            <SelectItem value="custom">Custom author</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Author name</Label>
        <Input
          value={value.author_name}
          onChange={(event) => onChange({ author_name: event.target.value, author_id: "" })}
          placeholder="Writer name"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Author role</Label>
        <Input
          value={value.author_role}
          onChange={(event) => onChange({ author_role: event.target.value })}
          placeholder="Editor, Founder, Teacher"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Author avatar</Label>
        <div className="flex items-center gap-3">
          <Avatar size="lg" className="ring-1 ring-border/60">
            <AvatarImage src={value.author_avatar_url} alt={value.author_name || "Author avatar"} />
            <AvatarFallback>{initials || "AU"}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
            {value.author_avatar_url ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => onChange({ author_avatar_url: "" })}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            ) : null}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="hidden"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Author bio</Label>
        <Textarea
          value={value.author_bio}
          onChange={(event) => onChange({ author_bio: event.target.value })}
          placeholder="Short author bio for the article header"
          rows={4}
          className={cn("resize-none")}
        />
      </div>
    </section>
  );
}
