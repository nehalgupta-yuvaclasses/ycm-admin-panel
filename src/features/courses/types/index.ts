import { z } from "zod";

export interface Course {
  id: string;
  title: string;
  tagline?: string;
  description: string;
  author: string;
  buying_price: number;
  selling_price: number;
  status: "active" | "draft" | "archived";
  thumbnail_url?: string;
  students_count?: number;
  created_at?: string;
}

export const courseSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  tagline: z.string().trim().min(5, "Tagline must be at least 5 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  author: z.string().trim().min(2, "Author name must be at least 2 characters"),
  thumbnail_url: z.string().optional(),
  buying_price: z.number().min(0, "Buying price cannot be negative"),
  selling_price: z.number().min(0, "Selling price cannot be negative"),
  status: z.enum(["active", "draft", "archived"]),
});

export type CourseFormValues = z.infer<typeof courseSchema>;
