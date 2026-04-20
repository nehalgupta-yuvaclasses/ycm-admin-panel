import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormDialog } from "@/components/shared/FormDialog";
import { platformSchema, PlatformFormValues } from "../types";

interface EditPlatformDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PlatformFormValues) => Promise<void>;
  isSubmitting: boolean;
  defaultValues: PlatformFormValues;
}

export function EditPlatformDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  defaultValues,
}: EditPlatformDialogProps) {
  const form = useForm<PlatformFormValues>({
    resolver: zodResolver(platformSchema),
    defaultValues,
  });

  const { handleSubmit, reset, control } = form;

  React.useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const onFormSubmit = async (data: PlatformFormValues) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <FormDialog
      title="Platform Settings"
      description="Update your platform branding and contact info."
      isOpen={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit(onFormSubmit)}
      loading={isSubmitting}
      submitText="Save Settings"
    >
      <Form {...form}>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="platform_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Yuva Classes" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="support_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Support Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="support@example.com" />
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
