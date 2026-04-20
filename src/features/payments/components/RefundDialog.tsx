import * as React from "react";
import { FormDialog } from "@/components/shared/FormDialog";

interface RefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isSubmitting: boolean;
  amount: number;
  studentName: string;
}

export function RefundDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
  amount,
  studentName,
}: RefundDialogProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <FormDialog
      title="Confirm Refund"
      description={`Are you sure you want to refund ₹${amount.toLocaleString()} to ${studentName || "this student"}? The student will be unenrolled from the course.`}
      isOpen={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      loading={isSubmitting}
      submitText="Confirm Refund"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 rounded-xl bg-destructive/5 border border-destructive/10 p-4 text-sm text-destructive">
          <p className="font-semibold mb-1">⚠️ This action is irreversible</p>
          <p className="text-destructive/80">
            The payment of <strong>₹{amount.toLocaleString()}</strong> will be refunded and the student will lose access to the enrolled course.
          </p>
        </div>
      </div>
    </FormDialog>
  );
}
