import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Clock, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { blogService } from "@/services/blogService";
import { EMPTY_BLOG_FORM, type BlogFormData } from "@/features/blogs/types";
import { cn } from "@/lib/utils";
import { BlogEditorLayout } from "@/features/blogs/components/BlogEditorLayout";
import { BlogTitleInput } from "@/features/blogs/components/BlogTitleInput";
import { BlogContentEditor } from "@/features/blogs/components/BlogContentEditor";
import { BlogSettingsPanel } from "@/features/blogs/components/BlogSettingsPanel";
import { useAuthStore } from "@/stores/useAuthStore";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

function extractText(node: any): string {
  if (!node) return "";
  if (node.type === "text") return node.text || "";
  return (node.content || []).map(extractText).join(" ");
}

function isContentEmpty(content: Record<string, any>): boolean {
  if (!content || !Array.isArray(content.content)) return true;
  const hasText = extractText(content).trim().length > 0;
  const hasImage = JSON.stringify(content).includes('"type":"image"');
  return !hasText && !hasImage;
}

function calculateStats(content: any) {
  const text = extractText(content).replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(" ").filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  return { words, readingTime };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function BlogEditorPage() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const { profile, user } = useAuthStore();

  const [formData, setFormData] = useState<BlogFormData>({ ...EMPTY_BLOG_FORM });
  const [authorOptions, setAuthorOptions] = useState<Array<{ id: string; name: string; email: string; role: string; avatar_url: string; bio: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const formDataRef = useRef(formData);
  formDataRef.current = formData;
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slugValidationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stats = useMemo(() => calculateStats(formData.content), [formData.content]);

  const currentAdminAuthor = useMemo(() => {
    const resolvedName = profile?.name || user?.user_metadata?.full_name || user?.email || "";
    const resolvedEmail = user?.email || profile?.email || "";
    const resolvedId = profile?.id || user?.id || "";

    const matchedAuthor = authorOptions.find((author) => {
      return author.id === resolvedId || author.email === resolvedEmail || author.name === resolvedName;
    });

    if (matchedAuthor) {
      return matchedAuthor;
    }

    if (!resolvedName) {
      return null;
    }

    return {
      id: resolvedId,
      name: resolvedName,
      email: resolvedEmail,
      role: "Administrator",
      avatar_url: user?.user_metadata?.avatar_url || "",
      bio: user?.user_metadata?.bio || "",
    };
  }, [authorOptions, profile?.email, profile?.id, profile?.name, user?.email, user?.id, user?.user_metadata]);

  useEffect(() => {
    if (!blogId) {
      toast.error("Invalid blog ID");
      navigate("/admin/blogs");
      return;
    }

    (async () => {
      setIsLoading(true);
      try {
        const blog = await blogService.getBlog(blogId);
        if (!blog) {
          toast.error("Blog post not found");
          navigate("/admin/blogs");
          return;
        }

        setFormData({
          title: blog.title,
          slug: blog.slug,
          content: blog.content,
          excerpt: blog.excerpt || "",
          cover_image: blog.cover_image || "",
          meta_title: blog.meta_title || "",
          meta_description: blog.meta_description || "",
          category: blog.category || "",
          keywords: blog.keywords || [],
          author_id: blog.author_id || "",
          author_name: blog.author_name || "",
          author_role: blog.author_role || "",
          author_avatar_url: blog.author_avatar_url || "",
          author_bio: blog.author_bio || "",
          status: blog.status,
        });
        setSlugManuallyEdited(false);
        setSlugError(null);
        setIsDirty(false);
        setLastSaved(new Date(blog.updated_at || blog.created_at));
      } catch {
        toast.error("Failed to load blog");
        navigate("/admin/blogs");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [blogId, navigate]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const options = await blogService.getAuthorOptions();
        if (active) {
          setAuthorOptions(options);
        }
      } catch {
        if (active) {
          setAuthorOptions([]);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isLoading || !currentAdminAuthor || formData.author_name.trim()) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      author_id: currentAdminAuthor.id,
      author_name: currentAdminAuthor.name,
      author_role: currentAdminAuthor.role || prev.author_role || "Administrator",
      author_avatar_url: currentAdminAuthor.avatar_url || prev.author_avatar_url,
      author_bio: currentAdminAuthor.bio || prev.author_bio,
    }));
    setIsDirty(true);
  }, [currentAdminAuthor, formData.author_name, isLoading]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!blogId || isLoading || !isDirty) return;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      void saveBlog();
    }, 2500);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [blogId, formData, isDirty, isLoading]);

  useEffect(() => {
    if (!blogId || isLoading) return;

    if (slugValidationTimerRef.current) {
      clearTimeout(slugValidationTimerRef.current);
    }

    const slug = formData.slug.trim();
    if (!slug) {
      setSlugError("Slug is required");
      return;
    }

    slugValidationTimerRef.current = setTimeout(async () => {
      try {
        const existingBlog = await blogService.getBlogBySlug(slug);
        if (existingBlog && existingBlog.id !== blogId) {
          setSlugError("This slug is already in use.");
        } else {
          setSlugError(null);
        }
      } catch {
        setSlugError(null);
      }
    }, 300);

    return () => {
      if (slugValidationTimerRef.current) {
        clearTimeout(slugValidationTimerRef.current);
      }
    };
  }, [blogId, formData.slug, isLoading]);

  const handleChange = useCallback(
    (updates: Partial<BlogFormData>) => {
      setFormData((prev) => {
        const next = { ...prev, ...updates };

        if ("title" in updates && !slugManuallyEdited) {
          next.slug = slugify(updates.title || "");
        }

        if ("slug" in updates) {
          setSlugManuallyEdited(true);
        }

        setIsDirty(true);
        return next;
      });
    },
    [slugManuallyEdited]
  );

  const saveBlog = useCallback(
    async (publishOverride?: "published" | "draft") => {
      if (!blogId || isSaving) return;

      const currentForm = formDataRef.current;
      const nextStatus = publishOverride ?? currentForm.status;
      const nextSlug = currentForm.slug.trim();

      if (!currentForm.title.trim()) {
        toast.error(publishOverride ? "Title is required before publishing." : "Title is required.");
        return;
      }

      if (!nextSlug) {
        toast.error(publishOverride ? "Slug is required before publishing." : "Slug is required.");
        return;
      }

      if (isContentEmpty(currentForm.content)) {
        toast.error(publishOverride ? "Content is required before publishing." : "Content is required.");
        return;
      }

      if (publishOverride === "published" && !currentForm.author_name.trim()) {
        toast.error("Author is required before publishing.");
        return;
      }

      if (slugError) {
        toast.error(slugError);
        return;
      }

      const existingBlog = await blogService.getBlogBySlug(nextSlug);
      if (existingBlog && existingBlog.id !== blogId) {
        setSlugError("This slug is already in use.");
        toast.error("This slug is already in use.");
        return;
      }

      const saveData = {
        ...currentForm,
        status: nextStatus,
        slug: nextSlug,
        category: currentForm.category || "General",
      };

      setIsSaving(true);
      setSaveStatus("saving");

      try {
        await blogService.updateBlog(blogId, saveData);
        setLastSaved(new Date());
        setIsDirty(false);
        setSaveStatus("saved");
        setFormData((prev) => ({ ...prev, status: nextStatus, slug: nextSlug }));
        window.setTimeout(() => setSaveStatus("idle"), 1800);

        if (publishOverride === "published") {
          toast.success("Blog published.");
        } else if (publishOverride === "draft") {
          toast.success("Saved as draft.");
        }
      } catch (err: any) {
        const message = err?.message || "Failed to save";
        if (message.toLowerCase().includes("duplicate") || message.toLowerCase().includes("unique")) {
          setSlugError("This slug is already in use.");
          toast.error("This slug is already in use.");
        } else {
          toast.error(message);
        }
      } finally {
        setIsSaving(false);
      }
    },
    [blogId, isSaving, slugError]
  );

  const handleNavigateBack = useCallback(() => {
    if (isDirty && !window.confirm("You have unsaved changes. Leave without saving?")) {
      return;
    }
    navigate("/admin/blogs");
  }, [isDirty, navigate]);

  const handleUploadCover = useCallback(
    async (file: File) => {
      try {
        const url = await blogService.uploadBlogImage(file);
        handleChange({ cover_image: url });
        toast.success("Cover image uploaded.");
      } catch {
        toast.error("Failed to upload cover image.");
      }
    },
    [handleChange]
  );

  const renderArticlePreview = () => (
    <article className="space-y-6 rounded-2xl border border-border/60 bg-background px-6 py-8 lg:px-8 lg:py-10">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="px-2 py-1 text-[11px] normal-case">
            {formData.category || "General"}
          </Badge>
          {formData.status === "published" ? (
            <Badge className="px-2 py-1 text-[11px] normal-case">Published</Badge>
          ) : (
            <Badge variant="secondary" className="px-2 py-1 text-[11px] normal-case">Draft</Badge>
          )}
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">{formData.title || "Untitled blog post"}</h1>
          {formData.excerpt ? <p className="max-w-3xl text-base leading-7 text-muted-foreground">{formData.excerpt}</p> : null}
        </div>

        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={formData.author_avatar_url} alt={formData.author_name || "Author"} />
            <AvatarFallback>{getInitials(formData.author_name || currentAdminAuthor?.name || "Author") || "AU"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium text-foreground">{formData.author_name || currentAdminAuthor?.name || "Author name"}</p>
            <p className="text-sm text-muted-foreground">{formData.author_role || currentAdminAuthor?.role || "Writer"}</p>
          </div>
        </div>

        {formData.cover_image ? (
          <div className="overflow-hidden rounded-2xl border border-border/60">
            <img src={formData.cover_image} alt={formData.title || "Cover image"} className="h-auto w-full object-cover" />
          </div>
        ) : null}
      </header>

      <BlogContentEditor content={formData.content} onChange={() => {}} isPreview />

      <footer className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {formData.keywords.length ? formData.keywords.map((tag) => (
          <Badge key={tag} variant="outline" className="px-2 py-1 text-[11px] normal-case">
            {tag}
          </Badge>
        )) : null}
      </footer>
    </article>
  );

  const renderStatsPanel = () => (
    <Card className="border-border/60 bg-background">
      <CardContent className="space-y-4 p-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Writing stats</p>
          <p className="text-xs text-muted-foreground">Live snapshot of the draft.</p>
        </div>
        <div className="grid gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Words</span>
            <span className="font-medium">{stats.words}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Read time</span>
            <span className="font-medium">{stats.readingTime} min</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className={cn("font-medium", formData.status === "published" ? "text-emerald-600" : "text-foreground")}>{formData.status}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {saveStatus === "saving" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5" />}
          {saveStatus === "saving"
            ? "Saving changes"
            : lastSaved
              ? `Last saved ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : "Unsaved changes update automatically"}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="font-medium">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <BlogEditorLayout
      navigationRail={
        <div className="flex h-full min-h-0 flex-col gap-6 p-6">
          <div className="space-y-3">
            <Button variant="ghost" className="w-fit justify-start gap-2 px-0 text-sm font-medium" onClick={handleNavigateBack}>
              <ChevronLeft className="h-4 w-4" />
              Back to posts
            </Button>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Current article</p>
              <p className="truncate">{formData.title || "Untitled blog post"}</p>
            </div>
          </div>

          {renderStatsPanel()}

          {slugError ? (
            <div className="flex items-start gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{slugError}</p>
            </div>
          ) : null}
        </div>
      }
      settingsPanel={
        <BlogSettingsPanel
          formData={formData}
          authors={authorOptions}
          onChange={handleChange}
          onSaveDraft={() => void saveBlog()}
          onPublish={() => void saveBlog("published")}
          onTogglePreview={() => setIsPreview((current) => !current)}
          isPreview={isPreview}
          isSaving={isSaving}
          saveStatus={saveStatus}
          lastSaved={lastSaved}
          slugError={slugError}
          onUploadCover={handleUploadCover}
          onRemoveCover={() => handleChange({ cover_image: "" })}
        />
      }
    >
      <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col px-4 py-5 lg:px-8 lg:py-8">
        <div className="flex min-h-0 flex-1 flex-col gap-6 lg:hidden">
          <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
            <Button variant="ghost" className="h-9 gap-2 px-3 text-sm font-medium" onClick={handleNavigateBack}>
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="flex items-center gap-2 truncate">
              <span className="truncate">Blogs</span>
              <span>/</span>
              <span className="truncate text-foreground">{formData.title || "Untitled blog post"}</span>
            </div>
          </div>

          <Tabs defaultValue="write" className="min-h-0 flex-1">
            <TabsList variant="line" className="w-full justify-start">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="publish">Publish</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4 space-y-4">
              {renderStatsPanel()}
              {slugError ? (
                <div className="flex items-start gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{slugError}</p>
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="write" className="mt-4 space-y-4">
              <div className="space-y-2">
                <BlogTitleInput value={formData.title} onChange={(value) => handleChange({ title: value })} disabled={false} />
                <p className="text-sm text-muted-foreground">Write with focus. Metadata stays in the publishing panel.</p>
              </div>

              {isPreview ? (
                renderArticlePreview()
              ) : (
                <BlogContentEditor content={formData.content} onChange={(content) => handleChange({ content })} isPreview={false} />
              )}
            </TabsContent>

            <TabsContent value="publish" className="mt-4">
              <BlogSettingsPanel
                formData={formData}
                authors={authorOptions}
                onChange={handleChange}
                onSaveDraft={() => void saveBlog()}
                onPublish={() => void saveBlog("published")}
                onTogglePreview={() => setIsPreview((current) => !current)}
                isPreview={isPreview}
                isSaving={isSaving}
                saveStatus={saveStatus}
                lastSaved={lastSaved}
                slugError={slugError}
                onUploadCover={handleUploadCover}
                onRemoveCover={() => handleChange({ cover_image: "" })}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden min-h-0 flex-1 flex-col space-y-6 lg:flex">
          <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
            <Button variant="ghost" className="h-9 gap-2 px-3 text-sm font-medium" onClick={handleNavigateBack}>
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="flex items-center gap-2 truncate">
              <span className="truncate">Blogs</span>
              <span>/</span>
              <span className="truncate text-foreground">{formData.title || "Untitled blog post"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <BlogTitleInput
              value={formData.title}
              onChange={(value) => handleChange({ title: value })}
              disabled={false}
            />
            <p className="text-sm text-muted-foreground">Write with focus. Metadata stays in the publishing panel.</p>
          </div>

          {isPreview ? renderArticlePreview() : <BlogContentEditor content={formData.content} onChange={(content) => handleChange({ content })} isPreview={false} />}
        </div>
      </div>
    </BlogEditorLayout>
  );
}
