import { useEffect, useMemo, useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GripVertical, Pencil, Plus, Trash2, Eye, EyeOff, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { cmsService, type Banner } from "@/services/cmsService";
import { storageService } from "@/services/storageService";

const bannerSchema = z.object({
  title: z.string().trim().min(3, "Title is required"),
  subtitle: z.string().trim().min(3, "Subtitle is required"),
  cta_text: z.string().trim().min(2, "CTA text is required"),
  cta_link: z.string().trim().min(1, "CTA link is required"),
  is_active: z.boolean(),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

interface BannerDialogState {
  open: boolean;
  banner: Banner | null;
}

const emptyForm: BannerFormValues = {
  title: "",
  subtitle: "",
  cta_text: "",
  cta_link: "",
  is_active: true,
};

export function BannerManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogState, setDialogState] = useState<BannerDialogState>({ open: false, banner: null });
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: emptyForm,
  });

  const { handleSubmit, reset, control, watch, setValue } = form;

  const activeCount = useMemo(() => banners.filter((banner) => banner.is_active).length, [banners]);

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const data = await cmsService.getBanners();
      setBanners(data);
    } catch {
      toast.error("Failed to load banners");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchBanners();
  }, []);

  useEffect(() => {
    if (dialogState.open) {
      const banner = dialogState.banner;
      reset(
        banner
          ? {
              title: banner.title,
              subtitle: banner.subtitle || "",
              cta_text: banner.cta_text || "",
              cta_link: banner.cta_link || "",
              is_active: banner.is_active,
            }
          : emptyForm,
      );
    }
  }, [dialogState.banner, dialogState.open, reset]);

  const openAddDialog = () => setDialogState({ open: true, banner: null });
  const openEditDialog = (banner: Banner) => setDialogState({ open: true, banner });

  const handleSave = async (values: BannerFormValues, imageFile: File | null) => {
    setIsSubmitting(true);
    try {
      if (dialogState.banner?.id) {
        const nextImageUrl = imageFile ? await uploadImage(imageFile) : dialogState.banner.image_url;
        await cmsService.updateBanner(dialogState.banner.id, {
          ...values,
          image_url: nextImageUrl,
        });
        toast.success("Banner updated");
      } else {
        const imageUrl = await uploadImage(imageFile);
        await cmsService.createBanner({
          ...values,
          image_url: imageUrl,
        });
        toast.success("Banner added");
      }

      setDialogState({ open: false, banner: null });
      await fetchBanners();
    } catch {
      toast.error("Failed to save banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (banner: Banner) => {
    if (!banner.id) return;
    if (!window.confirm("Delete this banner?")) return;

    try {
      await cmsService.deleteBanner(banner.id);
      toast.success("Banner deleted");
      await fetchBanners();
    } catch {
      toast.error("Failed to delete banner");
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    if (!banner.id) return;

    try {
      await cmsService.updateBanner(banner.id, { is_active: !banner.is_active });
      toast.success("Banner status updated");
      await fetchBanners();
    } catch {
      toast.error("Failed to update banner status");
    }
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>, id?: string) => {
    if (!id) return;
    event.dataTransfer.setData("text/plain", id);
    event.dataTransfer.effectAllowed = "move";
    setDraggingId(id);
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>, targetId?: string) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData("text/plain");
    setDraggingId(null);

    if (!sourceId || !targetId || sourceId === targetId) return;

    const currentIndex = banners.findIndex((banner) => banner.id === sourceId);
    const targetIndex = banners.findIndex((banner) => banner.id === targetId);
    if (currentIndex < 0 || targetIndex < 0) return;

    const next = [...banners];
    const [moved] = next.splice(currentIndex, 1);
    next.splice(targetIndex, 0, moved);

    const ordered = next.map((banner, index) => ({ id: banner.id!, sort_order: index }));
    setBanners(next.map((banner, index) => ({ ...banner, sort_order: index })));

    try {
      await cmsService.reorderBanners(ordered);
      toast.success("Banner order saved");
    } catch {
      toast.error("Failed to reorder banners");
      await fetchBanners();
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-border/60 pb-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Hero banners</p>
          <p className="text-sm text-muted-foreground">Manage slider banners with drag order, copy, and call to action links.</p>
          <p className="text-xs text-muted-foreground">{activeCount} active banner{activeCount === 1 ? "" : "s"}.</p>
        </div>
        <Button className="gap-2 md:w-auto" onClick={openAddDialog}>
          <Plus className="h-4 w-4" /> Add Banner
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="h-[320px] animate-pulse border-border/60 bg-muted/20" />
          ))}
        </div>
      ) : banners.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {banners.map((banner) => (
            <Card
              key={banner.id}
              draggable
              onDragStart={(event) => handleDragStart(event, banner.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, banner.id)}
              className={cn(
                "overflow-hidden border-border/60 transition-all",
                draggingId === banner.id && "opacity-60 ring-1 ring-primary/30",
              )}
            >
              <div className="relative aspect-[16/9] border-b border-border/60 bg-muted/20">
                <img src={banner.image_url} alt={banner.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute left-3 top-3 flex items-center gap-2">
                  <Badge variant={banner.is_active ? "default" : "secondary"} className="px-2 py-1 text-[11px] normal-case">
                    {banner.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="absolute right-3 top-3 flex items-center gap-2 text-white/80">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 space-y-1 p-4 text-white">
                  <p className="text-xs text-white/75">{banner.subtitle || "Banner subtitle"}</p>
                  <h3 className="text-lg font-semibold leading-tight">{banner.title}</h3>
                  <p className="text-xs text-white/80">{banner.cta_text || "Call to action"} · {banner.cta_link || "/"}</p>
                </div>
              </div>

              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>Drag to reorder</span>
                  <span>{banner.sort_order ?? 0}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => openEditDialog(banner)}>
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => handleToggleActive(banner)}>
                    {banner.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {banner.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button type="button" variant="destructive" size="sm" className="gap-2" onClick={() => handleDelete(banner)}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Upload}
          title="No banners yet"
          description="Add banners to drive homepage campaigns and promotions."
          action={{ label: "Add your first banner", onClick: openAddDialog, icon: Plus }}
        />
      )}

      <BannerDialog
        open={dialogState.open}
        banner={dialogState.banner}
        onOpenChange={(open) => setDialogState((current) => ({ open, banner: open ? current.banner : null }))}
        onSubmit={handleSave}
        isSubmitting={isSubmitting}
      />
    </section>
  );
}

interface BannerDialogProps {
  open: boolean;
  banner: Banner | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BannerFormValues, imageFile: File | null) => Promise<void>;
  isSubmitting: boolean;
}

function BannerDialog({ open, banner, onOpenChange, onSubmit, isSubmitting }: BannerDialogProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(banner?.image_url || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: emptyForm,
  });

  const { handleSubmit, reset, control, watch, setValue } = form;
  const watchedValues = watch();
  const isEditing = Boolean(banner?.id);
  const active = watch("is_active");

  useEffect(() => {
    if (open) {
      reset(
        banner
          ? {
              title: banner.title,
              subtitle: banner.subtitle || "",
              cta_text: banner.cta_text || "",
              cta_link: banner.cta_link || "",
              is_active: banner.is_active,
            }
          : emptyForm,
      );
      setImageFile(null);
      setPreviewUrl(banner?.image_url || "");
    }
  }, [banner, open, reset]);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleImageChange(event.target.files?.[0] || null);
  };

  const onFormSubmit = async (values: BannerFormValues) => {
    if (!isEditing && !imageFile) {
      form.setError("title", { message: "Please upload a banner image" });
      return;
    }

    await onSubmit(values, imageFile);
  };

  return (
    <Dialog open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] max-w-5xl p-0 sm:max-w-5xl">
        <DialogHeader className="border-b border-border/60 bg-muted/20 px-5 py-4">
          <div className="space-y-1">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              {isEditing ? "Edit Banner" : "Add Banner"}
            </DialogTitle>
            <DialogDescription>
              Shape the homepage slider with a message, visual, and call to action.
            </DialogDescription>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form id="banner-form" onSubmit={handleSubmit(onFormSubmit)} className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5 border-b border-border/60 p-5 lg:border-b-0 lg:border-r lg:border-border/60">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Content</p>
                <p className="text-xs text-muted-foreground">Write the banner copy and choose the button label.</p>
              </div>

              <FormField
                control={control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Summer batch admissions open" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} className="resize-none" placeholder="Short supporting message for the banner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={control}
                  name="cta_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CTA text</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Explore now" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="cta_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CTA link</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="/courses" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="mb-3 space-y-1">
                  <Label>Banner image</Label>
                  <p className="text-xs text-muted-foreground">Upload a wide image for the homepage slider.</p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "group flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-background px-4 py-8 text-center transition-colors hover:border-border hover:bg-muted/20",
                    previewUrl && "overflow-hidden p-0",
                  )}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Banner preview" className="h-56 w-full object-cover" />
                  ) : (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-muted-foreground">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">Upload image</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, or WebP. Recommended 1920×600px.</p>
                      </div>
                    </>
                  )}
                </button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="sr-only"
                />
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{imageFile ? imageFile.name : banner?.image_url ? "Existing image will stay if unchanged" : "No image selected"}</span>
                  {previewUrl ? (
                    <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => { setImageFile(null); setPreviewUrl(""); }}>
                      Clear
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Preview</p>
                <p className="text-xs text-muted-foreground">This is how the banner will feel in the slider.</p>
              </div>

              <Card className="overflow-hidden border-border/60">
                <div className="relative aspect-[16/10] bg-muted/30">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Banner preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Image preview appears here</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute left-4 right-4 bottom-4 space-y-2 text-white">
                    <Badge variant={active ? "default" : "secondary"} className="px-2 py-1 text-[11px] normal-case">
                      {active ? "Active" : "Inactive"}
                    </Badge>
                    <h3 className="text-lg font-semibold leading-tight">{watchedValues.title || "Banner title"}</h3>
                    <p className="text-sm leading-6 text-white/80">{watchedValues.subtitle || "Supporting message for the banner."}</p>
                    <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                      {watchedValues.cta_text || "CTA text"} · {watchedValues.cta_link || "/"}
                    </div>
                  </div>
                </div>
              </Card>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Publish state</p>
                    <p className="text-xs text-muted-foreground">Active banners are visible on the homepage.</p>
                  </div>
                  <Switch checked={active} onCheckedChange={(checked) => setValue("is_active", checked)} />
                </div>
              </div>
            </div>
          </form>
        </Form>
        <DialogFooter className="px-5">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="banner-form" disabled={isSubmitting}>
            {isEditing ? "Save Banner" : "Add Banner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

async function uploadImage(file: File): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`;
  return storageService.uploadFile("cms-images", fileName, file);
}
