import { useEffect, useState } from "react";
import { ArrowUpRight, Plus, RefreshCw, PencilLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { blogService } from "@/services/blogService";
import type { Blog } from "@/features/blogs/types";

export function BlogManager() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const data = await blogService.getBlogs();
      setBlogs(data.slice(0, 6));
    } catch {
      toast.error("Failed to load blogs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchBlogs();
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-border/60 pb-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Blog management</p>
          <p className="text-sm text-muted-foreground">Blogs are managed in the dedicated blog CMS, linked here for quick access.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={fetchBlogs} disabled={isLoading}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button className="gap-2" onClick={() => navigate("/admin/blogs") }>
            <Plus className="h-4 w-4" /> Manage blogs
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="h-40 animate-pulse border-border/60 bg-muted/20" />
          ))}
        </div>
      ) : blogs.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {blogs.map((blog) => (
            <Card key={blog.id} className="border-border/60">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-foreground">{blog.title}</p>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{blog.excerpt || "No excerpt yet"}</p>
                  </div>
                  <Badge variant={blog.status === "published" ? "default" : "secondary"} className="px-2 py-1 text-[11px] normal-case">
                    {blog.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{blog.category || "Uncategorized"}</span>
                  <span>{new Date(blog.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => navigate(`/admin/blogs/${blog.id}`)}>
                    <PencilLine className="h-4 w-4" /> Edit
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={() => window.open(`/blog/${blog.slug}`, "_blank")}>
                    <ArrowUpRight className="h-4 w-4" /> View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border/60">
          <CardContent className="p-6 text-sm text-muted-foreground">No blog posts found.</CardContent>
        </Card>
      )}
    </section>
  );
}
