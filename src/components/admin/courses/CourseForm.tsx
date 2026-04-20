import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CourseFormValues, InstructorOption, LessonDraft, ModuleDraft } from "./types";

type CourseFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CourseFormValues, thumbnailFile: File | null) => Promise<void>;
  instructors: InstructorOption[];
  isSubmitting: boolean;
  title: string;
  description: string;
  submitLabel: string;
  initialValues?: Partial<CourseFormValues>;
};

const defaultValues: CourseFormValues = {
  title: "",
  subtitle: "",
  description: "",
  category: "",
  instructorId: "",
  thumbnailUrl: "",
  originalPrice: 0,
  sellingPrice: 0,
  status: "Draft",
  visibility: "Public",
  modules: [],
};

const stepLabels = ['Basic info', 'Pricing', 'Structure', 'Settings'];

function getInstructorLabel(instructor: InstructorOption) {
  return instructor.name || (instructor as { fullName?: string }).fullName || instructor.email || 'Instructor';
}

function emptyModule(order: number): ModuleDraft {
  return {
    id: crypto.randomUUID(),
    title: "",
    order,
    lessons: [emptyLesson(1)],
  };
}

function emptyLesson(order: number): LessonDraft {
  return {
    id: crypto.randomUUID(),
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

function cloneLesson(lesson: Partial<LessonDraft>, lessonIndex: number): LessonDraft {
  return {
    ...emptyLesson(lessonIndex + 1),
    ...lesson,
    lessonType: lesson.lessonType === "live" ? "live" : "recorded",
    videoUrl: lesson.videoUrl || "",
    liveUrl: lesson.liveUrl || "",
    scheduledAt: lesson.scheduledAt || "",
    order: lesson.order ?? lessonIndex + 1,
  };
}

function cloneDraft(values?: Partial<CourseFormValues>): CourseFormValues {
  return {
    ...defaultValues,
    ...values,
    modules: (values?.modules || defaultValues.modules).map((module, moduleIndex) => ({
      ...module,
      order: module.order ?? moduleIndex + 1,
      lessons: (module.lessons || []).map((lesson, lessonIndex) => cloneLesson(lesson, lessonIndex)),
    })),
  };
}

function validateRequiredFields(values: CourseFormValues) {
  if (!values.title.trim()) return "Course title is required.";
  if (!values.description.trim()) return "Course description is required.";
  if (!values.category.trim()) return "Category is required.";
  if (!values.instructorId.trim()) return "Instructor is required.";
  if (values.originalPrice < 0 || values.sellingPrice < 0) return "Pricing cannot be negative.";
  if (!values.modules.length) return "Add at least one module.";
  for (const module of values.modules) {
    if (!module.title.trim()) return "Each module needs a title.";
    if (!module.lessons.length) return `Module ${module.order} needs at least one lesson.`;
    for (const lesson of module.lessons) {
      if (!lesson.title.trim()) return "Each lesson needs a title.";
      if (lesson.lessonType === "recorded" && !lesson.videoUrl.trim()) return "Recorded lessons need a video URL.";
      if (lesson.lessonType === "live" && !lesson.liveUrl.trim()) return "Live lessons need a class link.";
      if (lesson.lessonType === "live" && !lesson.scheduledAt.trim()) return "Live lessons need a scheduled date and time.";
    }
  }
  return "";
}

export function CourseForm({
  open,
  onOpenChange,
  onSubmit,
  instructors,
  isSubmitting,
  title,
  description,
  submitLabel,
  initialValues,
}: CourseFormProps) {
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<CourseFormValues>(cloneDraft(initialValues));
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [error, setError] = useState("");
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const selectedInstructor = instructors.find((instructor) => instructor.id === values.instructorId);
  const selectedInstructorLabel = selectedInstructor ? getInstructorLabel(selectedInstructor) : '';

  useEffect(() => {
    if (open) {
      setValues(cloneDraft(initialValues));
      setThumbnailFile(null);
      setThumbnailPreview(initialValues?.thumbnailUrl || "");
      setStep(1);
      setError("");
    }
  }, [open, initialValues]);

  const totalDiscount = useMemo(() => {
    if (!values.originalPrice || values.originalPrice <= 0) return 0;
    return Math.max(0, Math.round(((values.originalPrice - values.sellingPrice) / values.originalPrice) * 100));
  }, [values.originalPrice, values.sellingPrice]);

  const canAdvance = useMemo(() => {
    if (step === 1) {
      return Boolean(values.title.trim() && values.description.trim() && values.category.trim() && values.instructorId.trim());
    }
    if (step === 2) {
      return values.originalPrice >= 0 && values.sellingPrice >= 0;
    }
    if (step === 3) {
      return !validateRequiredFields(values);
    }
    return true;
  }, [step, values]);

  const updateField = <K extends keyof CourseFormValues>(field: K, value: CourseFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const updateModule = (moduleId: string, field: keyof ModuleDraft, nextValue: string) => {
    setValues((current) => ({
      ...current,
      modules: current.modules.map((module) => (module.id === moduleId ? { ...module, [field]: nextValue } : module)),
    }));
  };

  const updateLesson = (moduleId: string, lessonId: string, field: keyof LessonDraft, nextValue: string) => {
    setValues((current) => ({
      ...current,
      modules: current.modules.map((module) => {
        if (module.id !== moduleId) return module;
        return {
          ...module,
          lessons: module.lessons.map((lesson) => {
            if (lesson.id !== lessonId) return lesson;
            const nextLesson = { ...lesson, [field]: nextValue };
            if (field === "lessonType") {
              if (nextValue === "live") {
                nextLesson.videoUrl = "";
              } else {
                nextLesson.liveUrl = "";
                nextLesson.scheduledAt = "";
              }
            }
            return nextLesson;
          }),
        };
      }),
    }));
  };

  const addModule = () => {
    setValues((current) => ({
      ...current,
      modules: [...current.modules, emptyModule(current.modules.length + 1)],
    }));
  };

  const addLesson = (moduleId: string) => {
    setValues((current) => ({
      ...current,
      modules: current.modules.map((module) =>
        module.id === moduleId
          ? { ...module, lessons: [...module.lessons, emptyLesson(module.lessons.length + 1)] }
          : module
      ),
    }));
  };

  const removeModule = (moduleId: string) => {
    setValues((current) => {
      const next = current.modules.filter((module) => module.id !== moduleId).map((module, index) => ({ ...module, order: index + 1 }));
      return { ...current, modules: next };
    });
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    setValues((current) => ({
      ...current,
      modules: current.modules.map((module) => {
        if (module.id !== moduleId) return module;
        const nextLessons = module.lessons
          .filter((lesson) => lesson.id !== lessonId)
          .map((lesson, index) => ({ ...lesson, order: index + 1 }));
        return { ...module, lessons: nextLessons.length ? nextLessons : [emptyLesson(1)] };
      }),
    }));
  };

  const moveModule = (moduleId: string, direction: -1 | 1) => {
    setValues((current) => {
      const index = current.modules.findIndex((module) => module.id === moduleId);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= current.modules.length) return current;
      const next = [...current.modules];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return { ...current, modules: next.map((module, moduleIndex) => ({ ...module, order: moduleIndex + 1 })) };
    });
  };

  const moveLesson = (moduleId: string, lessonId: string, direction: -1 | 1) => {
    setValues((current) => ({
      ...current,
      modules: current.modules.map((module) => {
        if (module.id !== moduleId) return module;
        const index = module.lessons.findIndex((lesson) => lesson.id === lessonId);
        const targetIndex = index + direction;
        if (index < 0 || targetIndex < 0 || targetIndex >= module.lessons.length) return module;
        const nextLessons = [...module.lessons];
        [nextLessons[index], nextLessons[targetIndex]] = [nextLessons[targetIndex], nextLessons[index]];
        return {
          ...module,
          lessons: nextLessons.map((lesson, lessonIndex) => ({ ...lesson, order: lessonIndex + 1 })),
        };
      }),
    }));
  };

  const handleThumbnailChange = (file?: File) => {
    if (!file) return;
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setThumbnailPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const goNext = () => {
    if (!canAdvance) {
      setError(validateRequiredFields(values));
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, 4));
  };

  const goPrevious = () => {
    setStep((current) => Math.max(current - 1, 1));
    setError("");
  };

  const submit = async () => {
    const validationError = validateRequiredFields(values);
    if (validationError) {
      setError(validationError);
      return;
    }

    await onSubmit(values, thumbnailFile);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
      <DialogContent showCloseButton={false} className="h-[min(92vh,920px)] w-[min(96vw,1240px)] !max-w-[min(96vw,1240px)] overflow-hidden rounded-xl border-border/60 bg-popover p-0 shadow-sm">
        <DialogHeader className="border-b border-border/60 px-6 py-4">
          <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1.5">
              <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">{description}</DialogDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className={cn("rounded-md border-border/60 px-2 py-0.5 text-xs")}>Step {step} of 4</Badge>
              <span>{stepLabels[step - 1]}</span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

            {step === 1 && (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_360px]">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input value={values.title} onChange={(event) => updateField('title', event.target.value)} placeholder="e.g. Advanced React Systems" />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Subtitle</label>
                    <Input value={values.subtitle} onChange={(event) => updateField('subtitle', event.target.value)} placeholder="Short course summary" />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea value={values.description} onChange={(event) => updateField('description', event.target.value)} className="min-h-40" placeholder="Describe the learning outcome and scope." />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Category</label>
                      <Input value={values.category} onChange={(event) => updateField('category', event.target.value)} placeholder="Web Development" />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Instructor</label>
                      <Select value={values.instructorId} onValueChange={(nextValue) => updateField('instructorId', nextValue)}>
                        <SelectTrigger>
                          <SelectValue className="truncate text-left">
                            {selectedInstructorLabel || 'Select instructor'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {instructors.map((instructor) => (
                            <SelectItem key={instructor.id} value={instructor.id}>
                              {getInstructorLabel(instructor)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
                  <div>
                    <label className="text-sm font-medium">Thumbnail</label>
                    <p className="mt-1 text-sm text-muted-foreground">Use a clean 16:9 cover image. Upload or paste a public URL.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="flex h-48 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-border/60 bg-background text-muted-foreground transition-colors hover:border-border hover:bg-muted/30"
                  >
                    {thumbnailPreview ? <img src={thumbnailPreview} alt="Thumbnail preview" className="h-full w-full object-cover" /> : <ImagePlus className="h-8 w-8" />}
                  </button>

                  <Input ref={thumbnailInputRef} type="file" accept="image/*" onChange={(event) => handleThumbnailChange(event.target.files?.[0] || null)} className="hidden" />
                  <Input value={values.thumbnailUrl} onChange={(event) => updateField('thumbnailUrl', event.target.value)} placeholder="Or paste thumbnail URL" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Original price</label>
                  <Input type="number" min="0" step="1" value={values.originalPrice} onChange={(event) => updateField('originalPrice', Number(event.target.value))} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Selling price</label>
                  <Input type="number" min="0" step="1" value={values.sellingPrice} onChange={(event) => updateField('sellingPrice', Number(event.target.value))} />
                </div>
                  <div className="md:col-span-2 rounded-xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium">Discount</div>
                      <div className="text-sm text-muted-foreground">Calculated automatically from the two prices.</div>
                    </div>
                    <Badge variant="outline" className="rounded-md border-border/60 px-3 py-1 text-sm font-medium">{totalDiscount}% off</Badge>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-medium">Structure</h3>
                    <p className="text-sm text-muted-foreground">Build modules and lessons for the curriculum.</p>
                  </div>
                  <Button type="button" variant="outline" className="gap-2 rounded-lg" onClick={addModule}>
                    <Plus className="h-4 w-4" /> Add module
                  </Button>
                </div>

                <div className="space-y-4">
                  {values.modules.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">No modules added yet.</div>
                  ) : (
                    values.modules.map((module, moduleIndex) => (
                      <div key={module.id} className="rounded-xl border border-border/60 bg-card p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div className="flex-1">
                            <label className="text-sm font-medium">Module {moduleIndex + 1}</label>
                            <Input value={module.title} onChange={(event) => updateModule(module.id, 'title', event.target.value)} placeholder="Module title" className="mt-2" />
                          </div>
                          <div className="flex items-center gap-1">
                            <Button type="button" variant="ghost" size="icon" onClick={() => moveModule(module.id, -1)} disabled={moduleIndex === 0}>
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" onClick={() => moveModule(module.id, 1)} disabled={moduleIndex === values.modules.length - 1}>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" onClick={() => addLesson(module.id)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeModule(module.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3 pl-0 md:pl-4">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div key={lesson.id} className="rounded-lg border border-border/60 bg-muted/20 p-3">
                              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div className="flex-1 space-y-3">
                                  <div className="grid gap-2 md:grid-cols-2">
                                    <Input value={lesson.title} onChange={(event) => updateLesson(module.id, lesson.id, 'title', event.target.value)} placeholder={`Lesson ${lessonIndex + 1} title`} />
                                    <Input value={lesson.duration} onChange={(event) => updateLesson(module.id, lesson.id, 'duration', event.target.value)} placeholder="Duration e.g. 18 min" />
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
                                    <Input value={lesson.videoUrl} onChange={(event) => updateLesson(module.id, lesson.id, 'videoUrl', event.target.value)} placeholder="Video URL" />
                                  ) : (
                                    <div className="grid gap-3 md:grid-cols-2">
                                      <Input value={lesson.liveUrl} onChange={(event) => updateLesson(module.id, lesson.id, 'liveUrl', event.target.value)} placeholder="Live class link" />
                                      <Input type="datetime-local" value={lesson.scheduledAt} onChange={(event) => updateLesson(module.id, lesson.id, 'scheduledAt', event.target.value)} />
                                    </div>
                                  )}
                                  <Textarea value={lesson.notes} onChange={(event) => updateLesson(module.id, lesson.id, 'notes', event.target.value)} placeholder="Lesson notes, resources, or outline" className="min-h-24" />
                                </div>
                                <div className="flex items-center gap-1 md:pt-1">
                                  <Button type="button" variant="ghost" size="icon" onClick={() => moveLesson(module.id, lesson.id, -1)} disabled={lessonIndex === 0}>
                                    <ChevronLeft className="h-4 w-4" />
                                  </Button>
                                  <Button type="button" variant="ghost" size="icon" onClick={() => moveLesson(module.id, lesson.id, 1)} disabled={lessonIndex === module.lessons.length - 1}>
                                    <ChevronRight className="h-4 w-4" />
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
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={values.status} onValueChange={(nextValue) => updateField('status', nextValue as CourseFormValues['status'])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Visibility</label>
                  <Select value={values.visibility} onValueChange={(nextValue) => updateField('visibility', nextValue as CourseFormValues['visibility'])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Public">Public</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 rounded-xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium">Course health</div>
                      <div className="text-sm text-muted-foreground">Review the draft before publishing.</div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4" />
                      Ready to save
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
          <Button type="button" variant="outline" className="gap-2 rounded-lg" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button type="button" variant="outline" className="gap-2 rounded-lg" onClick={goPrevious} disabled={isSubmitting}>
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
            )}
            {step < 4 ? (
              <Button type="button" className="gap-2 rounded-lg" onClick={goNext} disabled={isSubmitting || !canAdvance}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" className="gap-2 rounded-lg" onClick={submit} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {submitLabel}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}