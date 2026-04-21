import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { CourseDetails } from "@/components/admin/courses/CourseDetails";
import { CourseForm } from "@/components/admin/courses/CourseForm";
import type { CourseDetailsData, CourseFormValues, LessonRecord } from "@/components/admin/courses/types";
import { courseService } from "@/services/courseService";
import { storageService } from "@/services/storageService";
import { useInstructorOptions } from "@/features/instructors/hooks/useInstructors";

export default function CourseBuilder() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [savingCourse, setSavingCourse] = useState(false);
  const [savingCurriculum, setSavingCurriculum] = useState(false);
  const [liveActionLessonId, setLiveActionLessonId] = useState<string | null>(null);
  const [editingCourseOpen, setEditingCourseOpen] = useState(false);
  const [details, setDetails] = useState<CourseDetailsData | null>(null);
  const { data: instructors = [] } = useInstructorOptions();

  const instructorOptions = useMemo(() => {
    return instructors.map((instructor) => ({
      id: instructor.id,
      name: instructor.fullName,
      email: instructor.email,
      role: instructor.isActive ? "Instructor" : "Inactive",
      profileImage: instructor.profileImage,
      isActive: instructor.isActive,
    }));
  }, [instructors]);

  useEffect(() => {
    void loadData();
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;

    let cleanup: (() => Promise<void>) | null = null;
    let isDisposed = false;

    void (async () => {
      cleanup = await courseService.watchCourseLessonChanges(courseId, (lesson) => {
        setDetails((current) => {
          if (!current) return current;

          const nextSubjects = current.subjects.map((subject) => ({
            ...subject,
            modules: subject.modules.map((module) => {
              if (module.id !== lesson.moduleId) return module;
              return {
                ...module,
                lessons: module.lessons.map((currentLesson) => (currentLesson.id === lesson.id ? lesson : currentLesson)),
              };
            }),
          }));

          const nextModules = nextSubjects.flatMap((subject) => subject.modules);
          return { ...current, subjects: nextSubjects, modules: nextModules };
        });
      });

      if (isDisposed) {
        await cleanup?.();
      }
    })();

    return () => {
      isDisposed = true;
      void cleanup?.();
    };
  }, [courseId]);

  async function loadData() {
    if (!courseId) return;
    setLoading(true);
    try {
      const detailData = await courseService.getCourseDetails(courseId);

      if (!detailData.course) {
        throw new Error("Course not found");
      }

      setDetails(detailData);
    } catch (error) {
      console.error("Failed to load course:", error instanceof Error ? error.message : String(error));
      toast.error("Failed to load course");
      navigate("/admin/courses");
    } finally {
      setLoading(false);
    }
  }

  const initialFormValues = useMemo<CourseFormValues | undefined>(() => {
    if (!details?.course) return undefined;

    return {
      title: details.course.title,
      subtitle: details.course.subtitle,
      description: details.course.description,
      category: details.course.category,
      instructorId: details.course.instructorId,
      coInstructorIds: details.course.coInstructorIds,
      courseType: details.course.courseType,
      lifecycleStage: details.course.lifecycleStage,
      accessMode: details.course.accessMode,
      enrollmentMode: details.course.enrollmentMode,
      thumbnailUrl: details.course.thumbnailUrl,
      coverImageUrl: details.course.coverImageUrl,
      brandColor: details.course.brandColor,
      originalPrice: details.course.originalPrice,
      sellingPrice: details.course.sellingPrice,
      dripEnabled: details.course.dripEnabled,
      dripMode: details.course.dripMode,
      dripIntervalDays: details.course.dripIntervalDays,
      certificateEnabled: details.course.certificateEnabled,
      certificateTemplate: details.course.certificateTemplate,
      assessmentMode: details.course.assessmentMode,
      assessmentNotes: details.course.assessmentNotes,
      completionThreshold: details.course.completionThreshold,
      analyticsEnabled: details.course.analyticsEnabled,
      analyticsEventKey: details.course.analyticsEventKey,
      publishAt: details.course.publishAt || "",
      archivedAt: details.course.archivedAt || "",
      status: details.course.status,
      visibility: details.course.visibility,
      subjects: details.subjects,
    };
  }, [details]);

  async function handleSaveCurriculum(subjects: CourseDetailsData["subjects"]) {
    if (!courseId) return;
    setSavingCurriculum(true);
    try {
      await courseService.saveCurriculum(courseId, subjects);
      toast.success("Curriculum saved");
      await loadData();
    } catch (error) {
      console.error("Failed to save curriculum:", error instanceof Error ? error.message : String(error));
      toast.error("Failed to save curriculum");
    } finally {
      setSavingCurriculum(false);
    }
  }

  async function handleStartLiveClass(lesson: LessonRecord) {
    if (!courseId) return;
    setLiveActionLessonId(lesson.id);
    const meetingWindow = window.open("about:blank", "_blank");
    if (meetingWindow) {
      meetingWindow.document.title = "Opening live class...";
      meetingWindow.document.body.innerHTML = "<p style='font-family:sans-serif;padding:24px'>Opening live class...</p>";
    }
    try {
      const { lesson: updatedLesson, meetingUrl } = await courseService.startLiveClass(courseId, lesson.id);
      setDetails((current) => {
        if (!current) return current;

        const nextSubjects = current.subjects.map((subject) => ({
          ...subject,
          modules: subject.modules.map((module) => {
            if (module.id !== updatedLesson.moduleId) return module;
            return {
              ...module,
              lessons: module.lessons.map((currentLesson) => (currentLesson.id === updatedLesson.id ? updatedLesson : currentLesson)),
            };
          }),
        }));

        return { ...current, subjects: nextSubjects, modules: nextSubjects.flatMap((subject) => subject.modules) };
      });

      if (meetingWindow) {
        meetingWindow.location.replace(meetingUrl);
        meetingWindow.focus();
      } else {
        window.open(meetingUrl, "_blank");
      }
      toast.success("Live class started");
    } catch (error) {
      console.error("Failed to start live class:", error instanceof Error ? error.message : String(error));
      toast.error("Failed to start live class");
    } finally {
      setLiveActionLessonId(null);
    }
  }

  async function handleEndLiveClass(lesson: LessonRecord) {
    if (!courseId) return;
    setLiveActionLessonId(lesson.id);
    try {
      const updatedLesson = await courseService.endLiveClass(courseId, lesson.id);
      setDetails((current) => {
        if (!current) return current;

        const nextSubjects = current.subjects.map((subject) => ({
          ...subject,
          modules: subject.modules.map((module) => {
            if (module.id !== updatedLesson.moduleId) return module;
            return {
              ...module,
              lessons: module.lessons.map((currentLesson) => (currentLesson.id === updatedLesson.id ? updatedLesson : currentLesson)),
            };
          }),
        }));

        return { ...current, subjects: nextSubjects, modules: nextSubjects.flatMap((subject) => subject.modules) };
      });

      toast.success("Live class ended");
    } catch (error) {
      console.error("Failed to end live class:", error instanceof Error ? error.message : String(error));
      toast.error("Failed to end live class");
    } finally {
      setLiveActionLessonId(null);
    }
  }

  async function handleSaveCourse(values: CourseFormValues, thumbnailFile: File | null) {
    if (!courseId) return;
    setSavingCourse(true);
    try {
      let thumbnailUrl = values.thumbnailUrl;

      if (thumbnailFile) {
        const path = `course-thumbnails/${Date.now()}-${thumbnailFile.name}`;
        thumbnailUrl = await storageService.uploadFile("course-thumbnails", path, thumbnailFile);
      }

      await courseService.updateCourse(courseId, {
        title: values.title,
        subtitle: values.subtitle,
        description: values.description,
        category: values.category,
        instructor_id: values.instructorId,
        coInstructorIds: values.coInstructorIds,
        course_type: values.courseType,
        lifecycle_stage: values.lifecycleStage,
        access_mode: values.accessMode,
        enrollment_mode: values.enrollmentMode,
        thumbnail_url: thumbnailUrl,
        cover_image_url: values.coverImageUrl,
        brand_color: values.brandColor,
        buying_price: values.originalPrice,
        selling_price: values.sellingPrice,
        drip_enabled: values.dripEnabled,
        drip_mode: values.dripMode,
        drip_interval_days: values.dripIntervalDays,
        certificate_enabled: values.certificateEnabled,
        certificate_template: values.certificateTemplate,
        analytics_enabled: values.analyticsEnabled,
        analytics_event_key: values.analyticsEventKey,
        publish_at: values.publishAt || null,
        archived_at: values.archivedAt || null,
        assessment_mode: values.assessmentMode,
        assessment_notes: values.assessmentNotes,
        completion_threshold: values.completionThreshold,
        status: values.status,
        visibility: values.visibility,
      });

      toast.success("Course updated");
      setEditingCourseOpen(false);
      await loadData();
    } catch (error) {
      console.error("Failed to update course:", error instanceof Error ? error.message : String(error));
      toast.error("Failed to update course");
    } finally {
      setSavingCourse(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!details?.course) {
    return null;
  }

  return (
    <PageContainer>
      <PageHeader title="Course editor" description="Manage course structure, enrolled users, and performance.">
        <Button variant="outline" className="h-10 gap-2 rounded-lg" onClick={() => navigate("/admin/courses") }>
          <ArrowLeft className="h-4 w-4" /> Back to courses
        </Button>
      </PageHeader>

      <CourseDetails
        course={details.course}
        subjects={details.subjects}
        enrollments={details.enrollments}
        analytics={details.analytics}
        onEditCourse={() => setEditingCourseOpen(true)}
        onSaveCurriculum={handleSaveCurriculum}
        onStartLiveClass={handleStartLiveClass}
        onEndLiveClass={handleEndLiveClass}
        liveActionLessonId={liveActionLessonId}
        isSavingCurriculum={savingCurriculum}
      />

      <CourseForm
        open={editingCourseOpen}
        onOpenChange={setEditingCourseOpen}
        onSubmit={handleSaveCourse}
        instructors={instructorOptions}
        isSubmitting={savingCourse}
        title="Edit course"
        description="Update course metadata, pricing, or publication state."
        submitLabel="Save changes"
        initialValues={initialFormValues}
      />
    </PageContainer>
  );
}