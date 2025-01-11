import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tlboemuqmuqdzijezuzr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsYm9lbXVxbXVxZHppamV6dXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0MDU2NzksImV4cCI6MjA1MDk4MTY3OX0.qB6MbmNCA86wZsn_HkdQJTErb-I0H8HbwtxswbJXKBY";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },
  db: {
    schema: 'public'
  }
});