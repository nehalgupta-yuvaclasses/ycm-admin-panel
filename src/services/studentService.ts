import { supabase } from "@/lib/supabaseClient";

export interface Student {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  city?: string | null;
  state?: string | null;
  status: "active" | "inactive" | "pending";
  batch?: string;
  created_at: string;
}

export const studentService = {
  async getStudents() {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("getStudents error:", error);
        throw error;
      }
      return data || [];
    } catch (err) {
      console.error("getStudents exception:", err);
      return [];
    }
  },

  async createStudent(student: Omit<Student, "id" | "created_at">) {
    try {
      const { data, error } = await supabase
        .from("students")
        .insert([student])
        .select()
        .single();

      if (error) {
        console.error("createStudent error:", error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error("createStudent exception:", err);
      throw err;
    }
  },

  async updateStudent(id: string, updates: Partial<Student>) {
    try {
      const { data, error } = await supabase
        .from("students")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("updateStudent error:", error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error("updateStudent exception:", err);
      throw err;
    }
  },

  async deleteStudent(id: string) {
    try {
      const { error } = await supabase.from("students").delete().eq("id", id);

      if (error) {
        console.error("deleteStudent error:", error);
        throw error;
      }
    } catch (err) {
      console.error("deleteStudent exception:", err);
      throw err;
    }
  },

  async getEnrollments(studentId: string) {
    try {
      const { data, error } = await supabase
        .from("enrollments")
        .select("*, courses(*)")
        .eq("student_id", studentId);

      if (error) {
        console.error("getEnrollments error:", error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error("getEnrollments exception:", err);
      return [];
    }
  },

  async enrollStudent(studentId: string, courseId: string) {
    try {
      const { data, error } = await supabase
        .from("enrollments")
        .insert([{ student_id: studentId, course_id: courseId }])
        .select()
        .single();

      if (error) {
        console.error("enrollStudent error:", error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error("enrollStudent exception:", err);
      throw err;
    }
  },
};
