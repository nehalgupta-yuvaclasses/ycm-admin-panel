import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormDialog } from "@/components/shared/FormDialog";
import { passwordSchema, PasswordFormValues } from "../types";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PasswordFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: ChangePasswordDialogProps) {
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current: "", new: "", confirm: "" },
  });

  const { handleSubmit, reset, control } = form;

  React.useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const onFormSubmit = async (data: PasswordFormValues) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <FormDialog
      title="Change Password"
      description="Enter your current password and set a new one."
      isOpen={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit(onFormSubmit)}
      loading={isSubmitting}
      submitText="Update Password"
    >
      <Form {...form}>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="current"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="Enter current password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="new"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="confirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="Re-enter new password" />
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
