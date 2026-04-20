import { supabase } from "@/lib/supabase";

export interface Notification {
  id?: string;
  title: string;
  message: string;
  target_type: string;
  created_at?: string;
}

export const notificationService = {
  async getNotifications() {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("getNotifications error:", error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error("getNotifications exception:", err);
      return [];
    }
  },

  async sendNotification(notification: Notification) {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .insert([notification])
        .select()
        .single();

      if (error) {
        console.error("sendNotification error:", error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error("sendNotification exception:", err);
      throw err;
    }
  },

  async deleteNotification(id: string) {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("deleteNotification error:", error);
        throw error;
      }
    } catch (err) {
      console.error("deleteNotification exception:", err);
      throw err;
    }
  },
};
