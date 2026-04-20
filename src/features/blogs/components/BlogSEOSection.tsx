import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface BlogSEOSectionProps {
  metaTitle: string;
  metaDescription: string;
  onChange: (updates: {
    meta_title?: string;
    meta_description?: string;
  }) => void;
}

export function BlogSEOSection({
  metaTitle,
  metaDescription,
  onChange,
}: BlogSEOSectionProps) {
  const descriptionCount = useMemo(() => metaDescription.trim().length, [metaDescription]);

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">SEO settings</h3>
        <p className="text-xs text-muted-foreground">Search metadata for the article page.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Meta title</Label>
          <Input
            value={metaTitle}
            onChange={(event) => onChange({ meta_title: event.target.value })}
            placeholder="Defaults to the post title"
          />
          <div className="flex items-center justify-end text-xs text-muted-foreground">
            <span className={cn(metaTitle.length > 60 && "text-destructive")}>{metaTitle.length}/60</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Meta description</Label>
          <Textarea
            value={metaDescription}
            onChange={(event) => onChange({ meta_description: event.target.value })}
            placeholder="Short search snippet for the blog post"
            rows={4}
            className="resize-none"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Recommended: 140 to 160 characters</span>
            <span className={cn(descriptionCount > 160 && "text-destructive")}>{descriptionCount}/160</span>
          </div>
        </div>
      </div>
    </section>
  );
}
