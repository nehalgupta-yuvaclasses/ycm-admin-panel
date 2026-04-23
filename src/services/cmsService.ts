import { supabase } from "@/lib/supabase";

export interface Banner {
  id?: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  image_url: string;
  is_active: boolean;
  sort_order?: number;
}

export interface HomepageContent {
  id?: string;
  hero_title: string;
  hero_subtitle: string;
  primary_cta_text: string;
  primary_cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
  featured_courses: string[];
  highlights: string[];
  updated_at?: string;
}

export interface AboutContent {
  id?: string;
  hero_heading: string;
  story_content: string;
  founder_name: string;
  founder_role: string;
  founder_bio: string;
  mission: string;
  vision: string;
  timeline: Array<{
    year: string;
    title: string;
    description: string;
  }>;
  updated_at?: string;
}

export interface FAQ {
  id?: string;
  question: string;
  answer: string;
}

export interface Result {
  id?: string;
  student_name: string;
  exam: string;
  rank: string;
  result: string;
  year?: string;
  image_url?: string;
}

const defaultHomepageContent: HomepageContent = {
  hero_title: "",
  hero_subtitle: "",
  primary_cta_text: "",
  primary_cta_link: "",
  secondary_cta_text: "",
  secondary_cta_link: "",
  featured_courses: [],
  highlights: [],
};

const defaultAboutContent: AboutContent = {
  hero_heading: "",
  story_content: "",
  founder_name: "",
  founder_role: "",
  founder_bio: "",
  mission: "",
  vision: "",
  timeline: [],
};

export const cmsService = {
  async getBanners() {
    try {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) {
        console.error("getBanners error:", error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error("getBanners exception:", err);
      return [];
    }
  },

  async createBanner(banner: Banner) {
    try {
      const { data: latestBanner } = await supabase
        .from("banners")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data, error } = await supabase
        .from("banners")
        .insert([
          {
            ...banner,
            sort_order: banner.sort_order ?? ((latestBanner?.sort_order ?? -1) + 1),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("createBanner error:", error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error("createBanner exception:", err);
      throw err;
    }
  },

  async updateBanner(id: string, updates: Partial<Banner>) {
    try {
      const { data, error } = await supabase
        .from("banners")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("updateBanner error:", error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error("updateBanner exception:", err);
      throw err;
    }
  },

  async deleteBanner(id: string) {
    try {
      const { error } = await supabase.from("banners").delete().eq("id", id);

      if (error) {
        console.error("deleteBanner error:", error);
        throw error;
      }
    } catch (err) {
      console.error("deleteBanner exception:", err);
      throw err;
    }
  },

  async reorderBanners(order: Array<{ id: string; sort_order: number }>) {
    try {
      const updates = order.map((item) =>
        supabase.from("banners").update({ sort_order: item.sort_order }).eq("id", item.id)
      );
      const results = await Promise.all(updates);
      const error = results.find((item) => item.error)?.error;

      if (error) {
        console.error("reorderBanners error:", error);
        throw error;
      }
    } catch (err) {
      console.error("reorderBanners exception:", err);
      throw err;
    }
  },

  async getHomepageContent(): Promise<HomepageContent> {
    try {
      const { data, error } = await supabase
        .from("homepage_content")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return { ...defaultHomepageContent };
      }

      return {
        ...defaultHomepageContent,
        ...data,
        featured_courses: data.featured_courses || [],
        highlights: data.highlights || [],
      };
    } catch (err) {
      console.error("getHomepageContent exception:", err);
      return { ...defaultHomepageContent };
    }
  },

  async saveHomepageContent(content: HomepageContent): Promise<HomepageContent> {
    try {
      const payload = {
        hero_title: content.hero_title,
        hero_subtitle: content.hero_subtitle,
        primary_cta_text: content.primary_cta_text,
        primary_cta_link: content.primary_cta_link,
        secondary_cta_text: content.secondary_cta_text,
        secondary_cta_link: content.secondary_cta_link,
        featured_courses: content.featured_courses,
        highlights: content.highlights,
      };

      const query = content.id
        ? supabase.from("homepage_content").update(payload).eq("id", content.id)
        : supabase.from("homepage_content").insert([payload]);

      const { data, error } = await query.select().single();

      if (error) {
        console.error("saveHomepageContent error:", error);
        throw error;
      }

      return {
        ...defaultHomepageContent,
        ...data,
        featured_courses: data.featured_courses || [],
        highlights: data.highlights || [],
      };
    } catch (err) {
      console.error("saveHomepageContent exception:", err);
      throw err;
    }
  },

  async getAboutContent(): Promise<AboutContent> {
    try {
      const { data, error } = await supabase
        .from("about_content")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return { ...defaultAboutContent };
      }

      return {
        ...defaultAboutContent,
        ...data,
        timeline: data.timeline || [],
      };
    } catch (err) {
      console.error("getAboutContent exception:", err);
      return { ...defaultAboutContent };
    }
  },

  async saveAboutContent(content: AboutContent): Promise<AboutContent> {
    try {
      const payload = {
        hero_heading: content.hero_heading,
        story_content: content.story_content,
        founder_name: content.founder_name,
        founder_role: content.founder_role,
        founder_bio: content.founder_bio,
        mission: content.mission,
        vision: content.vision,
        timeline: content.timeline,
      };

      const query = content.id
        ? supabase.from("about_content").update(payload).eq("id", content.id)
        : supabase.from("about_content").insert([payload]);

      const { data, error } = await query.select().single();

      if (error) {
        console.error("saveAboutContent error:", error);
        throw error;
      }

      return {
        ...defaultAboutContent,
        ...data,
        timeline: data.timeline || [],
      };
    } catch (err) {
      console.error("saveAboutContent exception:", err);
      throw err;
    }
  },

  async getFAQs() {
    try {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("getFAQs error:", error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error("getFAQs exception:", err);
      return [];
    }
  },

  async createFAQ(faq: FAQ) {
    try {
      const { data, error } = await supabase
        .from("faqs")
        .insert([faq])
        .select()
        .single();

      if (error) {
        console.error("createFAQ error:", error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error("createFAQ exception:", err);
      throw err;
    }
  },

  async updateFAQ(id: string, updates: Partial<FAQ>) {
    try {
      const { data, error } = await supabase
        .from("faqs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("updateFAQ error:", error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error("updateFAQ exception:", err);
      throw err;
    }
  },

  async deleteFAQ(id: string) {
    try {
      const { error } = await supabase.from("faqs").delete().eq("id", id);

      if (error) {
        console.error("deleteFAQ error:", error);
        throw error;
      }
    } catch (err) {
      console.error("deleteFAQ exception:", err);
      throw err;
    }
  },

  async getResults() {
    try {
      const { data, error } = await supabase
        .from("results")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("getResults error:", error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error("getResults exception:", err);
      return [];
    }
  },

  async createResult(result: Result) {
    try {
      const { data, error } = await supabase
        .from("results")
        .insert([
          {
            ...result,
            rank: result.rank || result.result,
            result: result.result || result.rank,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("createResult error:", error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error("createResult exception:", err);
      throw err;
    }
  },

  async updateResult(id: string, updates: Partial<Result>) {
    try {
      const { data, error } = await supabase
        .from("results")
        .update({
          ...updates,
          rank: updates.rank || updates.result,
          result: updates.result || updates.rank,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("updateResult error:", error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error("updateResult exception:", err);
      throw err;
    }
  },

  async deleteResult(id: string) {
    try {
      const { error } = await supabase.from("results").delete().eq("id", id);

      if (error) {
        console.error("deleteResult error:", error);
        throw error;
      }
    } catch (err) {
      console.error("deleteResult exception:", err);
      throw err;
    }
  },
};
