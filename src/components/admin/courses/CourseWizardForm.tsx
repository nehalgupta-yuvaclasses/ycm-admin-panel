import { useEffect, useMemo, useRef, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  CourseAccessMode,
  CourseAssessmentMode,
  CourseDripMode,
  CourseEnrollmentMode,
  CourseFormValues,
  CourseLifecycleStage,
  CourseType,
  InstructorOption,
  LessonDraft,
  ModuleDraft,
  SubjectDraft,
} from "./types";

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

const stepMeta = [
  { title: "Basic Info", description: "Identity, category, and ownership." },
  { title: "Media & Branding", description: "Visual assets and brand surface." },
  { title: "Pricing & Access", description: "Monetization and audience rules." },
  { title: "Curriculum Builder", description: "Subjects, modules, and lessons." },
  { title: "Tests & Assignments", description: "Assessment policy and linkage rules." },
  { title: "Course Settings", description: "Drip, certificates, analytics, instructors." },
  { title: "Publish", description: "Lifecycle, release timing, and final review." },
] as const;

const defaultValues: CourseFormValues = {
  title: "",
  subtitle: "",
  description: "",
  category: "General",
  instructorId: "",
  coInstructorIds: [],
  courseType: "Hybrid",
  lifecycleStage: "Draft",
  accessMode: "Open",
  enrollmentMode: "SelfEnroll",
  thumbnailUrl: "",
  coverImageUrl: "",
  brandColor: "#111827",
  originalPrice: 0,
  sellingPrice: 0,
  dripEnabled: false,
  dripMode: "Sequential",
  dripIntervalDays: 7,
  certificateEnabled: false,
  certificateTemplate: "",
  assessmentMode: "PerSubject",
  completionThreshold: 80,
  assessmentNotes: "",
  analyticsEnabled: false,
  analyticsEventKey: "",
  publishAt: "",
  archivedAt: "",
  status: "Draft",
  visibility: "Public",
  subjects: [],
};

function createLesson(order: number, lessonType: "recorded" | "live" = "recorded"): LessonDraft {
  return {
    id: crypto.randomUUID(),
    title: "",
    lessonType,
    contentType: lessonType,
    videoUrl: "",
    liveUrl: "",
    scheduledAt: "",
    isLive: false,
    liveStartedAt: "",
    liveEndedAt: "",
    liveBy: "",
    notes: "",
    duration: "",
    resourceUrl: "",
    isPreview: false,
    unlockAfterDays: 0,
    assessmentTestId: undefined,
    completionRequired: true,
    publishedAt: "",
    order,
  };
}

function createModule(order: number): ModuleDraft {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    moduleType: "content",
    dripDaysAfterSubject: 0,
    order,
    lessons: [createLesson(1)],
  };
}

function createSubject(order: number): SubjectDraft {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    order,
    modules: [createModule(1)],
  };
}

function createDefaultValues(): CourseFormValues {
  return {
    ...defaultValues,
    subjects: [createSubject(1)],
  };
}

function cloneLesson(lesson: Partial<LessonDraft>, lessonIndex: number): LessonDraft {
  return {
    ...createLesson(lessonIndex + 1, lesson.lessonType === "live" ? "live" : "recorded"),
    ...lesson,
    lessonType: lesson.lessonType === "live" ? "live" : "recorded",
    contentType: lesson.contentType || (lesson.lessonType === "live" ? "live" : "recorded"),
    videoUrl: lesson.videoUrl || "",
    liveUrl: lesson.liveUrl || "",
    scheduledAt: lesson.scheduledAt || "",
    notes: lesson.notes || "",
    duration: lesson.duration || "",
    resourceUrl: lesson.resourceUrl || "",
    isPreview: Boolean(lesson.isPreview),
    unlockAfterDays: Number.isFinite(Number(lesson.unlockAfterDays)) ? Number(lesson.unlockAfterDays) : 0,
    completionRequired: lesson.completionRequired ?? true,
    publishedAt: lesson.publishedAt || "",
    order: lesson.order ?? lessonIndex + 1,
  };
}

function cloneDraft(values?: Partial<CourseFormValues>): CourseFormValues {
  const subjects = values?.subjects?.length ? values.subjects : createDefaultValues().subjects;

  return {
    ...createDefaultValues(),
    ...values,
    coInstructorIds: values?.coInstructorIds || [],
    subjects: subjects.map((subject, subjectIndex) => ({
      id: subject.id || crypto.randomUUID(),
      name: subject.name || "",
      description: subject.description || "",
      order: subject.order ?? subjectIndex + 1,
      modules: (subject.modules || []).map((module, moduleIndex) => ({
        id: module.id || crypto.randomUUID(),
        title: module.title || "",
        description: module.description || "",
        moduleType: module.moduleType || "content",
        dripDaysAfterSubject: module.dripDaysAfterSubject ?? 0,
        order: module.order ?? moduleIndex + 1,
        lessons: (module.lessons || []).map((lesson, lessonIndex) => cloneLesson(lesson, lessonIndex)),
      })),
    })),
  };
}

function getInstructorLabel(instructor: InstructorOption) {
  return instructor.name || instructor.email || "Instructor";
}

function validateStep(values: CourseFormValues, step: number) {
  if (step === 1) {
    if (!values.title.trim()) return "Course title is required.";
    if (!values.description.trim()) return "Course description is required.";
    if (!values.category.trim()) return "Category is required.";
    if (!values.instructorId.trim()) return "A lead instructor is required.";
  }

  if (step === 2) {
    if (values.brandColor && !/^#([0-9a-fA-F]{3}){1,2}$/.test(values.brandColor.trim())) {
      return "Brand color must be a valid hex code.";
    }
  }

  if (step === 3) {
    if (values.originalPrice < 0 || values.sellingPrice < 0) return "Pricing cannot be negative.";
    if (values.originalPrice > 0 && values.sellingPrice > values.originalPrice) return "Selling price cannot exceed the original price.";
    if (values.dripEnabled && values.dripIntervalDays < 0) return "Drip interval must be zero or positive.";
  }

  if (step === 4) {
    if (!values.subjects.length) return "Add at least one subject.";
    for (const subject of values.subjects) {
      if (!subject.name.trim()) return "Each subject needs a title.";
      if (!subject.modules.length) return `Subject ${subject.order} needs at least one module.`;
      for (const module of subject.modules) {
        if (!module.title.trim()) return "Each module needs a title.";
        if (!module.lessons.length) return `Module ${module.order} needs at least one lesson.`;
        for (const lesson of module.lessons) {
          if (!lesson.title.trim()) return "Each lesson needs a title.";
          if (lesson.lessonType === "live") {
            if (!lesson.liveUrl.trim()) return "Live lessons need a meeting link.";
            if (!lesson.scheduledAt.trim()) return "Live lessons need a scheduled time.";
          }
          if (lesson.contentType === "recorded" && !lesson.videoUrl.trim()) return "Recorded lessons need a video URL.";
          if (lesson.contentType === "document" && !lesson.resourceUrl.trim()) return "Document lessons need a resource URL.";
          if ((lesson.contentType === "quiz" || lesson.contentType === "assignment") && !lesson.notes.trim() && !lesson.resourceUrl.trim()) {
            return "Assessments need notes or a resource link.";
          }
        }
      }
    }
  }

  if (step === 5) {
    if (values.assessmentMode !== "None" && !values.subjects.length) return "Assessment linkage needs at least one subject.";
    if (values.completionThreshold < 0 || values.completionThreshold > 100) return "Completion threshold must be between 0 and 100.";
  }

  if (step === 6) {
    if (values.certificateEnabled && !values.certificateTemplate.trim()) return "Certificate template is required when certificates are enabled.";
    if (values.analyticsEnabled && !values.analyticsEventKey.trim()) return "Analytics event key is required when analytics are enabled.";
  }

  if (step === 7) {
    if (values.lifecycleStage === "Published" && values.status !== "Published") {
      return "Publish state must be set to Published before the course can go live.";
    }
  }

  return "";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
}

function formatPercentage(value: number) {
  if (!Number.isFinite(value)) return "0%";
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
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

  useEffect(() => {
    if (!open) return;
    setValues(cloneDraft(initialValues));
    setThumbnailFile(null);
    setThumbnailPreview(initialValues?.thumbnailUrl || "");
    setStep(1);
    setError("");
  }, [open, initialValues]);

  const selectedInstructor = instructors.find((instructor) => instructor.id === values.instructorId);
  const selectedCoInstructors = instructors.filter((instructor) => values.coInstructorIds.includes(instructor.id));

  const summary = useMemo(() => {
    const subjectCount = values.subjects.length;
    const moduleCount = values.subjects.reduce((count, subject) => count + subject.modules.length, 0);
    const lessonCount = values.subjects.reduce((count, subject) => count + subject.modules.reduce((moduleCount, module) => moduleCount + module.lessons.length, 0), 0);
    const totalDiscount = values.originalPrice > 0 ? Math.max(0, Math.round(((values.originalPrice - values.sellingPrice) / values.originalPrice) * 100)) : 0;

    return {
      subjectCount,
      moduleCount,
      lessonCount,
      totalDiscount,
    };
  }, [values]);

  const canAdvance = useMemo(() => !validateStep(values, step), [step, values]);

  const updateField = <K extends keyof CourseFormValues>(field: K, value: CourseFormValues[K]) => {
    setValues((current) => {
      const next = { ...current, [field]: value };

      if (field === "instructorId") {
        next.coInstructorIds = current.coInstructorIds.filter((instructorId) => instructorId !== value);
      }

      return next;
    });
    setError("");
  };

  const updateSubject = (subjectId: string, field: keyof SubjectDraft, value: string) => {
    setValues((current) => ({
      ...current,
      subjects: current.subjects.map((subject) => (subject.id === subjectId ? { ...subject, [field]: value } : subject)),
    }));
    setError("");
  };

  const updateModule = (subjectId: string, moduleId: string, field: keyof ModuleDraft, value: string | number) => {
    setValues((current) => ({
      ...current,
      subjects: current.subjects.map((subject) => {
        if (subject.id !== subjectId) return subject;
        return {
          ...subject,
          modules: subject.modules.map((module) => (module.id === moduleId ? { ...module, [field]: value } : module)),
        };
      }),
    }));
    setError("");
  };

  const updateLesson = (subjectId: string, moduleId: string, lessonId: string, field: keyof LessonDraft, value: string | boolean | number) => {
    setValues((current) => ({
      ...current,
      subjects: current.subjects.map((subject) => {
        if (subject.id !== subjectId) return subject;
        return {
          ...subject,
          modules: subject.modules.map((module) => {
            if (module.id !== moduleId) return module;
            return {
              ...module,
              lessons: module.lessons.map((lesson) => {
                if (lesson.id !== lessonId) return lesson;
                const nextLesson = { ...lesson, [field]: value } as LessonDraft;
                if (field === "lessonType") {
                  if (value === "live") {
                    nextLesson.contentType = "live";
                    nextLesson.videoUrl = "";
                  } else {
                    nextLesson.liveUrl = "";
                    nextLesson.scheduledAt = "";
                    if (nextLesson.contentType === "live") {
                      nextLesson.contentType = "recorded";
                    }
                  }
                }
                if (field === "contentType" && value !== "live") {
                  nextLesson.lessonType = value === "recorded" || value === "document" ? "recorded" : nextLesson.lessonType;
                  if (value === "recorded") {
                    nextLesson.liveUrl = "";
                    nextLesson.scheduledAt = "";
                  }
                }
                return nextLesson;
              }),
            };
          }),
        };
      }),
    }));
    setError("");
  };

  const addSubject = () => {
    setValues((current) => ({ ...current, subjects: [...current.subjects, createSubject(current.subjects.length + 1)] }));
  };

  const addModule = (subjectId: string) => {
    setValues((current) => ({
      ...current,
      subjects: current.subjects.map((subject) => {
        if (subject.id !== subjectId) return subject;
        return { ...subject, modules: [...subject.modules, createModule(subject.modules.length + 1)] };
      }),
    }));
  };

  const addLesson = (subjectId: string, moduleId: string) => {
    setValues((current) => ({
      ...current,
      subjects: current.subjects.map((subject) => {
        if (subject.id !== subjectId) return subject;
        return {
          ...subject,
          modules: subject.modules.map((module) =>
            module.id === moduleId
              ? { ...module, lessons: [...module.lessons, createLesson(module.lessons.length + 1, module.moduleType === "live" ? "live" : "recorded")] }
              : module,
          ),
        };
      }),
    }));
  };

  const removeSubject = (subjectId: string) => {
    setValues((current) => {
      const nextSubjects = current.subjects.filter((subject) => subject.id !== subjectId).map((subject, index) => ({ ...subject, order: index + 1 }));
      return { ...current, subjects: nextSubjects.length ? nextSubjects : [createSubject(1)] };
    });
  };

  const removeModule = (subjectId: string, moduleId: string) => {
    setValues((current) => ({
      ...current,
      subjects: current.subjects.map((subject) => {
        if (subject.id !== subjectId) return subject;
        const nextModules = subject.modules.filter((module) => module.id !== moduleId).map((module, index) => ({ ...module, order: index + 1 }));
        return { ...subject, modules: nextModules.length ? nextModules : [createModule(1)] };
      }),
    }));
  };

  const removeLesson = (subjectId: string, moduleId: string, lessonId: string) => {
    setValues((current) => ({
      ...current,
      subjects: current.subjects.map((subject) => {
        if (subject.id !== subjectId) return subject;
        return {
          ...subject,
          modules: subject.modules.map((module) => {
            if (module.id !== moduleId) return module;
            const nextLessons = module.lessons.filter((lesson) => lesson.id !== lessonId).map((lesson, index) => ({ ...lesson, order: index + 1 }));
            return { ...module, lessons: nextLessons.length ? nextLessons : [createLesson(1)] };
          }),
        };
      }),
    }));
  };

  const moveSubject = (subjectId: string, direction: -1 | 1) => {
    setValues((current) => {
      const index = current.subjects.findIndex((subject) => subject.id === subjectId);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= current.subjects.length) return current;
      const next = [...current.subjects];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return { ...current, subjects: next.map((subject, subjectIndex) => ({ ...subject, order: subjectIndex + 1 })) };
    });
  };

  const moveModule = (subjectId: string, moduleId: string, direction: -1 | 1) => {
    setValues((current) => ({
      ...current,
      subjects: current.subjects.map((subject) => {
        if (subject.id !== subjectId) return subject;
        const index = subject.modules.findIndex((module) => module.id === moduleId);
        const targetIndex = index + direction;
        if (index < 0 || targetIndex < 0 || targetIndex >= subject.modules.length) return subject;
        const next = [...subject.modules];
        [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
        return { ...subject, modules: next.map((module, moduleIndex) => ({ ...module, order: moduleIndex + 1 })) };
      }),
    }));
  };

  const moveLesson = (subjectId: string, moduleId: string, lessonId: string, direction: -1 | 1) => {
    setValues((current) => ({
      ...current,
      subjects: current.subjects.map((subject) => {
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
      }),
    }));
  };

  const toggleCoInstructor = (instructorId: string) => {
    if (instructorId === values.instructorId) return;

    setValues((current) => {
      const exists = current.coInstructorIds.includes(instructorId);
      return {
        ...current,
        coInstructorIds: exists ? current.coInstructorIds.filter((currentId) => currentId !== instructorId) : [...current.coInstructorIds, instructorId],
      };
    });
  };

  const handleThumbnailChange = (file?: File) => {
    if (!file) return;
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setThumbnailPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const goNext = () => {
    const validationError = validateStep(values, step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, stepMeta.length));
  };

  const goPrevious = () => {
    setError("");
    setStep((current) => Math.max(current - 1, 1));
  };

  const submit = async () => {
    const validationError = validateStep(values, step);
    if (validationError) {
      setError(validationError);
      return;
    }

    await onSubmit(values, thumbnailFile);
    onOpenChange(false);
  };

  const visibleInstructors = instructors.filter((instructor) => instructor.id !== values.instructorId);

  const renderSubject = (subject: SubjectDraft, subjectIndex: number) => (
    <AccordionItem key={subject.id} value={subject.id} className="rounded-xl border border-border/60 bg-card px-4">
      <AccordionTrigger className="py-4 no-underline hover:no-underline">
        <div className="flex flex-1 flex-col gap-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Subject {subjectIndex + 1}</span>
            <Badge variant="outline" className="rounded-md border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em]">
              {subject.modules.length} modules
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">{subject.name || "Untitled subject"}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-2">
        <div className="space-y-4 pb-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Subject title</label>
              <Input value={subject.name} onChange={(event) => updateSubject(subject.id, "name", event.target.value)} placeholder="e.g. Fundamentals" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Order</label>
              <Input value={String(subject.order)} disabled />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Subject description</label>
            <Textarea value={subject.description} onChange={(event) => updateSubject(subject.id, "description", event.target.value)} placeholder="Short guide to what this subject covers." className="min-h-24" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="gap-2 rounded-lg" onClick={() => addModule(subject.id)}>
              <span className="text-base leading-none">+</span> Add module
            </Button>
            <Button type="button" variant="ghost" className="gap-2 rounded-lg text-destructive hover:text-destructive" onClick={() => removeSubject(subject.id)}>
              <span className="text-base leading-none">×</span> Remove subject
            </Button>
            <Button type="button" variant="ghost" className="gap-2 rounded-lg" onClick={() => moveSubject(subject.id, -1)} disabled={subjectIndex === 0}>
              Move up
            </Button>
            <Button type="button" variant="ghost" className="gap-2 rounded-lg" onClick={() => moveSubject(subject.id, 1)} disabled={subjectIndex === values.subjects.length - 1}>
              Move down
            </Button>
          </div>

          <div className="space-y-3">
            {subject.modules.map((module, moduleIndex) => (
              <div key={module.id} className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                      <span>Module {moduleIndex + 1}</span>
                      <Badge variant="outline" className="rounded-md border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em]">
                        {module.moduleType}
                      </Badge>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input value={module.title} onChange={(event) => updateModule(subject.id, module.id, "title", event.target.value)} placeholder="Module title" />
                      <Input value={String(module.order)} disabled placeholder="Order" />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input value={module.description} onChange={(event) => updateModule(subject.id, module.id, "description", event.target.value)} placeholder="Module summary" />
                      <Select value={module.moduleType} onValueChange={(value) => updateModule(subject.id, module.id, "moduleType", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Module type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="content">Content</SelectItem>
                          <SelectItem value="assessment">Assessment</SelectItem>
                          <SelectItem value="live">Live</SelectItem>
                          <SelectItem value="resource">Resource</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2 md:max-w-[220px]">
                      <label className="text-sm font-medium">Drip days after subject</label>
                      <Input type="number" min={0} value={String(module.dripDaysAfterSubject)} onChange={(event) => updateModule(subject.id, module.id, "dripDaysAfterSubject", Number(event.target.value || 0))} />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Button type="button" variant="outline" className="gap-2 rounded-lg" onClick={() => addLesson(subject.id, module.id)}>
                      <span className="text-base leading-none">+</span> Add lesson
                    </Button>
                    <Button type="button" variant="ghost" className="rounded-lg" onClick={() => moveModule(subject.id, module.id, -1)} disabled={moduleIndex === 0}>
                      Up
                    </Button>
                    <Button type="button" variant="ghost" className="rounded-lg" onClick={() => moveModule(subject.id, module.id, 1)} disabled={moduleIndex === subject.modules.length - 1}>
                      Down
                    </Button>
                    <Button type="button" variant="ghost" className="rounded-lg text-destructive hover:text-destructive" onClick={() => removeModule(subject.id, module.id)}>
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <div key={lesson.id} className="rounded-lg border border-border/60 bg-card p-3">
                      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                            <span>Lesson {lessonIndex + 1}</span>
                            {lesson.isPreview ? <Badge className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-emerald-700">Preview</Badge> : null}
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <Input value={lesson.title} onChange={(event) => updateLesson(subject.id, module.id, lesson.id, "title", event.target.value)} placeholder="Lesson title" />
                            <Input value={lesson.duration} onChange={(event) => updateLesson(subject.id, module.id, lesson.id, "duration", event.target.value)} placeholder="Duration" />
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <Select value={lesson.lessonType} onValueChange={(value) => updateLesson(subject.id, module.id, lesson.id, "lessonType", value as LessonDraft["lessonType"]) }>
                              <SelectTrigger>
                                <SelectValue placeholder="Lesson type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="recorded">Recorded</SelectItem>
                                <SelectItem value="live">Live</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={lesson.contentType} onValueChange={(value) => updateLesson(subject.id, module.id, lesson.id, "contentType", value as LessonDraft["contentType"]) }>
                              <SelectTrigger>
                                <SelectValue placeholder="Content type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="recorded">Recorded video</SelectItem>
                                <SelectItem value="live">Live session</SelectItem>
                                <SelectItem value="document">Document</SelectItem>
                                <SelectItem value="quiz">Quiz</SelectItem>
                                <SelectItem value="assignment">Assignment</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <Input value={lesson.resourceUrl} onChange={(event) => updateLesson(subject.id, module.id, lesson.id, "resourceUrl", event.target.value)} placeholder="Resource / attachment URL" />
                            <Input type="number" min={0} value={String(lesson.unlockAfterDays)} onChange={(event) => updateLesson(subject.id, module.id, lesson.id, "unlockAfterDays", Number(event.target.value || 0))} placeholder="Unlock after days" />
                          </div>

                          {lesson.lessonType === "live" ? (
                            <div className="grid gap-3 md:grid-cols-2">
                              <Input value={lesson.liveUrl} onChange={(event) => updateLesson(subject.id, module.id, lesson.id, "liveUrl", event.target.value)} placeholder="Meeting link" />
                              <Input type="datetime-local" value={lesson.scheduledAt} onChange={(event) => updateLesson(subject.id, module.id, lesson.id, "scheduledAt", event.target.value)} />
                            </div>
                          ) : (
                            <Input value={lesson.videoUrl} onChange={(event) => updateLesson(subject.id, module.id, lesson.id, "videoUrl", event.target.value)} placeholder="Video URL" />
                          )}

                          <Textarea value={lesson.notes} onChange={(event) => updateLesson(subject.id, module.id, lesson.id, "notes", event.target.value)} placeholder="Lesson notes or instructions" className="min-h-24" />

                          <div className="flex flex-wrap items-center gap-4">
                            <label className="flex items-center gap-2 text-sm">
                              <Switch checked={lesson.isPreview} onCheckedChange={(checked) => updateLesson(subject.id, module.id, lesson.id, "isPreview", checked)} />
                              Preview lesson
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                              <Switch checked={lesson.completionRequired} onCheckedChange={(checked) => updateLesson(subject.id, module.id, lesson.id, "completionRequired", checked)} />
                              Completion required
                            </label>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 xl:items-end">
                          <div className="flex items-center gap-1">
                            <Button type="button" variant="ghost" size="icon" onClick={() => moveLesson(subject.id, module.id, lesson.id, -1)} disabled={lessonIndex === 0}>
                              ↑
                            </Button>
                            <Button type="button" variant="ghost" size="icon" onClick={() => moveLesson(subject.id, module.id, lesson.id, 1)} disabled={lessonIndex === module.lessons.length - 1}>
                              ↓
                            </Button>
                            <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeLesson(subject.id, module.id, lesson.id)}>
                              ×
                            </Button>
                          </div>
                          <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                            {lesson.lessonType === "live" ? "Live lesson" : "Recorded lesson"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );

  const renderRightRail = () => (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">Course Snapshot</p>
            <p className="text-xs text-muted-foreground">Live values from this wizard</p>
          </div>
          <Badge variant="outline" className="rounded-full border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em]">
            Step {step}/7
          </Badge>
        </div>

        <div className="space-y-2">
          <SummaryRow label="Subjects" value={String(summary.subjectCount)} />
          <SummaryRow label="Modules" value={String(summary.moduleCount)} />
          <SummaryRow label="Lessons" value={String(summary.lessonCount)} />
          <SummaryRow label="Price" value={`${formatCurrency(values.originalPrice)} / ${formatCurrency(values.sellingPrice)}`} />
          <SummaryRow label="Discount" value={formatPercentage(summary.totalDiscount)} />
          <SummaryRow label="Course type" value={values.courseType} />
          <SummaryRow label="Lifecycle" value={values.lifecycleStage} />
          <SummaryRow label="Assessment" value={values.assessmentMode} />
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-4">
        <p className="text-sm font-semibold text-foreground">Instructor roster</p>
        <p className="mt-1 text-xs text-muted-foreground">Lead instructor plus co-instructors are stored separately for scaling.</p>

        <div className="mt-3 space-y-2">
          <SummaryRow label="Lead" value={selectedInstructor ? getInstructorLabel(selectedInstructor) : "Unassigned"} />
          <SummaryRow label="Co-instructors" value={String(selectedCoInstructors.length)} />
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-4">
        <p className="text-sm font-semibold text-foreground">Publishing guardrails</p>
        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          <p>Publish only after the curriculum is populated and the publication state is set to Published.</p>
          <p>Drip, certificate, and analytics settings are stored on the course record to keep the rollout deterministic.</p>
        </div>
      </div>
    </div>
  );

  const currentError = error;
  const footerButtonLabel = step === stepMeta.length ? submitLabel : "Continue";

  return (
    <Dialog open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
      <DialogContent showCloseButton={false} className="h-[min(95vh,980px)] w-[min(96vw,1360px)] !max-w-[min(96vw,1360px)] overflow-hidden rounded-2xl border-border/60 bg-popover p-0 shadow-2xl">
        <DialogHeader className="border-b border-border/60 px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1.5">
              <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
              <DialogDescription className="max-w-2xl text-sm text-muted-foreground">{description}</DialogDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="rounded-full border-border/60 px-2.5 py-0.5 text-xs">Step {step} of 7</Badge>
              <span>{stepMeta[step - 1].title}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2 overflow-x-auto">
            {stepMeta.map((entry, index) => (
              <div
                key={entry.title}
                className={cn(
                  "min-w-[120px] rounded-lg border px-3 py-2 text-left transition-colors",
                  index + 1 === step ? "border-primary/40 bg-primary/5" : "border-border/60 bg-background/60",
                )}
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">0{index + 1}</div>
                <div className="mt-1 text-sm font-medium text-foreground">{entry.title}</div>
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="grid flex-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              {currentError ? <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{currentError}</div> : null}

              {step === 1 ? (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_320px]">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Course title</label>
                      <Input value={values.title} onChange={(event) => updateField("title", event.target.value)} placeholder="e.g. Advanced React Systems" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Subtitle</label>
                      <Input value={values.subtitle} onChange={(event) => updateField("subtitle", event.target.value)} placeholder="Short summary shown in the catalog" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea value={values.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Describe outcomes, audience, and the core promise." className="min-h-40" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Category</label>
                        <Input value={values.category} onChange={(event) => updateField("category", event.target.value)} placeholder="Web Development" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Lead instructor</label>
                        <Select value={values.instructorId} onValueChange={(value) => updateField("instructorId", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select instructor" />
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
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Course type</label>
                        <Select value={values.courseType} onValueChange={(value) => updateField("courseType", value as CourseType)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Course type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Live">Live</SelectItem>
                            <SelectItem value="Recorded">Recorded</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Lifecycle stage</label>
                        <Select value={values.lifecycleStage} onValueChange={(value) => updateField("lifecycleStage", value as CourseLifecycleStage)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Lifecycle" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Review">Review</SelectItem>
                            <SelectItem value="Published">Published</SelectItem>
                            <SelectItem value="Archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Visibility</label>
                        <Select value={values.visibility} onValueChange={(value) => updateField("visibility", value as CourseFormValues["visibility"])}>
                          <SelectTrigger>
                            <SelectValue placeholder="Visibility" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Public">Public</SelectItem>
                            <SelectItem value="Private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-sm font-semibold text-foreground">Ownership</p>
                    <SummaryRow label="Lead instructor" value={selectedInstructor ? getInstructorLabel(selectedInstructor) : "Unassigned"} />
                    <SummaryRow label="Category" value={values.category || "General"} />
                    <SummaryRow label="Course type" value={values.courseType} />
                    <SummaryRow label="Lifecycle" value={values.lifecycleStage} />
                    <SummaryRow label="Visibility" value={values.visibility} />
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_320px]">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Thumbnail image</label>
                      <div className="flex flex-col gap-4 rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-start">
                        <button
                          type="button"
                          onClick={() => thumbnailInputRef.current?.click()}
                          className="flex h-28 w-full max-w-[220px] items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-background text-muted-foreground transition-colors hover:bg-muted/50"
                        >
                          {thumbnailPreview ? <img src={thumbnailPreview} alt="Thumbnail preview" className="h-full w-full object-cover" /> : <span>Click to upload</span>}
                        </button>
                        <div className="flex-1 space-y-3">
                          <Input ref={thumbnailInputRef} type="file" accept="image/*" onChange={(event) => handleThumbnailChange(event.target.files?.[0])} />
                          <Input value={values.thumbnailUrl} onChange={(event) => updateField("thumbnailUrl", event.target.value)} placeholder="Or paste a thumbnail URL" />
                          <p className="text-xs text-muted-foreground">Use a clean 16:9 asset. The upload path is stored on the course record.</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Cover image URL</label>
                      <Input value={values.coverImageUrl} onChange={(event) => updateField("coverImageUrl", event.target.value)} placeholder="Optional banner or hero image URL" />
                    </div>

                    <div className="grid gap-2 sm:max-w-[220px]">
                      <label className="text-sm font-medium">Brand color</label>
                      <Input value={values.brandColor} onChange={(event) => updateField("brandColor", event.target.value)} placeholder="#111827" />
                    </div>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-sm font-semibold text-foreground">Branding preview</p>
                    <SummaryRow label="Thumbnail" value={values.thumbnailUrl ? "Configured" : "Optional"} />
                    <SummaryRow label="Cover" value={values.coverImageUrl ? "Configured" : "Optional"} />
                    <SummaryRow label="Brand color" value={values.brandColor || "#111827"} />
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_320px]">
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Original price</label>
                        <Input type="number" min={0} value={String(values.originalPrice)} onChange={(event) => updateField("originalPrice", Number(event.target.value || 0))} />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Selling price</label>
                        <Input type="number" min={0} value={String(values.sellingPrice)} onChange={(event) => updateField("sellingPrice", Number(event.target.value || 0))} />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Access mode</label>
                        <Select value={values.accessMode} onValueChange={(value) => updateField("accessMode", value as CourseAccessMode)}>
                          <SelectTrigger><SelectValue placeholder="Access mode" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Open">Open</SelectItem>
                            <SelectItem value="InviteOnly">Invite only</SelectItem>
                            <SelectItem value="Approval">Approval</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Enrollment mode</label>
                        <Select value={values.enrollmentMode} onValueChange={(value) => updateField("enrollmentMode", value as CourseEnrollmentMode)}>
                          <SelectTrigger><SelectValue placeholder="Enrollment mode" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SelfEnroll">Self enroll</SelectItem>
                            <SelectItem value="Manual">Manual</SelectItem>
                            <SelectItem value="Cohort">Cohort</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Visibility</label>
                        <Select value={values.visibility} onValueChange={(value) => updateField("visibility", value as CourseFormValues["visibility"])}>
                          <SelectTrigger><SelectValue placeholder="Visibility" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Public">Public</SelectItem>
                            <SelectItem value="Private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-3 rounded-xl border border-border/60 bg-card p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div>
                        <p className="text-sm font-medium">Drip release</p>
                        <p className="text-xs text-muted-foreground">Enable controlled lesson unlocks for sequential cohorts.</p>
                      </div>
                      <Switch checked={values.dripEnabled} onCheckedChange={(checked) => updateField("dripEnabled", checked)} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Drip mode</label>
                        <Select value={values.dripMode} onValueChange={(value) => updateField("dripMode", value as CourseDripMode)}>
                          <SelectTrigger><SelectValue placeholder="Drip mode" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Immediate">Immediate</SelectItem>
                            <SelectItem value="Scheduled">Scheduled</SelectItem>
                            <SelectItem value="Sequential">Sequential</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Drip interval (days)</label>
                        <Input type="number" min={0} value={String(values.dripIntervalDays)} onChange={(event) => updateField("dripIntervalDays", Number(event.target.value || 0))} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-sm font-semibold text-foreground">Pricing summary</p>
                    <SummaryRow label="Original" value={formatCurrency(values.originalPrice)} />
                    <SummaryRow label="Selling" value={formatCurrency(values.sellingPrice)} />
                    <SummaryRow label="Discount" value={formatPercentage(summary.totalDiscount)} />
                    <SummaryRow label="Access" value={values.accessMode} />
                    <SummaryRow label="Enrollment" value={values.enrollmentMode} />
                  </div>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Curriculum tree</p>
                      <p className="text-xs text-muted-foreground">Subjects collapse by default so large courses stay readable on mobile.</p>
                    </div>
                    <Button type="button" variant="outline" className="gap-2 rounded-lg" onClick={addSubject}>
                      <span className="text-base leading-none">+</span> Add subject
                    </Button>
                  </div>

                  <Accordion type="multiple" className="space-y-3">
                    {values.subjects.map(renderSubject)}
                  </Accordion>
                </div>
              ) : null}

              {step === 5 ? (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_320px]">
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Assessment mode</label>
                        <Select value={values.assessmentMode} onValueChange={(value) => updateField("assessmentMode", value as CourseAssessmentMode)}>
                          <SelectTrigger><SelectValue placeholder="Assessment mode" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="None">None</SelectItem>
                            <SelectItem value="PerSubject">Per subject</SelectItem>
                            <SelectItem value="PerModule">Per module</SelectItem>
                            <SelectItem value="PerLesson">Per lesson</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Completion threshold</label>
                        <Input type="number" min={0} max={100} value={String(values.completionThreshold)} onChange={(event) => updateField("completionThreshold", Number(event.target.value || 0))} />
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-card p-4 text-sm text-muted-foreground">
                      Tests are normalized through the subject hierarchy. Existing tests can remain managed from the assessment builder, while this step controls how the course expects them to be placed and evaluated.
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Assessment notes</label>
                      <Textarea value={values.assessmentNotes} onChange={(event) => updateField("assessmentNotes", event.target.value)} placeholder="Optional note about grading, retakes, or proctoring rules" className="min-h-28" />
                    </div>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-sm font-semibold text-foreground">Assessment summary</p>
                    <SummaryRow label="Mode" value={values.assessmentMode} />
                    <SummaryRow label="Passing" value={formatPercentage(values.completionThreshold)} />
                    <SummaryRow label="Course subjects" value={String(summary.subjectCount)} />
                  </div>
                </div>
              ) : null}

              {step === 6 ? (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_320px]">
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center rounded-xl border border-border/60 bg-card p-4">
                      <div>
                        <p className="text-sm font-medium">Certificates</p>
                        <p className="text-xs text-muted-foreground">Issue completion certificates when students meet the configured threshold.</p>
                      </div>
                      <Switch checked={values.certificateEnabled} onCheckedChange={(checked) => updateField("certificateEnabled", checked)} />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Certificate template</label>
                      <Input value={values.certificateTemplate} onChange={(event) => updateField("certificateTemplate", event.target.value)} placeholder="Template name or template URL" />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center rounded-xl border border-border/60 bg-card p-4">
                      <div>
                        <p className="text-sm font-medium">Analytics hooks</p>
                        <p className="text-xs text-muted-foreground">Enable event tracking for enrollments, lessons, and certificate issuance.</p>
                      </div>
                      <Switch checked={values.analyticsEnabled} onCheckedChange={(checked) => updateField("analyticsEnabled", checked)} />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Analytics event key</label>
                      <Input value={values.analyticsEventKey} onChange={(event) => updateField("analyticsEventKey", event.target.value)} placeholder="course-react-systems-2026" />
                    </div>

                    <div className="space-y-3 rounded-xl border border-border/60 bg-card p-4">
                      <div>
                        <p className="text-sm font-medium">Co-instructors</p>
                        <p className="text-xs text-muted-foreground">Select additional instructors without changing the lead owner.</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {visibleInstructors.map((instructor) => {
                          const selected = values.coInstructorIds.includes(instructor.id);
                          return (
                            <Button
                              key={instructor.id}
                              type="button"
                              variant={selected ? "default" : "outline"}
                              className="rounded-full"
                              onClick={() => toggleCoInstructor(instructor.id)}
                            >
                              {getInstructorLabel(instructor)}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-sm font-semibold text-foreground">Settings summary</p>
                    <SummaryRow label="Certificates" value={values.certificateEnabled ? "Enabled" : "Disabled"} />
                    <SummaryRow label="Analytics" value={values.analyticsEnabled ? "Enabled" : "Disabled"} />
                    <SummaryRow label="Co-instructors" value={String(values.coInstructorIds.length)} />
                    <SummaryRow label="Lead" value={selectedInstructor ? getInstructorLabel(selectedInstructor) : "Unassigned"} />
                  </div>
                </div>
              ) : null}

              {step === 7 ? (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_320px]">
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Publish state</label>
                        <Select value={values.status} onValueChange={(value) => updateField("status", value as CourseFormValues["status"])}>
                          <SelectTrigger><SelectValue placeholder="Publish state" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Published">Published</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Lifecycle stage</label>
                        <Select value={values.lifecycleStage} onValueChange={(value) => updateField("lifecycleStage", value as CourseLifecycleStage)}>
                          <SelectTrigger><SelectValue placeholder="Lifecycle stage" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Review">Review</SelectItem>
                            <SelectItem value="Published">Published</SelectItem>
                            <SelectItem value="Archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-2 sm:max-w-[260px]">
                      <label className="text-sm font-medium">Publish at</label>
                      <Input type="datetime-local" value={values.publishAt} onChange={(event) => updateField("publishAt", event.target.value)} />
                    </div>

                    <div className="grid gap-2 sm:max-w-[260px]">
                      <label className="text-sm font-medium">Archive at</label>
                      <Input type="datetime-local" value={values.archivedAt} onChange={(event) => updateField("archivedAt", event.target.value)} />
                    </div>

                    <div className="rounded-xl border border-border/60 bg-card p-4">
                      <p className="text-sm font-medium text-foreground">Final review</p>
                      <p className="mt-1 text-xs text-muted-foreground">Publish only when the curriculum, media, pricing, and course settings are all intentionally set.</p>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-sm font-semibold text-foreground">Ready to publish</p>
                    <SummaryRow label="State" value={values.status} />
                    <SummaryRow label="Lifecycle" value={values.lifecycleStage} />
                    <SummaryRow label="Release" value={values.publishAt ? "Scheduled" : "Immediate"} />
                    <SummaryRow label="Archive" value={values.archivedAt ? "Scheduled" : "Not scheduled"} />
                  </div>
                </div>
              ) : null}

              <div className="xl:hidden">{renderRightRail()}</div>
            </div>
          </div>

          <aside className="hidden border-l border-border/60 bg-background/40 px-5 py-6 xl:block">
            {renderRightRail()}
          </aside>
        </div>

        <DialogFooter className="border-t border-border/60 px-6 py-4">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">The wizard stores the full course tree, lifecycle state, and auxiliary settings in one pass.</div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={goPrevious} disabled={step === 1 || isSubmitting}>
                Back
              </Button>
              {step < stepMeta.length ? (
                <Button type="button" onClick={goNext} disabled={!canAdvance || isSubmitting}>
                  Continue
                </Button>
              ) : (
                <Button type="button" onClick={() => void submit()} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : footerButtonLabel}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
