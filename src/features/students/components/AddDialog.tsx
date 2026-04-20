import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormDialog } from "@/components/shared/FormDialog";
import { studentSchema, StudentFormValues } from "../types";

interface AddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: StudentFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function AddDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: AddDialogProps) {
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      batch: "",
      status: "active",
    },
  });

  const { handleSubmit, reset, control } = form;

  React.useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const onFormSubmit = async (data: StudentFormValues) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <FormDialog
      title="Enroll New Student"
      description="Create a new student record with validated contact and location details."
      isOpen={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit(onFormSubmit)}
      loading={isSubmitting}
      submitText="Create Student"
    >
      <Form {...form}>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="full_name"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="John Doe" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="john@example.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="9876543210" maxLength={10} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Bengaluru" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Karnataka" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="batch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batch</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Python Jan 2024" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </FormDialog>
  );
}
