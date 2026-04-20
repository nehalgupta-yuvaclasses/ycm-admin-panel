export type BlogStatus = 'draft' | 'published';

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: Record<string, any>;
  excerpt: string | null;
  cover_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  category: string | null;
  keywords: string[];
  status: BlogStatus;
  author_id: string | null;
  author_name: string | null;
  author_role: string | null;
  author_avatar_url: string | null;
  author_bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogFormData {
  title: string;
  slug: string;
  content: Record<string, any>;
  excerpt: string;
  cover_image: string;
  meta_title: string;
  meta_description: string;
  category: string;
  keywords: string[];
  author_id: string;
  author_name: string;
  author_role: string;
  author_avatar_url: string;
  author_bio: string;
  status: BlogStatus;
}

export interface BlogAuthorOption {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string;
  bio: string;
}

export const EMPTY_BLOG_FORM: BlogFormData = {
  title: '',
  slug: '',
  content: {},
  excerpt: '',
  cover_image: '',
  meta_title: '',
  meta_description: '',
  category: '',
  keywords: [],
  author_id: '',
  author_name: '',
  author_role: '',
  author_avatar_url: '',
  author_bio: '',
  status: 'draft',
};
