import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDialog } from "@/components/shared/FormDialog";
import { resourceSchema, type ResourceFormValues, type Resource } from "../types";
import { FileUp, CheckCircle2 } from "lucide-react";

interface AddResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ResourceFormValues, file: File | null) => Promise<void>;
  isSubmitting: boolean;
  editingResource?: Resource | null;
  uploadProgress: number;
}

export function AddResourceDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  editingResource,
  uploadProgress,
}: AddResourceDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const isEditing = !!editingResource;

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "pdf",
      status: "draft",
      base_price: 0,
      selling_price: 0,
      thumbnail_url: "",
    },
  });

  const { handleSubmit, reset, control, watch } = form;

  const basePrice = watch("base_price");

  React.useEffect(() => {
    if (open) {
      if (editingResource) {
        reset({
          title: editingResource.title,
          description: editingResource.description,
          type: editingResource.type,
          status: editingResource.status,
          base_price: editingResource.base_price || 0,
          selling_price: editingResource.selling_price || 0,
          thumbnail_url: editingResource.thumbnail_url || "",
        });
      } else {
        reset({
          title: "",
          description: "",
          type: "pdf",
          status: "draft",
          base_price: 0,
          selling_price: 0,
          thumbnail_url: "",
        });
      }
      setFile(null);
    }
  }, [open, editingResource, reset]);

  const onFormSubmit = async (data: ResourceFormValues) => {
    if (!isEditing && !file) {
      form.setError("title", { message: "Please upload a PDF file" });
      return;
    }
    await onSubmit(data, file);
  };

  return (
    <FormDialog
      title={isEditing ? "Edit Resource" : "Add New Resource"}
      description={
        isEditing
          ? "Update resource details and pricing."
          : "Upload a PDF, set pricing, and publish to students."
      }
      isOpen={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit(onFormSubmit)}
      loading={isSubmitting}
      submitText={isEditing ? "Save Changes" : "Add Resource"}
      size="xl"
    >
      <Form {...form}>
        <div className="grid grid-cols-2 gap-4">
          {/* Row 1 — Title */}
          <FormField
            control={control}
            name="title"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. NEET Biology Notes 2024" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Row 2 — Type + Status */}
          <FormField
            control={control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="notes">Notes</SelectItem>
                    <SelectItem value="book">Book</SelectItem>
                  </SelectContent>
                </Select>
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Row 3 — Pricing */}
          <FormField
            control={control}
            name="base_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Price (₹)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    placeholder="0"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
                {basePrice === 0 && (
                  <p className="text-[11px] text-emerald-600 font-medium">
                    Free resource
                  </p>
                )}
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
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    placeholder="0"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Row 4 — File Upload */}
          <div className="col-span-2 space-y-2">
            <Label className="text-[13px] font-semibold tracking-wide text-foreground/80">
              File Upload {!isEditing && <span className="text-destructive">*</span>}
            </Label>
            <label className="flex items-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                {file ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <FileUp className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {file ? (
                  <>
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : isEditing && editingResource?.file_url ? (
                  <>
                    <p className="text-sm font-medium">Current file uploaded</p>
                    <p className="text-[11px] text-muted-foreground">
                      Select a new file to replace
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-muted-foreground">
                      Click to upload PDF
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      PDF only, max 50MB
                    </p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>

            {/* Upload progress */}
            {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-1">
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground text-right">
                  Uploading… {uploadProgress}%
                </p>
              </div>
            )}
          </div>

          {/* Row 5 — Thumbnail URL */}
          <FormField
            control={control}
            name="thumbnail_url"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Thumbnail URL (optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://..." />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Row 6 — Description */}
          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Describe the resource content…"
                    className="min-h-[80px] resize-none"
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
