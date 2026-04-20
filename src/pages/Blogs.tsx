import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  PenLine,
  Trash2,
  MoreVertical,
  Calendar,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { blogService } from "@/services/blogService";
import { toast } from "sonner";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/services/apiUtils";
import { AddBlogDialog } from "@/features/blogs/components/AddBlogDialog";
import type { Blog } from "@/features/blogs/types";

export default function Blogs() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const data = await blogService.getBlogs();
      setBlogs(data);
    } catch (error) {
      toast.error("Failed to fetch blogs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (values: { title: string; slug: string; excerpt: string }) => {
    setIsSubmitting(true);
    try {
      const created = await blogService.createBlog({
        title: values.title,
        slug: values.slug,
        excerpt: values.excerpt,
        content: {},
        cover_image: "",
        meta_title: "",
        meta_description: "",
        category: "General",
        keywords: [],
        author_id: "",
        author_name: "",
        author_role: "",
        author_avatar_url: "",
        author_bio: "",
        status: "draft",
      });
      toast.success("Blog post created");
      setIsCreateOpen(false);
      navigate(`/admin/blogs/${created.id}`);
    } catch (err: any) {
      const msg = err?.message || "Failed to create blog";
      if (msg.includes("duplicate") || msg.includes("unique")) {
        toast.error("This slug is already in use. Choose a different one.");
      } else {
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;
    try {
      await blogService.deleteBlog(id);
      toast.success("Blog deleted");
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } catch {
      toast.error("Failed to delete blog");
    }
  };

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesSearch = blog.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || blog.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [blogs, searchQuery, statusFilter]);

  const columns = useMemo(
    () => [
      {
        header: "Post",
        className: "w-[400px]",
        cell: (blog: Blog) => (
          <div className="flex items-center gap-4">
            {blog.cover_image ? (
              <img
                src={blog.cover_image}
                alt=""
                className="h-11 w-16 rounded-lg object-cover border"
              />
            ) : (
              <div className="flex h-11 w-16 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <PenLine className="h-4 w-4" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-medium text-foreground truncate">{blog.title}</p>
              {blog.excerpt && (
                <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-[300px]">
                  {blog.excerpt}
                </p>
              )}
            </div>
          </div>
        ),
      },
      {
        header: "Status",
        cell: (blog: Blog) => (
          <Badge
            variant={blog.status === "published" ? "default" : "secondary"}
            className={
              blog.status === "published"
                ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                : "bg-muted text-muted-foreground"
            }
          >
            {blog.status}
          </Badge>
        ),
      },
      {
        header: "Created",
        cell: (blog: Blog) => (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(blog.created_at)}
          </div>
        ),
      },
      {
        header: "Updated",
        cell: (blog: Blog) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(blog.updated_at)}
          </span>
        ),
      },
      {
        header: "Actions",
        className: "text-right",
        cell: (blog: Blog) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => navigate(`/admin/blogs/${blog.id}`)}
            >
              <PenLine className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                nativeButton={true}
                render={
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-48 p-2">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Actions
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => navigate(`/admin/blogs/${blog.id}`)}
                    className="rounded-lg"
                  >
                    <PenLine className="mr-2 h-4 w-4" /> Edit Post
                  </DropdownMenuItem>
                  {blog.slug && (
                    <DropdownMenuItem
                      onClick={() => window.open(`/blog/${blog.slug}`, "_blank")}
                      className="rounded-lg"
                    >
                      <Eye className="mr-2 h-4 w-4" /> View Live
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem
                  className="rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onClick={() => handleDelete(blog.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [navigate]
  );

  return (
    <PageContainer className="animate-in fade-in duration-500">
      <PageHeader
        title="Blog Posts"
        description="Create and manage blog content for your website."
      >
        <Button
          className="h-11 gap-2 px-6"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </PageHeader>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <PageToolbar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search blog posts..."
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-11">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredBlogs}
        isLoading={isLoading}
        emptyState={
          <EmptyState
            icon={PenLine}
            title="No blog posts yet"
            description={
              searchQuery || statusFilter !== "all"
                ? `No results matching your filters. Try adjusting your search.`
                : "Start creating content for your website blog."
            }
            action={
              searchQuery || statusFilter !== "all"
                ? undefined
                : {
                    label: "Write first post",
                    onClick: () => setIsCreateOpen(true),
                    icon: Plus,
                  }
            }
          />
        }
      />

      <AddBlogDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />
    </PageContainer>
  );
}
