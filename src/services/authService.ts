import { supabase } from '@/lib/supabase';

export const authService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);
    if (error) throw error;
    return data;
  },

  async isAdmin(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    if (error) return false;
    return data?.role === 'admin';
  }
};
