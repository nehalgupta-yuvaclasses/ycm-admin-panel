import { supabase } from '@/lib/supabaseClient';
import { Student, StudentStatus } from './types';

export const studentApi = {
  async getStudents(page = 0, pageSize = 10) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('students')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { students: data as Student[], total: count || 0 };
  },

  async createStudent(student: Omit<Student, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('students')
      .insert([student])
      .select()
      .single();

    if (error) throw error;
    return data as Student;
  },

  async updateStudent(id: string, updates: Partial<Omit<Student, 'id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Student;
  },

  async deleteStudent(id: string) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateStudentStatus(id: string, status: StudentStatus) {
    const { data, error } = await supabase
      .from('students')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Student;
  }
};
