import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Edit2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { EmptyState } from "@/components/shared/empty-state";
import { cmsService, type Result } from "@/services/cmsService";
import { storageService } from "@/services/storageService";

const resultSchema = z.object({
  student_name: z.string().trim().min(2, "Student name is required"),
  exam: z.string().trim().min(2, "Exam is required"),
  result: z.string().trim().min(1, "Result is required"),
  image_url: z.string().trim().min(1, "Image URL is required"),
});

type ResultFormValues = z.infer<typeof resultSchema>;

const emptyValues: ResultFormValues = {
  student_name: "",
  exam: "",
  result: "",
  image_url: "",
};

export function ResultsManager() {
  const [items, setItems] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<Result | null>(null);
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ResultFormValues>({
    resolver: zodResolver(resultSchema),
    defaultValues: emptyValues,
  });

  const { handleSubmit, reset, control, setValue } = form;

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const data = await cmsService.getResults();
      setItems(data);
    } catch {
      toast.error("Failed to load results");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchItems();
  }, []);

  useEffect(() => {
    if (open) {
      reset(
        editingItem
          ? {
              student_name: editingItem.student_name,
              exam: editingItem.exam,
              result: editingItem.result || editingItem.rank || "",
              image_url: editingItem.image_url || "",
            }
          : emptyValues,
      );
    }
  }, [editingItem, open, reset]);

  const openCreate = () => {
    setEditingItem(null);
    setOpen(true);
  };

  const openEdit = (item: Result) => {
    setEditingItem(item);
    setOpen(true);
  };

  const handleSave = async (values: ResultFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        student_name: values.student_name,
        exam: values.exam,
        result: values.result,
        rank: values.result,
        image_url: values.image_url,
      };

      if (editingItem?.id) {
        await cmsService.updateResult(editingItem.id, payload);
        toast.success("Result updated");
      } else {
        await cmsService.createResult(payload);
        toast.success("Result added");
      }

      setOpen(false);
      setEditingItem(null);
      await fetchItems();
    } catch {
      toast.error("Failed to save result");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: Result) => {
    if (!item.id) return;
    if (!window.confirm("Delete this result?")) return;

    try {
      await cmsService.deleteResult(item.id);
      toast.success("Result deleted");
      await fetchItems();
    } catch {
      toast.error("Failed to delete result");
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-border/60 pb-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Results and achievements</p>
          <p className="text-sm text-muted-foreground">Showcase student success stories with simple CRUD controls.</p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Result
        </Button>
      </div>

      {isLoading ? (
        <div className="grid justify-items-center gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="h-[30rem] w-full max-w-[18rem] animate-pulse overflow-hidden border-border/60 bg-muted/20" />
          ))}
        </div>
      ) : items.length ? (
        <div className="grid justify-items-center gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {items.map((item) => (
            <Card key={item.id} className="flex h-[30rem] w-full max-w-[18rem] flex-col overflow-hidden border-border/60 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <div className="h-56 border-b border-border/60 bg-muted/20">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.student_name} className="h-full w-full object-cover object-center" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted/40 via-background to-muted/20 text-sm font-medium text-muted-foreground">
                    No image available
                  </div>
                )}
              </div>
              <CardContent className="flex flex-1 flex-col gap-3 p-3.5">
                <div className="space-y-1.5">
                  <p className="truncate text-sm font-semibold leading-none text-foreground">{item.student_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.exam}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm">
                  <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">Result</span>
                  <p className="mt-1 text-sm font-semibold text-foreground">{item.result || item.rank}</p>
                </div>
                <div className="mt-auto flex gap-2">
                  <Button type="button" variant="outline" size="sm" className="h-8 flex-1 gap-1.5 text-xs" onClick={() => openEdit(item)}>
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button type="button" variant="destructive" size="sm" className="h-8 flex-1 gap-1.5 text-xs" onClick={() => handleDelete(item)}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Upload}
          title="No results uploaded"
          description="Add success stories to build trust and social proof."
          action={{ label: "Add result", onClick: openCreate, icon: Plus }}
        />
      )}

      <Dialog open={open} onOpenChange={isSubmitting ? undefined : setOpen}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-2xl p-0 sm:max-w-2xl">
          <DialogHeader className="border-b border-border/60 bg-muted/20 px-5 py-4">
            <div className="space-y-1">
              <DialogTitle className="text-lg font-semibold tracking-tight">{editingItem ? "Edit Result" : "Add Result"}</DialogTitle>
              <DialogDescription>Upload a student image and enter the result details.</DialogDescription>
            </div>
          </DialogHeader>
          <Form {...form}>
            <form id="result-form" onSubmit={handleSubmit(handleSave)} className="space-y-5 p-5">
              <div className="space-y-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Content</p>
                  <p className="text-xs text-muted-foreground">Capture the student, exam, and achievement text.</p>
                </div>

                <FormField
                  control={control}
                  name="student_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Sarah Johnson" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={control}
                    name="exam"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exam</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="NEET 2024" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="result"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Result</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Rank 42" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Upload image</p>
                      <p className="text-xs text-muted-foreground">Uploads fill the image URL field automatically.</p>
                    </div>
                    <Button type="button" variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4" /> Choose file
                    </Button>
                  </div>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={async (event) => {
                      const file = event.target.files?.[0] || null;
                      if (!file) return;
                      try {
                        const uploaded = await uploadImage(file);
                        setValue("image_url", uploaded, { shouldDirty: true, shouldValidate: true });
                        toast.success("Image uploaded");
                      } catch {
                        toast.error("Failed to upload image");
                      } finally {
                        event.target.value = "";
                      }
                    }}
                    className="sr-only"
                  />
                </div>
              </div>

            </form>
          </Form>
          <DialogFooter className="px-5">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" form="result-form" disabled={isSubmitting}>
              {editingItem ? "Save Result" : "Add Result"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

async function uploadImage(file: File): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;
  return storageService.uploadFile("cms-images", fileName, file);
}
