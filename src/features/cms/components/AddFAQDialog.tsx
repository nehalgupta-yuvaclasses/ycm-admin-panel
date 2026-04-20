import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormDialog } from "@/components/shared/FormDialog";

const faqSchema = z.object({
  question: z.string().trim().min(5, "Question must be at least 5 characters"),
  answer: z.string().trim().min(10, "Answer must be at least 10 characters"),
});

type FAQFormValues = z.infer<typeof faqSchema>;

interface AddFAQDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FAQFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function AddFAQDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: AddFAQDialogProps) {
  const form = useForm<FAQFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: { question: "", answer: "" },
  });

  const { handleSubmit, reset, control } = form;

  React.useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const onFormSubmit = async (data: FAQFormValues) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <FormDialog
      title="Add New FAQ"
      description="Clear and concise answers work best."
      isOpen={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit(onFormSubmit)}
      loading={isSubmitting}
      submitText="Add FAQ"
    >
      <Form {...form}>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="question"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Question</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. How do I access my recorded lectures?" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="answer"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Answer</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Provide a detailed explanation..."
                    className="min-h-[120px] resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </FormDialog>
  );
}
