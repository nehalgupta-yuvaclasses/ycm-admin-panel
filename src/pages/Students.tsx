import * as React from "react";
import { UserPlus, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { PageContainer } from "@/components/shared/page-container";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

import { useStudentStore } from "@/features/students/useStudentStore";
import { Student } from "@/features/students/types";
import { getStudentColumns } from "@/features/students/components/StudentColumns";
import { AddDialog } from "@/features/students/components/AddDialog";
import { EditDialog } from "@/features/students/components/EditDialog";
import { StudentFilters } from "@/features/students/components/StudentFilters";

export default function Students() {
  const { 
    students, 
    isLoading, 
    fetchStudents, 
    addStudent, 
    updateStudent, 
    deleteStudent,
    subscribeToStudents,
    currentPage,
    setPage,
    total
  } = useStudentStore();

  // Local UI States
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [batchFilter, setBatchFilter] = React.useState("all");
  
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Initial Fetch and Real-time Subscription
  React.useEffect(() => {
    fetchStudents();
    const unsubscribe = subscribeToStudents();
    return () => unsubscribe();
  }, [fetchStudents, subscribeToStudents]);

  // Debounce search logic
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredStudents = React.useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = 
        student.full_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        student.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (student.phone && student.phone.includes(debouncedSearch));
      
      const matchesStatus = statusFilter === "all" || student.status === statusFilter;
      const matchesBatch = batchFilter === "all" || student.batch === batchFilter;

      return matchesSearch && matchesStatus && matchesBatch;
    });
  }, [students, debouncedSearch, statusFilter, batchFilter]);

  const handleCreateStudent = () => {
    setSelectedStudent(null);
    setIsAddDialogOpen(true);
  };
  
  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsEditDialogOpen(true);
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      if (selectedStudent) {
        await updateStudent(selectedStudent.id, values);
        setIsEditDialogOpen(false);
      } else {
        await addStudent(values);
        setIsAddDialogOpen(false);
      }
    } catch (error) {
      // Error handled in store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to permanently remove this student? This action cannot be undone.")) {
      await deleteStudent(id);
    }
  };

  const toggleStatus = async (student: Student) => {
    const newStatus = student.status === "active" ? "inactive" : "active";
    await updateStudent(student.id, { status: newStatus });
  };

  const handleBan = async (student: Student) => {
    await updateStudent(student.id, { status: "inactive" });
    toast.error(`Student Account Suspended: ${student.full_name}`);
  };

  const handleUnban = async (student: Student) => {
    await updateStudent(student.id, { status: "active" });
    toast.success(`Student Account Reinstated: ${student.full_name}`);
  };

  const columns = getStudentColumns({
    onView: (s: Student) => toast.info(`Viewing profile for ${s.full_name}`),
    onEdit: handleEditStudent,
    onDelete: handleDelete,
    onToggleStatus: toggleStatus,
    onBan: handleBan,
    onUnban: handleUnban,
    onAssignCourse: (s) => toast.info(`Course management for ${s.full_name} is being upgraded to live status.`),
  });

  return (
    <PageContainer className="animate-in fade-in duration-500">
      <PageHeader 
        title="Student Management" 
        description="Monitor student progress, manage enrollments, and coordinate academic batches with real-time Supabase sync."
      >
        <Button onClick={handleCreateStudent} className="h-11 gap-2 px-6">
          <UserPlus className="h-5 w-5" />
          Add New Student
        </Button>
      </PageHeader>

      <PageToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by name, email or phone..."
        actions={
          <>
            <StudentFilters 
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              batchFilter={batchFilter}
              onBatchChange={setBatchFilter}
              batches={[]}
              onReset={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setBatchFilter("all");
              }}
            />
          </>
        }
      />

      <DataTable 
        columns={columns} 
        data={filteredStudents} 
        isLoading={isLoading}
        emptyState={
          <EmptyState 
            icon={GraduationCap}
            title={debouncedSearch || statusFilter !== "all" || batchFilter !== "all" ? "No matching students" : "No students enrolled yet"}
            description={debouncedSearch || statusFilter !== "all" || batchFilter !== "all" 
              ? "We couldn't find any students matching your current search or filter criteria." 
              : "Begin your academic journey by adding your first student to the Yuva Classes platform."}
            action={debouncedSearch || statusFilter !== "all" || batchFilter !== "all" ? undefined : {
              label: "Enroll First Student",
              icon: UserPlus,
              onClick: handleCreateStudent
            }}
            className="border-none py-20"
          />
        }
      />

      <AddDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <EditDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        student={selectedStudent}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </PageContainer>
  );
}
