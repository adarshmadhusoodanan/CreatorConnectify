import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tlboemuqmuqdzijezuzr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsYm9lbXVxbXVxZHppamV6dXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0MDU2NzksImV4cCI6MjA1MDk4MTY3OX0.qB6MbmNCA86wZsn_HkdQJTErb-I0H8HbwtxswbJXKBY";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
    },
  },
  db: {
    schema: 'public',
  },
});

// Add request logging
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', { event, session });
});

// Add error handling through event listeners
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed successfully');
  }
  if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
  if (event === 'USER_DELETED') {
    console.error('User was deleted');
  }
  if (event === 'USER_UPDATED') {
    console.log('User was updated');
  }
});