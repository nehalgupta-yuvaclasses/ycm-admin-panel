import { supabase } from "@/lib/supabaseClient";
import { formatCurrency } from "./apiUtils";

const safeFetch = async (fallback: any = [], showError = false) => {
  return {
    students: async () => {
      try {
        const { data, error } = await supabase
          .from("students")
          .select("id, full_name, created_at");
        if (error) throw error;
        return data || [];
      } catch (err: any) {
        if (showError) console.error("Students fetch error:", err);
        return [];
      }
    },
    courses: async () => {
      try {
        const { data, error } = await supabase
          .from("courses")
          .select("id, status");
        if (error) throw error;
        return data || [];
      } catch (err: any) {
        if (showError) console.error("Courses fetch error:", err);
        return [];
      }
    },
    payments: async () => {
      try {
        const { data, error } = await supabase
          .from("payments")
          .select("id, amount, status, created_at, student_id");
        if (error) throw error;
        return data || [];
      } catch (err: any) {
        if (showError) console.error("Payments fetch error:", err);
        return [];
      }
    },
  };
};

export const dashboardService = {
  async getEnrollmentTrend() {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("created_at");

      if (error) {
        console.warn("Enrollment trend error:", error.message);
        return [0, 0, 0, 0, 0];
      }

      const days: Record<string, number> = {};
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days[d.toISOString().split("T")[0]] = 0;
      }

      (data || []).forEach((s: any) => {
        const date = s.created_at?.split("T")[0];
        if (date && days[date] !== undefined) {
          days[date]++;
        }
      });

      return Object.entries(days)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, count]) => count);
    } catch (err) {
      console.warn("getEnrollmentTrend exception:", err);
      return [0, 0, 0, 0, 0];
    }
  },

  async getRecentActivity() {
    try {
      const [studentsRes, paymentsRes] = await Promise.all([
        supabase
          .from("students")
          .select("id, full_name, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("payments")
          .select("id, amount, status, created_at, student_id")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const students = studentsRes.data || [];
      const payments = paymentsRes.data || [];

      const activity = [
        ...students.map((s: any) => ({
          id: `student-${s.id}`,
          user: s.full_name || "Unknown",
          action: "joined",
          target: "the platform",
          time: s.created_at,
          type: "enrollment",
        })),
        ...payments.map((p: any) => ({
          id: `payment-${p.id}`,
          user: p.student_id || "Unknown",
          action: p.status === "success" ? "paid" : "attempted payment of",
          target: formatCurrency(Number(p.amount) || 0),
          time: p.created_at,
          type: "payment",
        })),
      ];

      return activity
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 5);
    } catch (err) {
      console.warn("getRecentActivity exception:", err);
      return [];
    }
  },

  async getStats() {
    try {
      const [studentsRes, coursesRes, paymentsRes] = await Promise.all([
        supabase.from("students").select("id"),
        supabase.from("courses").select("id, status"),
        supabase.from("payments").select("id, amount, status"),
      ]);

      const students = studentsRes.data || [];
      const courses = coursesRes.data || [];
      const payments = paymentsRes.data || [];

      const successfulPayments = payments.filter(
        (p: any) => p.status === "success",
      );
      const totalRevenue = successfulPayments.reduce(
        (acc: number, p: any) => acc + (Number(p.amount) || 0),
        0,
      );
      const publishedCourses = courses.filter(
        (c: any) => c.status === "Published",
      );

      return {
        totalStudents: students.length,
        publishedCourses: publishedCourses.length,
        totalRevenue,
        successfulPayments: successfulPayments.length,
      };
    } catch (err) {
      console.warn("getStats exception:", err);
      return {
        totalStudents: 0,
        publishedCourses: 0,
        totalRevenue: 0,
        successfulPayments: 0,
      };
    }
  },
};
