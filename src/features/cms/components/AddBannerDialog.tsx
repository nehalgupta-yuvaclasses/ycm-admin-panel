import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormDialog } from "@/components/shared/FormDialog";

const bannerSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

interface AddBannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BannerFormValues & { imageFile: File }) => Promise<void>;
  isSubmitting: boolean;
}

export function AddBannerDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: AddBannerDialogProps) {
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: { title: "" },
  });

  const { handleSubmit, reset, control } = form;

  React.useEffect(() => {
    if (open) {
      reset();
      setImageFile(null);
    }
  }, [open, reset]);

  const onFormSubmit = async (data: BannerFormValues) => {
    if (!imageFile) {
      form.setError("title", { message: "Please upload a banner image" });
      return;
    }
    await onSubmit({ ...data, imageFile });
  };

  return (
    <FormDialog
      title="Add New Banner"
      description="Upload a high-quality image for the main homepage slider."
      isOpen={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit(onFormSubmit)}
      loading={isSubmitting}
      submitText="Add Banner"
    >
      <Form {...form}>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="title"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Banner Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Join our Summer Batch 2024" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-2 space-y-2">
            <Label className="text-[13px] font-semibold tracking-wide text-foreground/80">Banner Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
            <p className="text-[10px] text-muted-foreground">
              Recommended size: 1920×600px, Max 5MB.
            </p>
          </div>
        </div>
      </Form>
    </FormDialog>
  );
}
