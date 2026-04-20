import { useEffect, useMemo, useState } from "react";
import { Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cmsService, type HomepageContent } from "@/services/cmsService";

const emptyHomepage: HomepageContent = {
  hero_title: "",
  hero_subtitle: "",
  primary_cta_text: "",
  primary_cta_link: "",
  secondary_cta_text: "",
  secondary_cta_link: "",
  featured_courses: [],
  highlights: [],
};

export function HomepageEditor() {
  const [content, setContent] = useState<HomepageContent>(emptyHomepage);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [courseInput, setCourseInput] = useState("");
  const [highlightInput, setHighlightInput] = useState("");

  const previewStats = useMemo(() => ({
    courses: content.featured_courses.length,
    highlights: content.highlights.length,
  }), [content.featured_courses.length, content.highlights.length]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await cmsService.getHomepageContent();
        if (active) {
          setContent(data);
          setLastSaved(data.updated_at || null);
        }
      } catch {
        toast.error("Failed to load homepage content");
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const saveContent = async () => {
    try {
      setIsSaving(true);
      const saved = await cmsService.saveHomepageContent(content);
      setContent(saved);
      setLastSaved(saved.updated_at || new Date().toISOString());
      toast.success("Homepage content saved");
    } catch {
      toast.error("Failed to save homepage content");
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = (key: "featured_courses" | "highlights", value: string) => {
    const nextValue = value.trim();
    if (!nextValue) return;
    setContent((current) => ({
      ...current,
      [key]: Array.from(new Set([...current[key], nextValue])),
    }));
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-border/60 pb-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Homepage content</p>
          <p className="text-sm text-muted-foreground">Edit hero copy, featured courses, and highlights.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{previewStats.courses} featured courses</span>
          <span>•</span>
          <span>{previewStats.highlights} highlights</span>
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={saveContent} disabled={isSaving}>
            <Save className="h-4 w-4" /> Save changes
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <Card className="h-[420px] animate-pulse border-border/60 bg-muted/20" />
          <Card className="h-[420px] animate-pulse border-border/60 bg-muted/20" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <Card className="border-border/60">
            <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Hero title</Label>
                <Input value={content.hero_title} onChange={(event) => setContent((current) => ({ ...current, hero_title: event.target.value }))} placeholder="Learn with structure" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Hero subtitle</Label>
                <Textarea value={content.hero_subtitle} onChange={(event) => setContent((current) => ({ ...current, hero_subtitle: event.target.value }))} rows={4} placeholder="Short supporting line for the homepage hero" />
              </div>
              <div className="space-y-2">
                <Label>Primary CTA text</Label>
                <Input value={content.primary_cta_text} onChange={(event) => setContent((current) => ({ ...current, primary_cta_text: event.target.value }))} placeholder="Explore courses" />
              </div>
              <div className="space-y-2">
                <Label>Primary CTA link</Label>
                <Input value={content.primary_cta_link} onChange={(event) => setContent((current) => ({ ...current, primary_cta_link: event.target.value }))} placeholder="/courses" />
              </div>
              <div className="space-y-2">
                <Label>Secondary CTA text</Label>
                <Input value={content.secondary_cta_text} onChange={(event) => setContent((current) => ({ ...current, secondary_cta_text: event.target.value }))} placeholder="Talk to us" />
              </div>
              <div className="space-y-2">
                <Label>Secondary CTA link</Label>
                <Input value={content.secondary_cta_link} onChange={(event) => setContent((current) => ({ ...current, secondary_cta_link: event.target.value }))} placeholder="/contact" />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Featured courses</Label>
                <div className="flex gap-2">
                  <Input value={courseInput} onChange={(event) => setCourseInput(event.target.value)} placeholder="Add course name" onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addItem("featured_courses", courseInput); setCourseInput(""); } }} />
                  <Button type="button" variant="outline" onClick={() => { addItem("featured_courses", courseInput); setCourseInput(""); }}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {content.featured_courses.map((item) => (
                    <Badge key={item} variant="outline" className="gap-1 px-2 py-1 text-xs normal-case">
                      {item}
                      <button type="button" onClick={() => setContent((current) => ({ ...current, featured_courses: current.featured_courses.filter((course) => course !== item) }))}>×</button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Highlights</Label>
                <div className="flex gap-2">
                  <Input value={highlightInput} onChange={(event) => setHighlightInput(event.target.value)} placeholder="Add a highlight" onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addItem("highlights", highlightInput); setHighlightInput(""); } }} />
                  <Button type="button" variant="outline" onClick={() => { addItem("highlights", highlightInput); setHighlightInput(""); }}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {content.highlights.map((item) => (
                    <Badge key={item} variant="secondary" className="gap-1 px-2 py-1 text-xs normal-case">
                      {item}
                      <button type="button" onClick={() => setContent((current) => ({ ...current, highlights: current.highlights.filter((highlight) => highlight !== item) }))}>×</button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="space-y-4 p-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Instant preview</p>
                <p className="text-xs text-muted-foreground">Homepage copy updates as you type.</p>
              </div>
              <div className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Homepage hero</p>
                <h3 className="text-2xl font-semibold tracking-tight">{content.hero_title || "Hero title"}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{content.hero_subtitle || "Hero subtitle"}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge>{content.primary_cta_text || "Primary CTA"}</Badge>
                  <Badge variant="outline">{content.secondary_cta_text || "Secondary CTA"}</Badge>
                </div>
              </div>
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                  <span className="text-muted-foreground">Primary link</span>
                  <span className="truncate font-medium">{content.primary_cta_link || "-"}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                  <span className="text-muted-foreground">Secondary link</span>
                  <span className="truncate font-medium">{content.secondary_cta_link || "-"}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                  <span className="text-muted-foreground">Last saved</span>
                  <span className="font-medium">{lastSaved ? new Date(lastSaved).toLocaleString() : "Not saved yet"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}
