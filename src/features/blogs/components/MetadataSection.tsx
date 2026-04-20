import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BlogFormData } from "@/features/blogs/types";
import { X } from "lucide-react";

const BLOG_CATEGORIES = [
  "General",
  "Announcements",
  "Academics",
  "Admissions",
  "Exams",
  "Events",
  "Guides",
  "Updates",
];

interface MetadataSectionProps {
  category: string;
  tags: string[];
  onChange: (updates: Partial<BlogFormData>) => void;
}

export function MetadataSection({ category, tags, onChange }: MetadataSectionProps) {
  const [tagInput, setTagInput] = useState("");

  const normalizedTags = useMemo(() => tags.filter(Boolean), [tags]);

  const addTag = () => {
    const nextTag = tagInput.trim();
    if (!nextTag) return;

    if (!normalizedTags.some((tag) => tag.toLowerCase() === nextTag.toLowerCase())) {
      onChange({ keywords: [...normalizedTags, nextTag] });
    }

    setTagInput("");
  };

  return (
    <section className="space-y-4 rounded-xl border border-border/60 bg-background p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">Article metadata</p>
        <p className="text-xs text-muted-foreground">Categorize the post and capture search-friendly tags.</p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Category</Label>
        <Select value={category || "General"} onValueChange={(value) => onChange({ category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {BLOG_CATEGORIES.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Tags</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();
                addTag();
              }
            }}
            placeholder="Add tag"
          />
          <Button type="button" variant="outline" onClick={addTag} disabled={!tagInput.trim()}>
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {normalizedTags.length ? (
            normalizedTags.map((tag) => (
              <Badge key={tag} variant="outline" className="gap-1 px-2 py-1 text-xs normal-case">
                {tag}
                <button
                  type="button"
                  onClick={() => onChange({ keywords: normalizedTags.filter((item) => item !== tag) })}
                  className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label={`Remove ${tag}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">Add a few descriptive tags.</p>
          )}
        </div>
      </div>
    </section>
  );
}
