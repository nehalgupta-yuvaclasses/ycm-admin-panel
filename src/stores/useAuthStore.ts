import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { withTimeout } from '@/lib/async-utils';

interface AuthProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  permissions?: string[];
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: AuthProfile | null;
  loading: boolean;
  initialized: boolean;
  authError: string | null;
  
  setAuth: (session: Session | null, profile: AuthProfile | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
}

function describeAuthError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;

  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown auth error';
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  authError: null,

  setAuth: (session, profile) => {
    set({ 
      session, 
      user: session?.user ?? null, 
      profile, 
      loading: false,
      initialized: true,
      authError: null,
    });
  },

  setLoading: (loading) => set({ loading }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null, loading: false, authError: null });
  },

  fetchProfile: async (userId: string) => {
    try {
      if (!get().profile) {
        set({ loading: true, authError: null });
      }
      
      // Strategy 1: Use RPC with SECURITY DEFINER to bypass RLS entirely
      const { data, error } = await withTimeout(
        supabase.rpc('get_my_profile'),
        'Profile lookup',
        6000,
      );
      
      if (!error && data) {
        const profileData = data as any;
        
        // STRICT ROLE ENFORCEMENT: Only 'admin' is allowed in this project
        if (profileData?.role !== 'admin') {
          console.error('Non-admin user rejected by ERP core.');
          await get().signOut();
          return;
        }

        const permissions = ['view_dashboard', 'manage_students', 'manage_instructors', 'manage_courses', 'manage_tests', 'manage_payments', 'manage_resources', 'manage_blogs', 'manage_frontend', 'manage_notifications', 'manage_messages', 'manage_settings'];

        set({ 
          profile: { ...profileData, role: 'admin', permissions },
          loading: false,
          authError: null,
        });
        return;
      }

      // Strategy 2: Fallback — build profile from JWT session metadata
      console.warn('RPC get_my_profile unavailable, falling back to JWT metadata.');
      const { data: { session: currentSession } } = await withTimeout(
        supabase.auth.getSession(),
        'Session lookup',
        5000,
      );
      const user = currentSession?.user;
      
      if (user) {
        const role = user.user_metadata?.role;

        // STRICT ROLE ENFORCEMENT: Only 'admin' is allowed
        if (role !== 'admin') {
          console.error('Non-admin role detected in JWT metadata. Ejecting...');
          await get().signOut();
          return;
        }

        const permissions = ['view_dashboard', 'manage_students', 'manage_instructors', 'manage_courses', 'manage_tests', 'manage_payments', 'manage_resources', 'manage_blogs', 'manage_frontend', 'manage_notifications', 'manage_messages', 'manage_settings'];

        set({
          profile: {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name || user.email || '',
            role: 'admin',
            permissions,
          },
          loading: false,
          authError: null,
        });
        return;
      }

      set({ profile: null, loading: false, authError: 'Unable to resolve admin profile.' });
    } catch (err: any) {
      console.error('Unexpected Auth Error during ERP Lockdown:', describeAuthError(err));
      set({
        profile: get().profile,
        loading: false,
        authError: err?.message || 'Auth refresh failed',
      });
    }
  },

  initialize: async () => {
    if (get().initialized) return;

    if (typeof window === 'undefined') {
      set({ initialized: true, loading: false });
      return;
    }

    try {
      const { data: { session } } = await withTimeout(
        supabase.auth.getSession(),
        'Initial session restore',
        5000,
      );
      set({ session, user: session?.user ?? null, initialized: true });
      
      if (session?.user) {
        void get().fetchProfile(session.user.id);
      } else {
        set({ loading: false, authError: null });
      }
    } catch (error) {
      console.error('Auth initialization failed:', describeAuthError(error));
      set({ loading: false, initialized: true, authError: error instanceof Error ? error.message : 'Auth initialization failed' });
    }

    if (!(globalThis as any).__yuvaAuthListenerRegistered) {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('[auth] state change', event, !!session);
        set({ session, user: session?.user ?? null });

        if (!session?.user) {
          set({ session: null, user: null, profile: null, loading: false, authError: null });
          return;
        }

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          void get().fetchProfile(session.user.id);
        }
      });

      (globalThis as any).__yuvaAuthListenerRegistered = true;
      (globalThis as any).__yuvaAuthSubscription = data.subscription;
    }
  }
}));
