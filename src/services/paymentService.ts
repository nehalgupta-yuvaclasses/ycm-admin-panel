import { supabase } from "@/lib/supabaseClient";

export interface Payment {
  id?: string;
  student_id?: string | null;
  user_id?: string | null;
  course_id: string;
  amount: number;
  status: string;
  method: string;
  created_at?: string;
}

export const paymentService = {
  async getPayments() {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("getPayments error:", error);
        throw error;
      }
      return data || [];
    } catch (err) {
      console.error("getPayments exception:", err);
      return [];
    }
  },

  async createPayment(payment: Omit<Payment, "id" | "created_at">) {
    try {
      const { data, error } = await supabase
        .from("payments")
        .insert([payment])
        .select()
        .single();

      if (error) {
        console.error("createPayment error:", error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error("createPayment exception:", err);
      throw err;
    }
  },

  async updatePaymentStatus(id: string, status: string) {
    try {
      const { data, error } = await supabase
        .from("payments")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("updatePaymentStatus error:", error);
        throw error;
      }

      if (status === "Completed" && data) {
        const userId = data.user_id ?? data.student_id ?? null;
        const { student_id, course_id } = data;

        if (!userId && !student_id) {
          return data;
        }

        const enrollmentFilters = [] as string[];
        if (userId) {
          enrollmentFilters.push(`user_id.eq.${userId}`);
        }
        if (student_id) {
          enrollmentFilters.push(`student_id.eq.${student_id}`);
        }

        const { data: enrollment } = await supabase
          .from("enrollments")
          .select("*")
          .or(enrollmentFilters.join(","))
          .eq("course_id", course_id)
          .maybeSingle();

        if (!enrollment) {
          await supabase
            .from("enrollments")
            .insert([
              {
                student_id,
                user_id: userId,
                course_id,
                payment_status: "paid",
                status: "active",
              },
            ]);
        }
      }

      return data;
    } catch (err) {
      console.error("updatePaymentStatus exception:", err);
      throw err;
    }
  },

  async deletePayment(id: string) {
    try {
      const { error } = await supabase.from("payments").delete().eq("id", id);

      if (error) {
        console.error("deletePayment error:", error);
        throw error;
      }
    } catch (err) {
      console.error("deletePayment exception:", err);
      throw err;
    }
  },
};
