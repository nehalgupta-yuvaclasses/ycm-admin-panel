import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { EmptyState } from "@/components/shared/empty-state";
import { cmsService, type FAQ } from "@/services/cmsService";

const faqSchema = z.object({
  question: z.string().trim().min(5, "Question is required"),
  answer: z.string().trim().min(10, "Answer is required"),
});

type FAQFormValues = z.infer<typeof faqSchema>;

const emptyValues: FAQFormValues = {
  question: "",
  answer: "",
};

export function FAQManager() {
  const [items, setItems] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQ | null>(null);
  const [open, setOpen] = useState(false);

  const form = useForm<FAQFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: emptyValues,
  });

  const { handleSubmit, reset, control } = form;

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const data = await cmsService.getFAQs();
      setItems(data);
    } catch {
      toast.error("Failed to load FAQs");
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
          ? { question: editingItem.question, answer: editingItem.answer }
          : emptyValues,
      );
    }
  }, [editingItem, open, reset]);

  const openCreate = () => {
    setEditingItem(null);
    setOpen(true);
  };

  const openEdit = (item: FAQ) => {
    setEditingItem(item);
    setOpen(true);
  };

  const handleSave = async (values: FAQFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingItem?.id) {
        await cmsService.updateFAQ(editingItem.id, values);
        toast.success("FAQ updated");
      } else {
        await cmsService.createFAQ(values);
        toast.success("FAQ added");
      }
      setOpen(false);
      setEditingItem(null);
      await fetchItems();
    } catch {
      toast.error("Failed to save FAQ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: FAQ) => {
    if (!item.id) return;
    if (!window.confirm("Delete this FAQ?")) return;

    try {
      await cmsService.deleteFAQ(item.id);
      toast.success("FAQ deleted");
      await fetchItems();
    } catch {
      toast.error("Failed to delete FAQ");
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-border/60 pb-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">FAQ management</p>
          <p className="text-sm text-muted-foreground">Create, edit, and remove frequently asked questions.</p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add FAQ
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="h-24 animate-pulse border-border/60 bg-muted/20" />
          ))}
        </div>
      ) : items.length ? (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id} className="border-border/60">
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-foreground">{item.question}</h3>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{item.answer}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => openEdit(item)}>
                    <Edit2 className="h-4 w-4" /> Edit
                  </Button>
                  <Button type="button" variant="destructive" size="sm" className="gap-2" onClick={() => handleDelete(item)}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Plus}
          title="No FAQs yet"
          description="Answer common questions once, then keep them updated here."
          action={{ label: "Add FAQ", onClick: openCreate, icon: Plus }}
        />
      )}

      <Dialog open={open} onOpenChange={isSubmitting ? undefined : setOpen}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-2xl p-0 sm:max-w-2xl">
          <DialogHeader>
            <div>
              <DialogTitle>{editingItem ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
              <DialogDescription>Keep the answer concise and useful.</DialogDescription>
            </div>
          </DialogHeader>
          <Form {...form}>
            <form id="faq-form" onSubmit={handleSubmit(handleSave)} className="grid gap-4 p-4">
              <FormField
                control={control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="How do students access recordings?" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Answer</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={5} placeholder="Provide a clear answer" className="resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter className="px-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" form="faq-form" disabled={isSubmitting}>
              {editingItem ? "Save FAQ" : "Add FAQ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
