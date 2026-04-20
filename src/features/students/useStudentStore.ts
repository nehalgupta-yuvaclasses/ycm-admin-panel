import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import { studentApi } from './api';
import { Student } from './types';
import { toast } from 'sonner';

let studentsChannel: ReturnType<typeof supabase.channel> | null = null;

interface StudentState {
  students: Student[];
  total: number;
  isLoading: boolean;
  error: string | null;
  pageSize: number;
  currentPage: number;

  // Actions
  fetchStudents: (page?: number) => Promise<void>;
  addStudent: (student: Omit<Student, 'id' | 'created_at'>) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  setPage: (page: number) => void;
  
  // Real-time
  subscribeToStudents: () => () => void;
}

export const useStudentStore = create<StudentState>((set, get) => ({
  students: [],
  total: 0,
  isLoading: false,
  error: null,
  pageSize: 10,
  currentPage: 0,

  setPage: (page: number) => {
    set({ currentPage: page });
    get().fetchStudents(page);
  },

  fetchStudents: async (page = get().currentPage) => {
    set({ isLoading: true, error: null });
    try {
      const { students, total } = await Promise.race([
        studentApi.getStudents(page, get().pageSize),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Student fetch timed out')), 10000);
        }),
      ]);
      set({ students, total, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      toast.error('Failed to fetch students');
    }
  },

  addStudent: async (student) => {
    try {
      await studentApi.createStudent(student);
      toast.success('Student added successfully');
      // No need to fetch, real-time will handle it or we can optimistically add if we want
    } catch (error: any) {
      toast.error(`Error adding student: ${error.message}`);
      throw error;
    }
  },

  updateStudent: async (id, updates) => {
    try {
      await studentApi.updateStudent(id, updates);
      toast.success('Student updated successfully');
    } catch (error: any) {
      toast.error(`Error updating student: ${error.message}`);
      throw error;
    }
  },

  deleteStudent: async (id) => {
    try {
      await studentApi.deleteStudent(id);
      toast.success('Student deleted successfully');
    } catch (error: any) {
      toast.error(`Error deleting student: ${error.message}`);
      throw error;
    }
  },

  subscribeToStudents: () => {
    if (studentsChannel) {
      supabase.removeChannel(studentsChannel);
      studentsChannel = null;
    }

    studentsChannel = supabase
      .channel('students-realtime')
      .on(
        'postgres_changes',
        { event: '*', table: 'students', schema: 'public' },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;
          
          if (eventType === 'INSERT') {
            set((state) => ({
              students: [newRecord as Student, ...state.students].slice(0, state.pageSize),
              total: state.total + 1
            }));
          } else if (eventType === 'UPDATE') {
            set((state) => ({
              students: state.students.map((s) => 
                s.id === (newRecord as Student).id ? (newRecord as Student) : s
              )
            }));
          } else if (eventType === 'DELETE') {
            set((state) => ({
              students: state.students.filter((s) => s.id !== (oldRecord as Student).id),
              total: Math.max(0, state.total - 1)
            }));
            // If page is now empty and not on first page, go back
            if (get().students.length === 0 && get().currentPage > 0) {
              get().setPage(get().currentPage - 1);
            }
          }
        }
      )
      .subscribe();

    return () => {
      if (studentsChannel) {
        supabase.removeChannel(studentsChannel);
        studentsChannel = null;
      }
    };
  }
}));
