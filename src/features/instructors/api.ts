import { supabase } from '@/lib/supabaseClient';
import type { InstructorFormValues, InstructorOption, InstructorRecord } from './types';

type InstructorRow = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  profile_image?: string | null;
  expertise?: string[] | null;
  experience_years?: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type UserRow = {
  id: string;
  role?: string | null;
};

function normalizeExpertise(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function toInstructorRecord(row: InstructorRow): InstructorRecord {
  return {
    id: row.id,
    fullName: row.full_name || '',
    email: row.email || '',
    phone: row.phone || '',
    bio: row.bio || '',
    profileImage: row.profile_image || '',
    expertise: normalizeExpertise(row.expertise),
    experienceYears: Number(row.experience_years || 0),
    isActive: Boolean(row.is_active ?? true),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
  };
}

async function filterAdminLinkedInstructors<T extends { id: string }>(rows: T[]): Promise<T[]> {
  if (!rows.length) return rows;

  const { data, error } = await supabase
    .from('users')
    .select('id, role')
    .in('id', rows.map((row) => row.id));

  if (error) {
    return rows;
  }

  const adminIds = new Set((data || []).filter((user: UserRow) => user.role === 'admin').map((user: UserRow) => user.id));
  return rows.filter((row) => !adminIds.has(row.id));
}

export async function getInstructors(): Promise<InstructorRecord[]> {
  const { data, error } = await supabase
    .from('instructors')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const filteredRows = await filterAdminLinkedInstructors((data || []) as InstructorRow[]);
  return filteredRows.map((row: InstructorRow) => toInstructorRecord(row));
}

export async function getInstructorOptions(): Promise<InstructorOption[]> {
  const { data, error } = await supabase
    .from('instructors')
    .select('id, full_name, email, profile_image, is_active')
    .order('full_name', { ascending: true });

  if (error) {
    throw error;
  }

  const filteredRows = await filterAdminLinkedInstructors((data || []) as InstructorRow[]);

  return filteredRows.map((row: InstructorRow) => ({
    id: row.id,
    fullName: row.full_name || '',
    email: row.email || '',
    profileImage: row.profile_image || '',
    isActive: Boolean(row.is_active ?? true),
  }));
}

export async function createInstructor(values: InstructorFormValues) {
  const { data, error } = await supabase
    .from('instructors')
    .insert([
      {
        full_name: values.full_name,
        email: values.email,
        phone: values.phone || null,
        bio: values.bio || null,
        profile_image: values.profile_image || null,
        expertise: values.expertise,
        experience_years: values.experience_years,
        is_active: values.is_active,
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return toInstructorRecord(data as InstructorRow);
}

export async function updateInstructor(id: string, values: InstructorFormValues) {
  const { data, error } = await supabase
    .from('instructors')
    .update({
      full_name: values.full_name,
      email: values.email,
      phone: values.phone || null,
      bio: values.bio || null,
      profile_image: values.profile_image || null,
      expertise: values.expertise,
      experience_years: values.experience_years,
      is_active: values.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return toInstructorRecord(data as InstructorRow);
}

export async function deleteInstructor(id: string) {
  const { error } = await supabase.from('instructors').delete().eq('id', id);

  if (error) {
    throw error;
  }
}
