import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormDialog } from "@/components/shared/FormDialog";

const resultSchema = z.object({
  student_name: z.string().trim().min(2, "Student name is required"),
  exam: z.string().trim().min(2, "Exam name is required"),
  rank: z.string().trim().min(1, "Rank or score is required"),
});

type ResultFormValues = z.infer<typeof resultSchema>;

interface AddResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ResultFormValues & { imageFile: File }) => Promise<void>;
  isSubmitting: boolean;
}

export function AddResultDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: AddResultDialogProps) {
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const form = useForm<ResultFormValues>({
    resolver: zodResolver(resultSchema),
    defaultValues: { student_name: "", exam: "", rank: "" },
  });

  const { handleSubmit, reset, control } = form;

  React.useEffect(() => {
    if (open) {
      reset();
      setImageFile(null);
    }
  }, [open, reset]);

  const onFormSubmit = async (data: ResultFormValues) => {
    if (!imageFile) {
      form.setError("student_name", { message: "Please upload a student photo" });
      return;
    }
    await onSubmit({ ...data, imageFile });
  };

  return (
    <FormDialog
      title="Add New Success Story"
      description="Add achievement details and a student photo."
      isOpen={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit(onFormSubmit)}
      loading={isSubmitting}
      submitText="Add Result"
    >
      <Form {...form}>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="student_name"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Student Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Sarah Johnson" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="exam"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exam</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. NEET 2024" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="rank"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rank / Score</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Rank 42" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-2 space-y-2">
            <Label className="text-[13px] font-semibold tracking-wide text-foreground/80">Student Photo</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>
      </Form>
    </FormDialog>
  );
}
