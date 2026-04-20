import { useMemo, useState } from 'react';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageContainer } from '@/components/shared/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { storageService } from '@/services/storageService';
import { useCreateInstructor, useDeleteInstructor, useInstructors, useUpdateInstructor } from '../hooks/useInstructors';
import type { InstructorFilters, InstructorFormValues, InstructorRecord } from '../types';
import { AddInstructorDialog } from '../components/AddInstructorDialog';
import { EditInstructorDialog } from '../components/EditInstructorDialog';
import { InstructorTable } from '../components/InstructorTable';

const initialFilters: InstructorFilters = {
  search: '',
  status: 'all',
  sort: 'newest',
};

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

async function uploadInstructorImage(file: File | null) {
  if (!file) return '';

  try {
    const path = `instructors/${Date.now()}-${file.name}`;
    return await storageService.uploadFile('avatars', path, file);
  } catch (error) {
    console.warn('Instructor image upload skipped:', error instanceof Error ? error.message : String(error));
    return '';
  }
}

function buildPayload(values: InstructorFormValues, profileImage: string): InstructorFormValues {
  return {
    ...values,
    profile_image: profileImage || values.profile_image || '',
    expertise: values.expertise.map((item) => item.trim()).filter(Boolean),
  };
}

export function InstructorsPage() {
  const { data: instructors = [], isLoading } = useInstructors();
  const createMutation = useCreateInstructor();
  const updateMutation = useUpdateInstructor();
  const deleteMutation = useDeleteInstructor();

  const [filters, setFilters] = useState<InstructorFilters>(initialFilters);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<InstructorRecord | null>(null);

  const filteredInstructors = useMemo(() => {
    const search = normalizeText(filters.search);

    return instructors.filter((instructor) => {
      const matchesSearch =
        !search ||
        normalizeText(instructor.fullName).includes(search) ||
        normalizeText(instructor.email).includes(search) ||
        normalizeText(instructor.phone).includes(search) ||
        instructor.expertise.some((tag) => normalizeText(tag).includes(search));

      const matchesStatus =
        filters.status === 'all' ||
        (filters.status === 'active' && instructor.isActive) ||
        (filters.status === 'inactive' && !instructor.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [filters.search, filters.status, instructors]);

  const handleCreateInstructor = async (values: InstructorFormValues, profileImageFile: File | null) => {
    try {
      const profileImage = await uploadInstructorImage(profileImageFile);
      await createMutation.mutateAsync(buildPayload(values, profileImage));
      toast.success('Instructor created');
      setCreateOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create instructor';
      console.error('Failed to create instructor:', message);
      toast.error(message);
    }
  };

  const handleUpdateInstructor = async (values: InstructorFormValues, profileImageFile: File | null) => {
    if (!editingInstructor) return;

    try {
      const profileImage = await uploadInstructorImage(profileImageFile);
      await updateMutation.mutateAsync({
        id: editingInstructor.id,
        values: buildPayload(values, profileImage || editingInstructor.profileImage),
      });
      toast.success('Instructor updated');
      setEditingInstructor(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update instructor';
      console.error('Failed to update instructor:', message);
      toast.error(message);
    }
  };

  const handleToggleStatus = async (instructor: InstructorRecord) => {
    try {
      await updateMutation.mutateAsync({
        id: instructor.id,
        values: {
          full_name: instructor.fullName,
          email: instructor.email,
          phone: instructor.phone,
          bio: instructor.bio,
          profile_image: instructor.profileImage,
          expertise: instructor.expertise,
          experience_years: instructor.experienceYears,
          is_active: !instructor.isActive,
        },
      });
      toast.success(`Instructor ${instructor.isActive ? 'deactivated' : 'activated'}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update instructor status';
      console.error('Failed to update instructor status:', message);
      toast.error(message);
    }
  };

  const handleDeleteInstructor = async (instructor: InstructorRecord) => {
    if (!window.confirm(`Delete ${instructor.fullName}? This will unlink the instructor from any assigned courses.`)) return;

    try {
      await deleteMutation.mutateAsync(instructor.id);
      toast.success('Instructor deleted');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete instructor';
      console.error('Failed to delete instructor:', message);
      toast.error(message);
    }
  };

  const visibleCount = filteredInstructors.length;

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Instructors" description="Manage teaching staff and their profiles.">
        <Button className="h-10 gap-2 rounded-lg" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Add Instructor
        </Button>
      </PageHeader>

      <div className="rounded-xl border border-border/60 bg-card p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Search instructors by name, email, phone, or expertise"
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <Select value={filters.status} onValueChange={(value) => setFilters((current) => ({ ...current, status: value as InstructorFilters['status'] }))}>
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2 rounded-lg"
              onClick={() => setFilters(initialFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" /> Reset
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-sm text-muted-foreground">
          <span>{visibleCount} of {instructors.length} instructors visible</span>
          <Badge variant="outline" className="rounded-md border-border/60 px-2.5 py-1 text-xs font-medium">
            Newest
          </Badge>
        </div>
      </div>

      <InstructorTable
        instructors={filteredInstructors}
        isLoading={isLoading}
        onEdit={(instructor) => setEditingInstructor(instructor)}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteInstructor}
      />

      <AddInstructorDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateInstructor}
        isSubmitting={createMutation.isPending}
      />

      <EditInstructorDialog
        open={Boolean(editingInstructor)}
        onOpenChange={(open) => {
          if (!open) setEditingInstructor(null);
        }}
        instructor={editingInstructor}
        onSubmit={handleUpdateInstructor}
        isSubmitting={updateMutation.isPending}
      />
    </PageContainer>
  );
}

export default InstructorsPage;
