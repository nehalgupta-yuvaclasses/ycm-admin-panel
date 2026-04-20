import * as React from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormDialog } from "@/components/shared/FormDialog";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

interface AddBlogFormValues {
  title: string;
  slug: string;
  excerpt: string;
}

interface AddBlogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AddBlogFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function AddBlogDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: AddBlogDialogProps) {
  const form = useForm<AddBlogFormValues>({
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
    },
  });

  const { handleSubmit, reset, control, setValue, watch } = form;
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(false);
  const title = watch("title");

  // Auto-generate slug from title
  React.useEffect(() => {
    if (!slugManuallyEdited && title) {
      setValue("slug", slugify(title));
    }
  }, [title, slugManuallyEdited, setValue]);

  React.useEffect(() => {
    if (open) {
      reset();
      setSlugManuallyEdited(false);
    }
  }, [open, reset]);

  const onFormSubmit = async (data: AddBlogFormValues) => {
    if (!data.title.trim()) return;
    if (!data.slug.trim()) {
      data.slug = slugify(data.title);
    }
    await onSubmit(data);
  };

  return (
    <FormDialog
      title="New Blog Post"
      description="Enter the basic details. You'll open the full editor next."
      isOpen={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit(onFormSubmit)}
      loading={isSubmitting}
      submitText="Continue to Editor"
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={control}
            name="title"
            rules={{ required: "Title is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Getting Started with React" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="slug"
            rules={{ required: "Slug is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Slug</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="getting-started-with-react"
                    className="font-mono text-sm"
                    onChange={(e) => {
                      field.onChange(e);
                      setSlugManuallyEdited(true);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Brief summary of the post..."
                    rows={3}
                    className="resize-none"
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
