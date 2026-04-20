import type { InstructorFormValues, InstructorRecord } from '../types';
import { InstructorFormDialog } from './InstructorFormDialog';

interface EditInstructorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructor: InstructorRecord | null;
  onSubmit: (values: InstructorFormValues, profileImageFile: File | null) => Promise<void>;
  isSubmitting: boolean;
}

export function EditInstructorDialog({ open, onOpenChange, instructor, onSubmit, isSubmitting }: EditInstructorDialogProps) {
  return (
    <InstructorFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Instructor"
      description="Update profile details, expertise, and active state."
      submitLabel="Save changes"
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      initialValues={
        instructor
          ? {
              full_name: instructor.fullName,
              email: instructor.email,
              phone: instructor.phone,
              bio: instructor.bio,
              profile_image: instructor.profileImage,
              expertise: instructor.expertise,
              experience_years: instructor.experienceYears,
              is_active: instructor.isActive,
            }
          : undefined
      }
    />
  );
}
