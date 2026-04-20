import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { CourseDetails } from "@/components/admin/courses/CourseDetails";
import { CourseForm } from "@/components/admin/courses/CourseForm";
import type { CourseDetailsData, CourseFormValues } from "@/components/admin/courses/types";
import { courseService } from "@/services/courseService";
import { storageService } from "@/services/storageService";
import { useInstructorOptions } from "@/features/instructors/hooks/useInstructors";

export default function CourseBuilder() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [savingCourse, setSavingCourse] = useState(false);
  const [savingCurriculum, setSavingCurriculum] = useState(false);
  const [editingCourseOpen, setEditingCourseOpen] = useState(false);
  const [details, setDetails] = useState<CourseDetailsData | null>(null);
  const { data: instructors = [] } = useInstructorOptions();

  useEffect(() => {
    void loadData();
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
      thumbnailUrl: details.course.thumbnailUrl,
      originalPrice: details.course.originalPrice,
      sellingPrice: details.course.sellingPrice,
      status: details.course.status,
      visibility: details.course.visibility,
      modules: details.modules,
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
        thumbnail_url: thumbnailUrl,
        buying_price: values.originalPrice,
        selling_price: values.sellingPrice,
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
        isSavingCurriculum={savingCurriculum}
      />

      <CourseForm
        open={editingCourseOpen}
        onOpenChange={setEditingCourseOpen}
        onSubmit={handleSaveCourse}
        instructors={instructors}
        isSubmitting={savingCourse}
        title="Edit course"
        description="Update course metadata, pricing, or publication state."
        submitLabel="Save changes"
        initialValues={initialFormValues}
      />
    </PageContainer>
  );
}