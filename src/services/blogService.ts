import { supabase } from "@/lib/supabase";
import type { Blog, BlogAuthorOption, BlogFormData } from "@/features/blogs/types";

export const blogService = {
  async getBlogs(): Promise<Blog[]> {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("getBlogs error:", error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error("getBlogs exception:", err);
      return [];
    }
  },

  async getBlog(id: string): Promise<Blog | null> {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("getBlog error:", error);
        return null;
      }
      return data;
    } catch (err) {
      console.error("getBlog exception:", err);
      return null;
    }
  },

  async getBlogBySlug(slug: string): Promise<Blog | null> {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) return null;
      return data;
    } catch {
      return null;
    }
  },

  async getAuthorOptions(): Promise<BlogAuthorOption[]> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, role, avatar_url, bio")
        .order("name", { ascending: true });

      if (error) {
        console.error("getAuthorOptions error:", error);
        return [];
      }

      return (data || []).map((author: any) => ({
        id: author.id,
        name: author.name || author.email || "Untitled author",
        email: author.email || "",
        role: author.role || "Writer",
        avatar_url: author.avatar_url || "",
        bio: author.bio || "",
      }));
    } catch (err) {
      console.error("getAuthorOptions exception:", err);
      return [];
    }
  },

  async createBlog(blog: BlogFormData & { author_id?: string }): Promise<Blog> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("blogs")
        .insert([{ ...blog, author_id: user?.id || null }])
        .select()
        .single();

      if (error) {
        console.error("createBlog error:", error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error("createBlog exception:", err);
      throw err;
    }
  },

  async updateBlog(id: string, updates: Partial<BlogFormData>): Promise<Blog> {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("updateBlog error:", error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error("updateBlog exception:", err);
      throw err;
    }
  },

  async deleteBlog(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("blogs").delete().eq("id", id);

      if (error) {
        console.error("deleteBlog error:", error);
        throw error;
      }
    } catch (err) {
      console.error("deleteBlog exception:", err);
      throw err;
    }
  },

  async uploadBlogImage(file: File): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `blog-images/${fileName}`;

    const { data, error } = await supabase.storage
      .from("blog-images")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("uploadBlogImage error:", error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("blog-images")
      .getPublicUrl(data.path);

    return publicUrl;
  },
};
