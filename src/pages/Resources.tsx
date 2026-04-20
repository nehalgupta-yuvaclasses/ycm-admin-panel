import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  FileText,
  Pencil,
  Trash2,
  Download,
  BookOpen,
  StickyNote,
  Book,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";

import { AddResourceDialog } from "@/features/resources/components/AddResourceDialog";
import {
  fetchResources,
  createResource,
  updateResource,
  deleteResource,
  uploadResourceFile,
} from "@/features/resources/api";
import type { Resource, ResourceFormValues, ResourceFilters } from "@/features/resources/types";

// ── Helpers ──────────────────────────────────────────────────────────

const TYPE_ICON: Record<Resource["type"], React.ReactNode> = {
  pdf: <FileText className="h-3.5 w-3.5" />,
  notes: <StickyNote className="h-3.5 w-3.5" />,
  book: <Book className="h-3.5 w-3.5" />,
};

const TYPE_COLORS: Record<Resource["type"], string> = {
  pdf: "border-red-500/20 bg-red-500/10 text-red-600",
  notes: "border-amber-500/20 bg-amber-500/10 text-amber-600",
  book: "border-blue-500/20 bg-blue-500/10 text-blue-600",
};

// ── Page ─────────────────────────────────────────────────────────────

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null);

  // Filters
  const [filters, setFilters] = useState<ResourceFilters>({
    search: "",
    type: "all",
    status: "all",
  });

  // ── Fetch ────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchResources();
      setResources(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load resources");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Filtered data ────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let out = resources;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      out = out.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }
    if (filters.type !== "all") out = out.filter((r) => r.type === filters.type);
    if (filters.status !== "all")
      out = out.filter((r) => r.status === filters.status);
    return out;
  }, [resources, filters]);

  // ── Handlers ─────────────────────────────────────────────────────

  const handleSubmit = async (values: ResourceFormValues, file: File | null) => {
    setIsSubmitting(true);
    setUploadProgress(0);
    try {
      let fileUrl = editingResource?.file_url || "";

      if (file) {
        fileUrl = await uploadResourceFile(file, setUploadProgress);
      }

      const isPaid = values.base_price > 0;

      const payload = {
        title: values.title,
        description: values.description,
        type: values.type,
        file_url: fileUrl,
        thumbnail_url: values.thumbnail_url || null,
        base_price: values.base_price,
        selling_price: values.selling_price,
        is_paid: isPaid,
        status: values.status,
      };

      if (editingResource) {
        await updateResource(editingResource.id, payload);
        toast.success("Resource updated");
      } else {
        await createResource(payload as any);
        toast.success("Resource created");
      }

      setIsAddOpen(false);
      setEditingResource(null);
      await load();
    } catch (err: any) {
      toast.error(err.message || "Failed to save resource");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteResource(deleteTarget.id);
      toast.success("Resource deleted");
      setDeleteTarget(null);
      await load();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const openEdit = (r: Resource) => {
    setEditingResource(r);
    setIsAddOpen(true);
  };

  // ── Columns ──────────────────────────────────────────────────────

  const columns = [
    {
      header: "Resource",
      cell: (r: Resource) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-lg border border-border/50 bg-muted flex items-center justify-center overflow-hidden">
            {r.thumbnail_url ? (
              <img
                src={r.thumbnail_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <FileText className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground text-sm">
              {r.title}
            </p>
            <p className="truncate text-xs text-muted-foreground max-w-[240px]">
              {r.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      cell: (r: Resource) => (
        <Badge
          variant="outline"
          className={cn("gap-1 capitalize", TYPE_COLORS[r.type])}
        >
          {TYPE_ICON[r.type]} {r.type}
        </Badge>
      ),
    },
    {
      header: "Price",
      cell: (r: Resource) =>
        r.is_paid ? (
          <div className="text-sm">
            <span className="text-muted-foreground line-through mr-1.5">
              ₹{r.base_price}
            </span>
            <span className="font-semibold">₹{r.selling_price}</span>
          </div>
        ) : (
          <Badge
            variant="outline"
            className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
          >
            Free
          </Badge>
        ),
    },
    {
      header: "Status",
      cell: (r: Resource) => (
        <Badge
          variant={r.status === "active" ? "default" : "secondary"}
          className={cn(
            r.status === "active" &&
              "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
          )}
        >
          {r.status}
        </Badge>
      ),
    },
    {
      header: "Created",
      cell: (r: Resource) => (
        <span className="text-sm text-muted-foreground">
          {new Date(r.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      header: "",
      className: "text-right w-[120px]",
      cell: (r: Resource) => (
        <div className="flex items-center justify-end gap-1">
          {r.file_url && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                window.open(r.file_url, "_blank");
              }}
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(r);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(r);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  // ── Render ───────────────────────────────────────────────────────

  return (
    <PageContainer>
      <PageHeader
        title="Resources"
        description="Upload and manage digital resources — PDFs, notes, and books."
      />

      <PageToolbar
        searchValue={filters.search}
        onSearchChange={(v) => setFilters((f) => ({ ...f, search: v }))}
        searchPlaceholder="Search resources…"
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={filters.type}
              onValueChange={(v: any) => setFilters((f) => ({ ...f, type: v }))}
            >
              <SelectTrigger size="sm" className="w-[110px] h-9 text-xs">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="notes">Notes</SelectItem>
                <SelectItem value="book">Book</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(v: any) =>
                setFilters((f) => ({ ...f, status: v }))
              }
            >
              <SelectTrigger size="sm" className="w-[110px] h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Button
              className="gap-2"
              onClick={() => {
                setEditingResource(null);
                setIsAddOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Add Resource
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        emptyState={
          <EmptyState
            icon={BookOpen}
            title="No resources yet"
            description="Upload your first PDF, notes, or book to start selling to students."
            action={{
              label: "Add Resource",
              onClick: () => {
                setEditingResource(null);
                setIsAddOpen(true);
              },
              icon: Plus,
            }}
          />
        }
      />

      {/* Add / Edit Dialog */}
      <AddResourceDialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) setEditingResource(null);
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        editingResource={editingResource}
        uploadProgress={uploadProgress}
      />

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Delete Resource
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="py-2">
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
