import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  HelpCircle,
  Clock,
  MoreVertical,
  Hammer,
  Users,
  Trash2,
  FileText,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { testService } from "@/services/testService";
import { courseService } from "@/services/courseService";
import { toast } from "sonner";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { AddDialog } from "@/features/tests/components/AddDialog";
import { TestFormValues } from "@/features/tests/types";
import type { CourseSummary } from "@/components/admin/courses/types";
import type { TestListItem } from "@/services/testService";

export default function Tests() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<TestListItem[]>([]);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [testsData, coursesData] = await Promise.all([
        testService.getTests(),
        courseService.getCourses(),
      ]);
      setTests(testsData);
      setCourses(coursesData);
    } catch (error) {
      console.error("Failed to fetch tests", error);
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTest = async (values: TestFormValues) => {
    setIsSubmitting(true);
    try {
      const created = await testService.createTest(values as any);
      toast.success("Test created successfully");
      setIsCreateOpen(false);
      navigate(`/admin/tests/builder/${created.id}`);
    } catch (error) {
      console.error("Failed to create test", error);
      toast.error("Failed to create test");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTest = async (_id: string) => {
    toast.info("Delete not implemented in testService yet");
  };

  const filteredTests = useMemo(
    () =>
      tests.filter(
        (test) =>
          test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (test.course?.title ?? "Unknown Course").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (test.subject?.name ?? "Unknown Subject").toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [tests, searchQuery],
  );

  const columns = useMemo(
    () => [
      {
        header: "Test Details",
        className: "w-[380px]",
        cell: (test: TestListItem) => (
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/5 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">{test.title}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(test.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ),
      },
      {
        header: "Course / Subject",
        cell: (test: TestListItem) => (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-background font-medium">
              {test.course?.title ?? "Unknown Course"}
            </Badge>
            <Badge variant="secondary" className="font-medium">
              {test.subject?.name ?? "Unknown Subject"}
            </Badge>
          </div>
        ),
      },
      {
        header: "Stats",
        cell: (test: TestListItem) => (
          <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <span>{test.duration ?? 0} mins</span>
            </div>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>{test.total_marks ?? 0} marks</span>
            </div>
          </div>
        ),
      },
      {
        header: "Status",
        cell: (test: TestListItem) => (
          <Badge
            variant={test.status === "published" ? "default" : "secondary"}
            className={
              test.status === "published"
                ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                : "bg-muted text-muted-foreground"
            }
          >
            {test.status}
          </Badge>
        ),
      },
      {
        header: "Actions",
        className: "text-right",
        cell: (test: TestListItem) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => navigate(`/admin/tests/builder/${test.id}`)}
            >
              <Hammer className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                nativeButton={true}
                render={
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56 p-2">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Management
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate(`/admin/tests/builder/${test.id}`)} className="rounded-lg">
                    <Hammer className="mr-2 h-4 w-4" /> Open Builder
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/admin/tests/attempts/${test.id}`)} className="rounded-lg">
                    <Users className="mr-2 h-4 w-4" /> View Attempts
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem
                  className="rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onClick={() => handleDeleteTest(test.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Test
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [navigate],
  );

  return (
    <PageContainer className="animate-in fade-in duration-500">
      <PageHeader title="Assessments" description="Manage and monitor student tests and quizzes.">
        <Button className="h-11 gap-2 px-6" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Create Test
        </Button>
      </PageHeader>

      <PageToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search tests, courses, or subjects..."
      />

      <DataTable
        columns={columns}
        data={filteredTests}
        isLoading={isLoading}
        emptyState={
          <EmptyState
            icon={FileText}
            title="No assessments found"
            description={
              searchQuery
                ? `We couldn't find any results for "${searchQuery}". Try a different search term.`
                : "Get started by creating your first test to assess student progress."
            }
            action={
              searchQuery
                ? undefined
                : {
                    label: "Create first test",
                    onClick: () => setIsCreateOpen(true),
                    icon: Plus,
                  }
            }
          />
        }
      />

      <AddDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateTest}
        isSubmitting={isSubmitting}
        courses={courses}
      />
    </PageContainer>
  );
}
