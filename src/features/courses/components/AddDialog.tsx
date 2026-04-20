import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormDialog } from "@/components/shared/FormDialog";
import { courseSchema, CourseFormValues } from "../types";
import { ImagePlus } from "lucide-react";

interface AddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CourseFormValues & { thumbnailFile?: File }) => Promise<void>;
  isSubmitting: boolean;
}

export function AddDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: AddDialogProps) {
  const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = React.useState<string>("");

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      tagline: "",
      description: "",
      author: "",
      thumbnail_url: "",
      buying_price: 0,
      selling_price: 0,
      status: "draft",
    },
  });

  const { handleSubmit, reset, control } = form;

  React.useEffect(() => {
    if (open) {
      reset();
      setThumbnailFile(null);
      setThumbnailPreview("");
    }
  }, [open, reset]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onFormSubmit = async (data: CourseFormValues) => {
    await onSubmit({ ...data, thumbnailFile: thumbnailFile || undefined });
    onOpenChange(false);
  };

  return (
    <FormDialog
      title="Create New Course"
      description="Design a new curriculum with pricing and branding details."
      isOpen={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit(onFormSubmit)}
      loading={isSubmitting}
      submitText="Create Course"
      size="xl"
    >
      <Form {...form}>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="title"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Course Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Master React in 30 Days" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="tagline"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Short Tagline</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="A catchy one-liner for the course page" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="author"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Author / Teacher</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Dr. Sharma" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Detailed Description</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Describe what students will learn..." 
                    className="min-h-[80px] resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Thumbnail */}
          <div className="col-span-2 space-y-2">
            <Label className="text-[13px] font-semibold tracking-wide text-foreground/80">Course Thumbnail</Label>
            <div className="flex items-start gap-4">
              <label className="flex h-24 w-36 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/30 transition-colors overflow-hidden">
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus className="h-6 w-6 text-muted-foreground/50" />
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />
              </label>
              <div className="flex-1 space-y-1.5">
                <FormField
                  control={control}
                  name="thumbnail_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder="Or paste image URL..." />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <p className="text-[11px] text-muted-foreground">
                  Upload an image or paste a URL. Recommended: 16:9, max 2MB.
                </p>
              </div>
            </div>
          </div>

          <FormField
            control={control}
            name="buying_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buying Price (₹)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="selling_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selling Price (₹)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="0" />
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
                <FormLabel>Publication Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
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
