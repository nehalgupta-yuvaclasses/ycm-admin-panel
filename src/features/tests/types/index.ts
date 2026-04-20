import { z } from "zod";

export const testSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  course_id: z.string().trim().min(1, "Course is required"),
  subject_id: z.string().trim().min(1, "Subject is required"),
  duration: z.number().min(5, "Duration must be at least 5 minutes"),
  total_marks: z.number().min(1, "Total marks is required"),
  status: z.enum(["draft", "published"]),
});

export type TestFormValues = z.infer<typeof testSchema>;
