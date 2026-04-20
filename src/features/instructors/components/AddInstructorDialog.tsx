import type { InstructorFormValues } from '../types';
import { InstructorFormDialog } from './InstructorFormDialog';

interface AddInstructorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: InstructorFormValues, profileImageFile: File | null) => Promise<void>;
  isSubmitting: boolean;
}

export function AddInstructorDialog({ open, onOpenChange, onSubmit, isSubmitting }: AddInstructorDialogProps) {
  return (
    <InstructorFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Instructor"
      description="Create a new teaching profile for course assignment and staff management."
      submitLabel="Create instructor"
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
