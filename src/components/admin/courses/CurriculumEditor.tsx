import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { LessonRecord, ModuleRecord } from "./types";

type CurriculumEditorProps = {
  courseId: string;
  modules: ModuleRecord[];
  onSave: (modules: ModuleRecord[]) => Promise<void>;
  isSaving: boolean;
};

function createModule(order: number): ModuleRecord {
  return {
    id: crypto.randomUUID(),
    subjectId: crypto.randomUUID(),
    courseId: "",
    title: "",
    order,
    lessons: [createLesson(1)],
  };
}

function createLesson(order: number): LessonRecord {
  return {
    id: crypto.randomUUID(),
    moduleId: "",
    title: "",
    lessonType: "recorded",
    videoUrl: "",
    liveUrl: "",
    scheduledAt: "",
    notes: "",
    duration: "",
    order,
  };
}

export function CurriculumEditor({ courseId, modules, onSave, isSaving }: CurriculumEditorProps) {
  const [draft, setDraft] = useState<ModuleRecord[]>(modules);
  const [draggedModuleId, setDraggedModuleId] = useState<string | null>(null);
  const [draggedLessonKey, setDraggedLessonKey] = useState<string | null>(null);

  useEffect(() => {
    setDraft(modules);
  }, [modules]);

  const lessonTotal = useMemo(() => draft.reduce((acc, module) => acc + module.lessons.length, 0), [draft]);

  const updateModule = (moduleId: string, title: string) => {
    setDraft((current) => current.map((module) => (module.id === moduleId ? { ...module, title } : module)));
  };

  const updateLesson = (moduleId: string, lessonId: string, field: keyof LessonRecord, value: string) => {
    setDraft((current) => current.map((module) => {
      if (module.id !== moduleId) return module;
      return {
        ...module,
        lessons: module.lessons.map((lesson) => {
          if (lesson.id !== lessonId) return lesson;
          const nextLesson = { ...lesson, [field]: value };
          if (field === "lessonType") {
            if (value === "live") {
              nextLesson.videoUrl = "";
            } else {
              nextLesson.liveUrl = "";
              nextLesson.scheduledAt = "";
            }
          }
          return nextLesson;
        }),
      };
    }));
  };

  const addModule = () => {
    setDraft((current) => [...current, { ...createModule(current.length + 1), courseId }]);
  };

  const addLesson = (moduleId: string) => {
    setDraft((current) => current.map((module) => {
      if (module.id !== moduleId) return module;
      return {
        ...module,
        lessons: [...module.lessons, { ...createLesson(module.lessons.length + 1), moduleId }],
      };
    }));
  };

  const removeModule = (moduleId: string) => {
    if (!window.confirm("Delete this module and all nested lessons?")) return;
    setDraft((current) => current.filter((module) => module.id !== moduleId).map((module, index) => ({ ...module, order: index + 1 })));
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    if (!window.confirm("Delete this lesson?")) return;
    setDraft((current) => current.map((module) => {
      if (module.id !== moduleId) return module;
      return {
        ...module,
        lessons: module.lessons.filter((lesson) => lesson.id !== lessonId).map((lesson, index) => ({ ...lesson, order: index + 1 })),
      };
    }));
  };

  const moveModule = (moduleId: string, direction: -1 | 1) => {
    setDraft((current) => {
      const index = current.findIndex((module) => module.id === moduleId);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next.map((module, indexValue) => ({ ...module, order: indexValue + 1 }));
    });
  };

  const moveLesson = (moduleId: string, lessonId: string, direction: -1 | 1) => {
    setDraft((current) => current.map((module) => {
      if (module.id !== moduleId) return module;
      const index = module.lessons.findIndex((lesson) => lesson.id === lessonId);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= module.lessons.length) return module;
      const nextLessons = [...module.lessons];
      [nextLessons[index], nextLessons[targetIndex]] = [nextLessons[targetIndex], nextLessons[index]];
      return { ...module, lessons: nextLessons.map((lesson, indexValue) => ({ ...lesson, order: indexValue + 1 })) };
    }));
  };

  const handleDragModuleStart = (moduleId: string) => setDraggedModuleId(moduleId);
  const handleDropModule = (targetModuleId: string) => {
    if (!draggedModuleId || draggedModuleId === targetModuleId) return;
    setDraft((current) => {
      const sourceIndex = current.findIndex((module) => module.id === draggedModuleId);
      const targetIndex = current.findIndex((module) => module.id === targetModuleId);
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const next = [...current];
      const [picked] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, picked);
      return next.map((module, index) => ({ ...module, order: index + 1 }));
    });
    setDraggedModuleId(null);
  };

  const handleLessonDragStart = (moduleId: string, lessonId: string) => setDraggedLessonKey(`${moduleId}:${lessonId}`);
  const handleLessonDrop = (moduleId: string, targetLessonId: string) => {
    if (!draggedLessonKey) return;
    const [sourceModuleId, sourceLessonId] = draggedLessonKey.split(":");
    if (sourceModuleId !== moduleId || sourceLessonId === targetLessonId) return;
    setDraft((current) => current.map((module) => {
      if (module.id !== moduleId) return module;
      const sourceIndex = module.lessons.findIndex((lesson) => lesson.id === sourceLessonId);
      const targetIndex = module.lessons.findIndex((lesson) => lesson.id === targetLessonId);
      if (sourceIndex < 0 || targetIndex < 0) return module;
      const nextLessons = [...module.lessons];
      const [picked] = nextLessons.splice(sourceIndex, 1);
      nextLessons.splice(targetIndex, 0, picked);
      return { ...module, lessons: nextLessons.map((lesson, index) => ({ ...lesson, order: index + 1 })) };
    }));
    setDraggedLessonKey(null);
  };

  return (
    <Card className="rounded-xl border-border/60">
      <CardHeader className="space-y-4 border-b border-border/60">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Curriculum</CardTitle>
            <CardDescription>Reorder modules and lessons, then save the full structure back to Supabase.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">{draft.length} modules</div>
            <div className="text-sm text-muted-foreground">{lessonTotal} lessons</div>
            <Button type="button" variant="outline" className="gap-2 rounded-lg" onClick={addModule}>
              <Plus className="h-4 w-4" /> Add module
            </Button>
            <Button type="button" className="gap-2 rounded-lg" onClick={() => onSave(draft)} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save curriculum
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-6">
        {draft.length ? (
          draft.map((module, moduleIndex) => (
            <div
              key={module.id}
              draggable
              onDragStart={() => handleDragModuleStart(module.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDropModule(module.id)}
              className={cn(
                "rounded-xl border border-border/60 bg-card p-4",
                draggedModuleId === module.id && "border-primary/40 bg-muted/30"
              )}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Module {moduleIndex + 1}</div>
                    <Input value={module.title} onChange={(event) => updateModule(module.id, event.target.value)} placeholder="Module title" />
                  </div>
                </div>

                <div className="flex items-center gap-1 self-start md:self-auto">
                  <Button type="button" variant="ghost" size="icon" onClick={() => moveModule(module.id, -1)} disabled={moduleIndex === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => moveModule(module.id, 1)} disabled={moduleIndex === draft.length - 1}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => addLesson(module.id)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeModule(module.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-3 pl-0 md:pl-12">
                {module.lessons.map((lesson, lessonIndex) => (
                  <div
                    key={lesson.id}
                    draggable
                    onDragStart={() => handleLessonDragStart(module.id, lesson.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleLessonDrop(module.id, lesson.id)}
                    className={cn(
                      "rounded-lg border border-border/60 bg-muted/20 p-3",
                      draggedLessonKey === `${module.id}:${lesson.id}` && "border-primary/40 bg-muted/30"
                    )}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          <GripVertical className="h-4 w-4" /> Lesson {lessonIndex + 1}
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <Input value={lesson.title} onChange={(event) => updateLesson(module.id, lesson.id, 'title', event.target.value)} placeholder="Lesson title" />
                          <Input value={lesson.duration} onChange={(event) => updateLesson(module.id, lesson.id, 'duration', event.target.value)} placeholder="Duration" />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Lesson type</label>
                          <Select value={lesson.lessonType} onValueChange={(value) => updateLesson(module.id, lesson.id, 'lessonType', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select lesson type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="recorded">Recorded</SelectItem>
                              <SelectItem value="live">Live</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {lesson.lessonType === "recorded" ? (
                          <Input value={lesson.videoUrl} onChange={(event) => updateLesson(module.id, lesson.id, 'videoUrl', event.target.value)} placeholder="YouTube recording URL" />
                        ) : (
                          <div className="grid gap-3 md:grid-cols-2">
                            <Input value={lesson.liveUrl} onChange={(event) => updateLesson(module.id, lesson.id, 'liveUrl', event.target.value)} placeholder="YouTube live URL" />
                            <Input type="datetime-local" value={lesson.scheduledAt} onChange={(event) => updateLesson(module.id, lesson.id, 'scheduledAt', event.target.value)} />
                          </div>
                        )}
                        <Textarea value={lesson.notes} onChange={(event) => updateLesson(module.id, lesson.id, 'notes', event.target.value)} placeholder="Notes" className="min-h-24" />
                      </div>

                      <div className="flex items-center gap-1 md:pt-1">
                        <Button type="button" variant="ghost" size="icon" onClick={() => moveLesson(module.id, lesson.id, -1)} disabled={lessonIndex === 0}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => moveLesson(module.id, lesson.id, 1)} disabled={lessonIndex === module.lessons.length - 1}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeLesson(module.id, lesson.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-8 text-sm text-muted-foreground">
            No curriculum yet. Add a module to start structuring the course.
          </div>
        )}
      </CardContent>
    </Card>
  );
}