import { z } from 'zod';

export type InstructorStatusFilter = 'all' | 'active' | 'inactive';

export interface InstructorRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  profileImage: string;
  expertise: string[];
  experienceYears: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InstructorOption {
  id: string;
  fullName: string;
  email: string;
  profileImage: string;
  isActive: boolean;
}

export interface InstructorFilters {
  search: string;
  status: InstructorStatusFilter;
  sort: 'newest';
}

export const instructorFormSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name is required'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z.string().trim().optional().default(''),
  bio: z.string().trim().optional().default(''),
  profile_image: z.string().trim().optional().default(''),
  expertise: z.array(z.string().trim().min(1)).default([]),
  experience_years: z.coerce.number().int('Experience must be a whole number').min(0, 'Experience must be zero or more'),
  is_active: z.boolean().default(true),
});

export type InstructorFormValues = z.infer<typeof instructorFormSchema>;
