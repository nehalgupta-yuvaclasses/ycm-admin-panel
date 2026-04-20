import type { ChangeEvent } from "react";
import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, PencilLine, Upload, X } from "lucide-react";
import type { BlogAuthorOption, BlogFormData } from "@/features/blogs/types";
import { cn } from "@/lib/utils";
import { BlogSEOSection } from "./BlogSEOSection";
import { AuthorSection } from "./AuthorSection";
import { MetadataSection } from "./MetadataSection";
import { PublishControls } from "./PublishControls";

interface BlogSettingsPanelProps {
  formData: BlogFormData;
  authors: BlogAuthorOption[];
  onChange: (updates: Partial<BlogFormData>) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onTogglePreview: () => void;
  isPreview: boolean;
  isSaving: boolean;
  saveStatus: "idle" | "saving" | "saved";
  lastSaved: Date | null;
  slugError: string | null;
  onUploadCover: (file: File) => Promise<void>;
  onRemoveCover: () => void;
}

export function BlogSettingsPanel({
  formData,
  authors,
  onChange,
  onSaveDraft,
  onPublish,
  onTogglePreview,
  isPreview,
  isSaving,
  saveStatus,
  lastSaved,
  slugError,
  onUploadCover,
  onRemoveCover,
}: BlogSettingsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      await onUploadCover(file);
      event.target.value = "";
    },
    [onUploadCover]
  );

  return (
    <ScrollArea className="h-full">
      <div className="flex min-h-full flex-col px-5 py-6">
        <div className="space-y-4">
          <PublishControls
            status={formData.status}
            isPreview={isPreview}
            isSaving={isSaving}
            saveStatus={saveStatus}
            lastSaved={lastSaved}
            onSaveDraft={onSaveDraft}
            onPublish={onPublish}
            onTogglePreview={onTogglePreview}
          />
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <section className="space-y-2 rounded-xl border border-border/60 bg-background p-4">
            <Label className="text-sm font-medium text-foreground">Slug</Label>
            <div className="relative">
              <PencilLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={formData.slug}
                onChange={(event) => onChange({ slug: event.target.value })}
                placeholder="post-slug"
                className={cn("pl-10 font-mono text-sm", slugError && "border-destructive/40 focus-visible:ring-destructive/10")}
              />
            </div>
            {slugError ? (
              <p className="text-xs text-destructive">{slugError}</p>
            ) : (
              <p className="text-xs text-muted-foreground">The slug is editable and must be unique.</p>
            )}
          </section>

          <AuthorSection
            value={{
              author_id: formData.author_id,
              author_name: formData.author_name,
              author_role: formData.author_role,
              author_avatar_url: formData.author_avatar_url,
              author_bio: formData.author_bio,
            }}
            authors={authors}
            onChange={onChange}
          />

          <MetadataSection category={formData.category} tags={formData.keywords} onChange={onChange} />

          <section className="space-y-2 rounded-xl border border-border/60 bg-background p-4">
            <Label className="text-sm font-medium text-foreground">Cover image</Label>
            {formData.cover_image ? (
              <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                <div className="relative aspect-video">
                  <img src={formData.cover_image} alt="Cover preview" className="h-full w-full object-cover" />
                </div>
                <div className="flex items-center justify-between border-t border-border/60 px-3 py-2">
                  <span className="truncate text-xs text-muted-foreground">Cover image uploaded</span>
                  <Button type="button" variant="ghost" size="sm" onClick={onRemoveCover} className="h-8 gap-1 px-2 text-xs">
                    <X className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/10 px-4 py-8 text-center text-sm text-muted-foreground transition-colors hover:bg-muted/20 hover:text-foreground"
              >
                <Upload className="h-5 w-5" />
                Upload cover image
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
          </section>
        </div>

        <Separator className="my-6" />

        <BlogSEOSection
          metaTitle={formData.meta_title}
          metaDescription={formData.meta_description}
          onChange={onChange}
        />

        <Separator className="my-6" />

        <div className="space-y-3 pb-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5" />
            Cover and metadata update with the next save.
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
