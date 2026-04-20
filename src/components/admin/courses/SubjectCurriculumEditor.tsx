import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { LessonRecord, ModuleRecord, SubjectRecord } from "./types";

type SubjectCurriculumEditorProps = {
  courseId: string;
  subjects: SubjectRecord[];
  onSave: (subjects: SubjectRecord[]) => Promise<void>;
  onStartLiveClass?: (lesson: LessonRecord) => Promise<void>;
  onEndLiveClass?: (lesson: LessonRecord) => Promise<void>;
  liveActionLessonId?: string | null;
  isSaving: boolean;
};

function createLesson(order: number, moduleId: string): LessonRecord {
  return {
    id: crypto.randomUUID(),
    moduleId,
    title: "",
    lessonType: "recorded",
    videoUrl: "",
    liveUrl: "",
    scheduledAt: "",
    isLive: false,
    liveStartedAt: "",
    liveEndedAt: "",
    liveBy: "",
    notes: "",
    duration: "",
    order,
  };
}

function createModule(order: number, subjectId: string, courseId: string): ModuleRecord {
  const moduleId = crypto.randomUUID();
  return {
    id: moduleId,
    subjectId,
    courseId,
    title: "",
    order,
    lessons: [createLesson(1, moduleId)],
  };
}

function createSubject(order: number, courseId: string): SubjectRecord {
  const subjectId = crypto.randomUUID();
  const module = createModule(1, subjectId, courseId);

  return {
    id: subjectId,
    courseId,
    name: "",
    order,
    modules: [module],
  };
}

function normalizeDraft(subjects: SubjectRecord[], courseId: string): SubjectRecord[] {
  return subjects.map((subject, subjectIndex) => ({
    ...subject,
    courseId: subject.courseId || courseId,
    order: subject.order || subjectIndex + 1,
    modules: subject.modules.map((module, moduleIndex) => ({
      ...module,
      courseId: module.courseId || courseId,
      subjectId: module.subjectId || subject.id,
      order: module.order || moduleIndex + 1,
      lessons: module.lessons.map((lesson, lessonIndex) => ({
        ...lesson,
        moduleId: lesson.moduleId || module.id,
        order: lesson.order || lessonIndex + 1,
      })),
    })),
  }));
}

export function SubjectCurriculumEditor({
  courseId,
  subjects,
  onSave,
  onStartLiveClass,
  onEndLiveClass,
  liveActionLessonId,
  isSaving,
}: SubjectCurriculumEditorProps) {
  const [draft, setDraft] = useState<SubjectRecord[]>(normalizeDraft(subjects, courseId));
  const [draggedSubjectId, setDraggedSubjectId] = useState<string | null>(null);
  const [draggedModuleKey, setDraggedModuleKey] = useState<string | null>(null);
  const [draggedLessonKey, setDraggedLessonKey] = useState<string | null>(null);

  useEffect(() => {
    setDraft(normalizeDraft(subjects, courseId));
  }, [courseId, subjects]);

  const counts = useMemo(() => {
    const moduleCount = draft.reduce((total, subject) => total + subject.modules.length, 0);
    const lessonCount = draft.reduce((total, subject) => total + subject.modules.reduce((moduleTotal, module) => moduleTotal + module.lessons.length, 0), 0);
    return { moduleCount, lessonCount };
  }, [draft]);

  const updateSubject = (subjectId: string, name: string) => {
    setDraft((current) => current.map((subject) => (subject.id === subjectId ? { ...subject, name } : subject)));
  };

  const updateModule = (subjectId: string, moduleId: string, title: string) => {
    setDraft((current) => current.map((subject) => {
      if (subject.id !== subjectId) return subject;
      return {
        ...subject,
        modules: subject.modules.map((module) => (module.id === moduleId ? { ...module, title } : module)),
      };
    }));
  };

  const updateLesson = (subjectId: string, moduleId: string, lessonId: string, field: keyof LessonRecord, value: string) => {
    setDraft((current) => current.map((subject) => {
      if (subject.id !== subjectId) return subject;
      return {
        ...subject,
        modules: subject.modules.map((module) => {
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
                  nextLesson.isLive = false;
                  nextLesson.liveStartedAt = "";
                  nextLesson.liveEndedAt = "";
                  nextLesson.liveBy = "";
                }
              }
              return nextLesson;
            }),
          };
        }),
      };
    }));
  };

  const addSubject = () => {
    setDraft((current) => [...current, createSubject(current.length + 1, courseId)]);
  };

  const addModule = (subjectId: string) => {
    setDraft((current) => current.map((subject) => {
      if (subject.id !== subjectId) return subject;
      const nextModule = createModule(subject.modules.length + 1, subjectId, courseId);
      nextModule.lessons[0].moduleId = nextModule.id;
      return {
        ...subject,
        modules: [...subject.modules, nextModule],
      };
    }));
  };

  const addLesson = (subjectId: string, moduleId: string) => {
    setDraft((current) => current.map((subject) => {
      if (subject.id !== subjectId) return subject;
      return {
        ...subject,
        modules: subject.modules.map((module) => {
          if (module.id !== moduleId) return module;
          return {
            ...module,
            lessons: [...module.lessons, createLesson(module.lessons.length + 1, moduleId)],
          };
        }),
      };
    }));
  };

  const removeSubject = (subjectId: string) => {
    const subject = draft.find((entry) => entry.id === subjectId);
    if (!subject) return;
    const hasContent = subject.modules.some((module) => module.lessons.length > 0 || module.title.trim().length > 0);
    const confirmed = window.confirm(hasContent ? "Delete this subject and all nested modules and lessons?" : "Delete this subject?");
    if (!confirmed) return;

    setDraft((current) => current.filter((entry) => entry.id !== subjectId).map((entry, index) => ({ ...entry, order: index + 1 })));
  };

  const removeModule = (subjectId: string, moduleId: string) => {
    if (!window.confirm("Delete this module and all nested lessons?")) return;
    setDraft((current) => current.map((subject) => {
      if (subject.id !== subjectId) return subject;
      return {
        ...subject,
        modules: subject.modules.filter((module) => module.id !== moduleId).map((module, index) => ({ ...module, order: index + 1 })),
      };
    }));
  };

  const removeLesson = (subjectId: string, moduleId: string, lessonId: string) => {
    if (!window.confirm("Delete this lesson?")) return;
    setDraft((current) => current.map((subject) => {
      if (subject.id !== subjectId) return subject;
      return {
        ...subject,
        modules: subject.modules.map((module) => {
          if (module.id !== moduleId) return module;
          return {
            ...module,
            lessons: module.lessons.filter((lesson) => lesson.id !== lessonId).map((lesson, index) => ({ ...lesson, order: index + 1 })),
          };
        }),
      };
    }));
  };

  const moveSubject = (subjectId: string, direction: -1 | 1) => {
    setDraft((current) => {
      const index = current.findIndex((subject) => subject.id === subjectId);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next.map((subject, subjectIndex) => ({ ...subject, order: subjectIndex + 1 }));
    });
  };

  const moveModule = (subjectId: string, moduleId: string, direction: -1 | 1) => {
    setDraft((current) => current.map((subject) => {
      if (subject.id !== subjectId) return subject;
      const index = subject.modules.findIndex((module) => module.id === moduleId);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= subject.modules.length) return subject;
      const next = [...subject.modules];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return { ...subject, modules: next.map((module, moduleIndex) => ({ ...module, order: moduleIndex + 1 })) };
    }));
  };

  const moveLesson = (subjectId: string, moduleId: string, lessonId: string, direction: -1 | 1) => {
    setDraft((current) => current.map((subject) => {
      if (subject.id !== subjectId) return subject;
      return {
        ...subject,
        modules: subject.modules.map((module) => {
          if (module.id !== moduleId) return module;
          const index = module.lessons.findIndex((lesson) => lesson.id === lessonId);
          const targetIndex = index + direction;
          if (index < 0 || targetIndex < 0 || targetIndex >= module.lessons.length) return module;
          const nextLessons = [...module.lessons];
          [nextLessons[index], nextLessons[targetIndex]] = [nextLessons[targetIndex], nextLessons[index]];
          return { ...module, lessons: nextLessons.map((lesson, lessonIndex) => ({ ...lesson, order: lessonIndex + 1 })) };
        }),
      };
    }));
  };

  const handleSubjectDragStart = (subjectId: string) => setDraggedSubjectId(subjectId);
  const handleSubjectDrop = (targetSubjectId: string) => {
    if (!draggedSubjectId || draggedSubjectId === targetSubjectId) return;
    setDraft((current) => {
      const sourceIndex = current.findIndex((subject) => subject.id === draggedSubjectId);
      const targetIndex = current.findIndex((subject) => subject.id === targetSubjectId);
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const next = [...current];
      const [picked] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, picked);
      return next.map((subject, index) => ({ ...subject, order: index + 1 }));
    });
    setDraggedSubjectId(null);
  };

  const handleModuleDragStart = (subjectId: string, moduleId: string) => setDraggedModuleKey(`${subjectId}:${moduleId}`);
  const handleModuleDrop = (subjectId: string, targetModuleId: string) => {
    if (!draggedModuleKey) return;
    const [sourceSubjectId, sourceModuleId] = draggedModuleKey.split(":");
    if (sourceSubjectId !== subjectId || sourceModuleId === targetModuleId) return;
    setDraft((current) => current.map((subject) => {
      if (subject.id !== subjectId) return subject;
      const sourceIndex = subject.modules.findIndex((module) => module.id === sourceModuleId);
      const targetIndex = subject.modules.findIndex((module) => module.id === targetModuleId);
      if (sourceIndex < 0 || targetIndex < 0) return subject;
      const nextModules = [...subject.modules];
      const [picked] = nextModules.splice(sourceIndex, 1);
      nextModules.splice(targetIndex, 0, picked);
      return { ...subject, modules: nextModules.map((module, index) => ({ ...module, order: index + 1 })) };
    }));
    setDraggedModuleKey(null);
  };

  const handleLessonDragStart = (subjectId: string, moduleId: string, lessonId: string) => setDraggedLessonKey(`${subjectId}:${moduleId}:${lessonId}`);
  const handleLessonDrop = (subjectId: string, moduleId: string, targetLessonId: string) => {
    if (!draggedLessonKey) return;
    const [sourceSubjectId, sourceModuleId, sourceLessonId] = draggedLessonKey.split(":");
    if (sourceSubjectId !== subjectId || sourceModuleId !== moduleId || sourceLessonId === targetLessonId) return;
    setDraft((current) => current.map((subject) => {
      if (subject.id !== subjectId) return subject;
      return {
        ...subject,
        modules: subject.modules.map((module) => {
          if (module.id !== moduleId) return module;
          const sourceIndex = module.lessons.findIndex((lesson) => lesson.id === sourceLessonId);
          const targetIndex = module.lessons.findIndex((lesson) => lesson.id === targetLessonId);
          if (sourceIndex < 0 || targetIndex < 0) return module;
          const nextLessons = [...module.lessons];
          const [picked] = nextLessons.splice(sourceIndex, 1);
          nextLessons.splice(targetIndex, 0, picked);
          return { ...module, lessons: nextLessons.map((lesson, index) => ({ ...lesson, order: index + 1 })) };
        }),
      };
    }));
    setDraggedLessonKey(null);
  };

  return (
    <Card className="rounded-xl border-border/60">
      <CardHeader className="space-y-4 border-b border-border/60">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Curriculum</CardTitle>
            <CardDescription>Reorder subjects, modules, and lessons, then save the full structure back to Supabase.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">{draft.length} subjects</div>
            <div className="text-sm text-muted-foreground">{counts.moduleCount} modules</div>
            <div className="text-sm text-muted-foreground">{counts.lessonCount} lessons</div>
            <Button type="button" variant="outline" className="gap-2 rounded-lg" onClick={addSubject}>
              <Plus className="h-4 w-4" /> Add subject
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
          draft.map((subject, subjectIndex) => (
            <div
              key={subject.id}
              draggable
              onDragStart={() => handleSubjectDragStart(subject.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleSubjectDrop(subject.id)}
              className={cn(
                "rounded-xl border border-border/60 bg-card p-4",
                draggedSubjectId === subject.id && "border-primary/40 bg-muted/30"
              )}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Subject {subjectIndex + 1}</div>
                    <Input value={subject.name} onChange={(event) => updateSubject(subject.id, event.target.value)} placeholder="Subject name" />
                  </div>
                </div>

                <div className="flex items-center gap-1 self-start md:self-auto">
                  <Button type="button" variant="ghost" size="icon" onClick={() => moveSubject(subject.id, -1)} disabled={subjectIndex === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => moveSubject(subject.id, 1)} disabled={subjectIndex === draft.length - 1}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => addModule(subject.id)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeSubject(subject.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-3 pl-0 md:pl-12">
                {subject.modules.map((module, moduleIndex) => (
                  <div
                    key={module.id}
                    draggable
                    onDragStart={() => handleModuleDragStart(subject.id, module.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleModuleDrop(subject.id, module.id)}
                    className={cn(
                      "rounded-lg border border-border/60 bg-muted/20 p-3",
                      draggedModuleKey === `${subject.id}:${module.id}` && "border-primary/40 bg-muted/30"
                    )}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          <GripVertical className="h-4 w-4" /> Module {moduleIndex + 1}
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <Input value={module.title} onChange={(event) => updateModule(subject.id, module.id, event.target.value)} placeholder="Module title" />
                          <Input value={String(module.order)} disabled placeholder="Order" />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Lessons</label>
                          <Button type="button" variant="outline" className="w-fit gap-2 rounded-lg" onClick={() => addLesson(subject.id, module.id)}>
                            <Plus className="h-4 w-4" /> Add lesson
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 md:pt-1">
                        <Button type="button" variant="ghost" size="icon" onClick={() => moveModule(subject.id, module.id, -1)} disabled={moduleIndex === 0}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => moveModule(subject.id, module.id, 1)} disabled={moduleIndex === subject.modules.length - 1}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeModule(subject.id, module.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3 pl-0 md:pl-8">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          draggable
                          onDragStart={() => handleLessonDragStart(subject.id, module.id, lesson.id)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => handleLessonDrop(subject.id, module.id, lesson.id)}
                          className={cn(
                            "rounded-lg border border-border/60 bg-card p-3",
                            draggedLessonKey === `${subject.id}:${module.id}:${lesson.id}` && "border-primary/40 bg-muted/30"
                          )}
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                <GripVertical className="h-4 w-4" /> Lesson {lessonIndex + 1}
                              </div>
                              <div className="grid gap-3 md:grid-cols-2">
                                <Input value={lesson.title} onChange={(event) => updateLesson(subject.id, module.id, lesson.id, 'title', event.target.value)} placeholder="Lesson title" />
                                <Input value={lesson.duration} onChange={(event) => updateLesson(subject.id, module.id, lesson.id, 'duration', event.target.value)} placeholder="Duration" />
                              </div>
                              <div className="grid gap-2">
                                <label className="text-sm font-medium">Lesson type</label>
                                <Select value={lesson.lessonType} onValueChange={(value) => updateLesson(subject.id, module.id, lesson.id, 'lessonType', value)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select lesson type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="recorded">Recorded</SelectItem>
                                    <SelectItem value="live">Live</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                {lesson.lessonType === "live" ? (
                                  <>
                                    {lesson.isLive ? (
                                      <Badge className="rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">LIVE</Badge>
                                    ) : lesson.liveEndedAt ? (
                                      <Badge variant="outline" className="rounded-md border-border/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Ended</Badge>
                                    ) : (
                                      <Badge variant="outline" className="rounded-md border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-600">Scheduled</Badge>
                                    )}
                                    {lesson.scheduledAt ? <span className="text-xs text-muted-foreground">Starts {lesson.scheduledAt}</span> : null}
                                  </>
                                ) : (
                                  <Badge variant="outline" className="rounded-md border-border/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Recorded</Badge>
                                )}
                              </div>
                              {lesson.lessonType === "recorded" ? (
                                <Input value={lesson.videoUrl} onChange={(event) => updateLesson(subject.id, module.id, lesson.id, 'videoUrl', event.target.value)} placeholder="Video URL" />
                              ) : (
                                <div className="grid gap-3 md:grid-cols-2">
                                  <Input value={lesson.liveUrl} onChange={(event) => updateLesson(subject.id, module.id, lesson.id, 'liveUrl', event.target.value)} placeholder="Live class link" />
                                  <Input type="datetime-local" value={lesson.scheduledAt} onChange={(event) => updateLesson(subject.id, module.id, lesson.id, 'scheduledAt', event.target.value)} />
                                </div>
                              )}
                              <Textarea value={lesson.notes} onChange={(event) => updateLesson(subject.id, module.id, lesson.id, 'notes', event.target.value)} placeholder="Notes" className="min-h-24" />
                            </div>

                            <div className="flex flex-col items-end gap-2 md:pt-1">
                              {lesson.lessonType === "live" ? (
                                lesson.isLive ? (
                                  <Button
                                    type="button"
                                    variant="default"
                                    className="gap-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                                    onClick={() => onEndLiveClass?.(lesson)}
                                    disabled={!onEndLiveClass || liveActionLessonId === lesson.id}
                                  >
                                    {liveActionLessonId === lesson.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    End Live Class
                                  </Button>
                                ) : lesson.liveEndedAt ? (
                                  <Badge variant="outline" className="rounded-lg border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground">Class ended</Badge>
                                ) : (
                                  <Button
                                    type="button"
                                    className="gap-2 rounded-lg"
                                    onClick={() => onStartLiveClass?.(lesson)}
                                    disabled={!onStartLiveClass || liveActionLessonId === lesson.id}
                                  >
                                    {liveActionLessonId === lesson.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    Start Live Class
                                  </Button>
                                )
                              ) : null}

                              <div className="flex items-center gap-1">
                              <Button type="button" variant="ghost" size="icon" onClick={() => moveLesson(subject.id, module.id, lesson.id, -1)} disabled={lessonIndex === 0}>
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button type="button" variant="ghost" size="icon" onClick={() => moveLesson(subject.id, module.id, lesson.id, 1)} disabled={lessonIndex === module.lessons.length - 1}>
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeLesson(subject.id, module.id, lesson.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {subject.modules.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
                    No modules in this subject yet. Add one to begin.
                  </div>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-8 text-sm text-muted-foreground">
            No subjects yet. Add a subject to start structuring the course.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
