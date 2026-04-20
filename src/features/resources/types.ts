import { z } from "zod";

// ── Database row type ────────────────────────────────────────────────
export interface Resource {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "notes" | "book";
  file_url: string;
  thumbnail_url: string | null;
  base_price: number;
  selling_price: number;
  is_paid: boolean;
  status: "active" | "draft";
  created_at: string;
}

// ── Zod schema for form validation ───────────────────────────────────
export const resourceSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters"),
    description: z.string().trim().min(10, "Description must be at least 10 characters"),
    type: z.enum(["pdf", "notes", "book"]),
    status: z.enum(["active", "draft"]),
    base_price: z.number().min(0, "Base price cannot be negative"),
    selling_price: z.number().min(0, "Selling price cannot be negative"),
    thumbnail_url: z.string().optional(),
  })
  .refine((d) => d.selling_price <= d.base_price, {
    message: "Selling price cannot exceed base price",
    path: ["selling_price"],
  });

export type ResourceFormValues = z.infer<typeof resourceSchema>;

// ── Filter state ─────────────────────────────────────────────────────
export interface ResourceFilters {
  search: string;
  type: "all" | Resource["type"];
  status: "all" | Resource["status"];
}
