import { z } from "zod";

export type StudentStatus = 'active' | 'inactive' | 'pending';

export interface Student {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  batch: string | null;
  status: StudentStatus;
  created_at: string;
}

export const studentSchema = z.object({
  full_name: z.string().trim().min(3, "Full name must be at least 3 characters"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().regex(/^[6-9][0-9]{9}$/, "Enter a valid Indian mobile number"),
  city: z.string().trim().min(1, "City is required").regex(/^[A-Za-z\s]+$/, "City can contain letters only"),
  state: z.string().trim().min(1, "State is required").regex(/^[A-Za-z\s]+$/, "State can contain letters only"),
  batch: z.string().trim().min(1, "Batch is required"),
  status: z.enum(["active", "inactive", "pending"], { 
    message: "Status is required" 
  }),
});

export type StudentFormValues = z.infer<typeof studentSchema>;

export interface StudentCourse {
  id: string;
  student_id: string;
  course_name: string;
}

export interface StudentWithCourses extends Student {
  courses: StudentCourse[];
}

export interface Course {
  id: string;
  title: string;
}

export interface Batch {
  id: string;
  name: string;
}
