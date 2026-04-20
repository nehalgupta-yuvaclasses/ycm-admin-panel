import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormDialog } from "@/components/shared/FormDialog";
import { profileSchema, ProfileFormValues } from "../types";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
  isSubmitting: boolean;
  defaultValues: { name: string; email: string; bio: string };
}

export function EditProfileDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  defaultValues,
}: EditProfileDialogProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: defaultValues.name,
      bio: defaultValues.bio || "",
    },
  });

  const { handleSubmit, reset, control } = form;

  React.useEffect(() => {
    if (open) {
      reset({
        name: defaultValues.name,
        bio: defaultValues.bio || "",
      });
    }
  }, [open, defaultValues, reset]);

  const onFormSubmit = async (data: ProfileFormValues) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <FormDialog
      title="Edit Profile"
      description="Update your display name and bio."
      isOpen={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit(onFormSubmit)}
      loading={isSubmitting}
      submitText="Save Profile"
    >
      <Form {...form}>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your official name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <Label className="text-[13px] font-semibold tracking-wide text-foreground/80">Email Address</Label>
            <Input
              value={defaultValues.email}
              readOnly
              className="bg-muted/20 border-border/20 cursor-not-allowed text-muted-foreground/60"
            />
            <p className="text-[10px] text-muted-foreground">Email cannot be changed here.</p>
          </div>

          <FormField
            control={control}
            name="bio"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Professional Bio</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Share a short bio with the community..."
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
