import { useEffect, useMemo, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cmsService, type AboutContent } from "@/services/cmsService";

const emptyAbout: AboutContent = {
  hero_heading: "",
  story_content: "",
  founder_name: "",
  founder_role: "",
  founder_bio: "",
  mission: "",
  vision: "",
  timeline: [],
};

export function AboutEditor() {
  const [content, setContent] = useState<AboutContent>(emptyAbout);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const timelineSummary = useMemo(() => content.timeline.length, [content.timeline.length]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await cmsService.getAboutContent();
        if (active) {
          setContent(data);
          setLastSaved(data.updated_at || null);
        }
      } catch {
        toast.error("Failed to load about content");
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
      const saved = await cmsService.saveAboutContent(content);
      setContent(saved);
      setLastSaved(saved.updated_at || new Date().toISOString());
      toast.success("About page saved");
    } catch {
      toast.error("Failed to save about content");
    } finally {
      setIsSaving(false);
    }
  };

  const addTimelineItem = () => {
    setContent((current) => ({
      ...current,
      timeline: [...current.timeline, { year: "", title: "", description: "" }],
    }));
  };

  const updateTimelineItem = (index: number, field: keyof AboutContent["timeline"][number], value: string) => {
    setContent((current) => ({
      ...current,
      timeline: current.timeline.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const removeTimelineItem = (index: number) => {
    setContent((current) => ({
      ...current,
      timeline: current.timeline.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-border/60 pb-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">About page content</p>
          <p className="text-sm text-muted-foreground">Keep the about page editable without touching code.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-2 py-1 text-xs normal-case">{timelineSummary} timeline items</Badge>
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={saveContent} disabled={isSaving}>
            <Save className="h-4 w-4" /> Save changes
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <Card className="h-[520px] animate-pulse border-border/60 bg-muted/20" />
          <Card className="h-[520px] animate-pulse border-border/60 bg-muted/20" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <Card className="border-border/60">
            <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Hero heading</Label>
                <Input value={content.hero_heading} onChange={(event) => setContent((current) => ({ ...current, hero_heading: event.target.value }))} placeholder="About our institute" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Story content</Label>
                <Textarea value={content.story_content} onChange={(event) => setContent((current) => ({ ...current, story_content: event.target.value }))} rows={5} placeholder="Tell the origin story of the school or brand" />
              </div>
              <div className="space-y-2">
                <Label>Founder name</Label>
                <Input value={content.founder_name} onChange={(event) => setContent((current) => ({ ...current, founder_name: event.target.value }))} placeholder="Founder name" />
              </div>
              <div className="space-y-2">
                <Label>Founder role</Label>
                <Input value={content.founder_role} onChange={(event) => setContent((current) => ({ ...current, founder_role: event.target.value }))} placeholder="Founder / Director" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Founder section</Label>
                <Textarea value={content.founder_bio} onChange={(event) => setContent((current) => ({ ...current, founder_bio: event.target.value }))} rows={4} placeholder="Founder message or bio" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Mission</Label>
                <Textarea value={content.mission} onChange={(event) => setContent((current) => ({ ...current, mission: event.target.value }))} rows={3} placeholder="Mission statement" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Vision</Label>
                <Textarea value={content.vision} onChange={(event) => setContent((current) => ({ ...current, vision: event.target.value }))} rows={3} placeholder="Vision statement" />
              </div>

              <div className="sm:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Timeline</Label>
                  <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addTimelineItem}>
                    <Plus className="h-4 w-4" /> Add item
                  </Button>
                </div>
                <div className="space-y-3">
                  {content.timeline.map((item, index) => (
                    <div key={index} className="grid gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 sm:grid-cols-[120px_minmax(0,1fr)_auto]">
                      <Input value={item.year} onChange={(event) => updateTimelineItem(index, "year", event.target.value)} placeholder="2024" />
                      <div className="space-y-2">
                        <Input value={item.title} onChange={(event) => updateTimelineItem(index, "title", event.target.value)} placeholder="Milestone title" />
                        <Textarea value={item.description} onChange={(event) => updateTimelineItem(index, "description", event.target.value)} rows={3} placeholder="Milestone description" />
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeTimelineItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {!content.timeline.length ? (
                    <div className="rounded-xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
                      Add a few milestones to tell the brand story over time.
                    </div>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="space-y-4 p-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Instant preview</p>
                <p className="text-xs text-muted-foreground">See the about page structure as you edit.</p>
              </div>
              <div className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">About</p>
                  <h3 className="text-2xl font-semibold tracking-tight">{content.hero_heading || "About heading"}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{content.story_content || "Story content"}</p>
                </div>
                <div className="space-y-1 rounded-lg border border-border/60 bg-background p-3">
                  <p className="text-sm font-medium text-foreground">{content.founder_name || "Founder"}</p>
                  <p className="text-xs text-muted-foreground">{content.founder_role || "Founder role"}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{content.founder_bio || "Founder bio"}</p>
                </div>
                <div className="grid gap-3 text-sm">
                  <div className="rounded-lg border border-border/60 px-3 py-2">
                    <p className="text-xs text-muted-foreground">Mission</p>
                    <p className="mt-1 leading-6">{content.mission || "Mission statement"}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 px-3 py-2">
                    <p className="text-xs text-muted-foreground">Vision</p>
                    <p className="mt-1 leading-6">{content.vision || "Vision statement"}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Timeline</p>
                  {content.timeline.map((item, index) => (
                    <div key={index} className="rounded-lg border border-border/60 bg-background px-3 py-2">
                      <p className="text-xs text-muted-foreground">{item.year || "Year"}</p>
                      <p className="font-medium text-foreground">{item.title || "Milestone title"}</p>
                      <p className="text-sm text-muted-foreground">{item.description || "Milestone description"}</p>
                    </div>
                  ))}
                  {!content.timeline.length ? <p className="text-sm text-muted-foreground">No timeline items yet.</p> : null}
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm">
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
