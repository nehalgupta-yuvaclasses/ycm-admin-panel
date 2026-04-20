import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, PanelTop, Sparkles } from "lucide-react";
import type { BlogStatus } from "@/features/blogs/types";

interface PublishControlsProps {
  status: BlogStatus;
  isPreview: boolean;
  isSaving: boolean;
  saveStatus: "idle" | "saving" | "saved";
  lastSaved: Date | null;
  onSaveDraft: () => void;
  onPublish: () => void;
  onTogglePreview: () => void;
}

export function PublishControls({
  status,
  isPreview,
  isSaving,
  saveStatus,
  lastSaved,
  onSaveDraft,
  onPublish,
  onTogglePreview,
}: PublishControlsProps) {
  return (
    <section className="space-y-4 rounded-xl border border-border/60 bg-background p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Publishing</p>
          <p className="text-xs text-muted-foreground">Save, preview, then publish.</p>
        </div>
        <Badge variant={status === "published" ? "default" : "outline"} className="px-2.5 py-1 text-[11px]">
          {status === "published" ? "Published" : "Draft"}
        </Badge>
      </div>

      <div className="grid gap-2">
        <Button type="button" variant="outline" onClick={onSaveDraft} disabled={isSaving} className="justify-start gap-2">
          {isSaving && saveStatus === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Save draft
        </Button>
        <Button type="button" variant={isPreview ? "secondary" : "outline"} onClick={onTogglePreview} className="justify-start gap-2">
          <PanelTop className="h-4 w-4" />
          {isPreview ? "Exit preview" : "Preview"}
        </Button>
        {status === "published" ? (
          <Button type="button" onClick={onSaveDraft} disabled={isSaving} className="justify-start gap-2">
            <Sparkles className="h-4 w-4" />
            Update published post
          </Button>
        ) : (
          <Button type="button" onClick={onPublish} disabled={isSaving} className="justify-start gap-2">
            <Sparkles className="h-4 w-4" />
            Publish
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {saveStatus === "saving"
            ? "Saving..."
            : saveStatus === "saved"
              ? lastSaved
                ? `Saved ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Saved"
              : "Draft auto-saves in the background"}
        </span>
      </div>
    </section>
  );
}
