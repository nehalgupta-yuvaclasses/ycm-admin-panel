import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Plus, RefreshCcw, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { CourseForm } from "@/components/admin/courses/CourseForm";
import { CourseTable } from "@/components/admin/courses/CourseTable";
import type { CourseFormValues, CoursePageFilters, CourseSummary } from "@/components/admin/courses/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { courseService } from "@/services/courseService";
import { storageService } from "@/services/storageService";
import { useInstructorOptions } from "@/features/instructors/hooks/useInstructors";

const initialFilters: CoursePageFilters = {
  search: "",
  status: "all",
  category: "all",
  sort: "newest",
};

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<CoursePageFilters>(initialFilters);
  const [createOpen, setCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { data: instructors = [] } = useInstructorOptions();

  useEffect(() => {
    void loadCourses();
  }, []);

  async function loadCourses() {
    setLoading(true);
    try {
      setCourses(await courseService.getCourses());
    } catch (error) {
      console.error("Failed to fetch courses:", error instanceof Error ? error.message : String(error));
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }

  const categories = useMemo(() => {
    return ["all", ...new Set(courses.map((course) => course.category || "General"))];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const filtered = courses.filter((course) => {
      const matchesSearch =
        !search ||
        course.title.toLowerCase().includes(search) ||
        course.subtitle.toLowerCase().includes(search) ||
        course.description.toLowerCase().includes(search) ||
        course.instructorName.toLowerCase().includes(search);
      const matchesStatus = filters.status === "all" || course.status === filters.status;
      const matchesCategory = filters.category === "all" || course.category === filters.category;
      return matchesSearch && matchesStatus && matchesCategory;
    });

    return filtered.sort((left, right) => {
      if (filters.sort === "popular") {
        return right.studentsCount - left.studentsCount;
      }
      return new Date(right.lastUpdated).getTime() - new Date(left.lastUpdated).getTime();
    });
  }, [courses, filters]);

  const handleCreateCourse = async (values: CourseFormValues, thumbnailFile: File | null) => {
    setIsCreating(true);
    try {
      let thumbnailUrl = values.thumbnailUrl;

      if (thumbnailFile) {
        const path = `course-thumbnails/${Date.now()}-${thumbnailFile.name}`;
        thumbnailUrl = await storageService.uploadFile("course-thumbnails", path, thumbnailFile);
      }

      await courseService.createCourse({ ...values, thumbnailUrl });
      toast.success("Course created successfully");
      setCreateOpen(false);
      await loadCourses();
    } catch (error) {
      console.error("Failed to create course:", error instanceof Error ? error.message : String(error));
      toast.error("Failed to create course");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm("Delete this course and its curriculum? This cannot be undone.")) return;
    try {
      await courseService.deleteCourse(courseId);
      toast.success("Course deleted successfully");
      await loadCourses();
    } catch (error) {
      console.error("Failed to delete course:", error instanceof Error ? error.message : String(error));
      toast.error("Failed to delete course");
    }
  };

  const handleOpenCourse = (courseId: string) => {
    navigate(`/admin/courses/${courseId}`);
  };

  return (
    <PageContainer>
      <PageHeader title="Courses" description="Create and manage structured courses, modules, and lessons.">
        <Button variant="outline" className="h-10 gap-2 rounded-lg" onClick={() => { setIsRefreshing(true); void loadCourses(); }} disabled={isRefreshing}>
          <RefreshCcw className="h-4 w-4" /> Refresh
        </Button>
        <Button className="h-10 gap-2 rounded-lg" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Add course
        </Button>
      </PageHeader>

      <PageToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilters((current) => ({ ...current, search: value }))}
        searchPlaceholder="Search courses, instructors, or subtitles..."
        actions={
          <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
            <div className="min-w-[140px] flex-1 md:flex-none">
              <Select value={filters.status} onValueChange={(value) => setFilters((current) => ({ ...current, status: value as CoursePageFilters["status"] }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[160px] flex-1 md:flex-none">
              <Select value={filters.category} onValueChange={(value) => setFilters((current) => ({ ...current, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.filter((category) => category !== "all").map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[140px] flex-1 md:flex-none">
              <Select value={filters.sort} onValueChange={(value) => setFilters((current) => ({ ...current, sort: value as CoursePageFilters["sort"] }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" className="h-10 gap-2 rounded-lg" onClick={() => setFilters(initialFilters)}>
              <SlidersHorizontal className="h-4 w-4" /> Reset
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>{filteredCourses.length} of {courses.length} courses visible</span>
      </div>

      <CourseTable
        courses={filteredCourses}
        isLoading={loading}
        onOpenCourse={handleOpenCourse}
        onEditCourse={handleOpenCourse}
        onDeleteCourse={handleDeleteCourse}
      />

      <CourseForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateCourse}
        instructors={instructors}
        isSubmitting={isCreating}
        title="Create course"
        description="Build the course structure, pricing, and publication state in one flow."
        submitLabel="Create course"
      />
    </PageContainer>
  );
}