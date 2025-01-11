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
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Add a debug interceptor to log requests
supabase.rest.interceptors.response.use(
  (response) => {
    console.log('Supabase API Response:', {
      url: response.url,
      status: response.status,
      statusText: response.statusText
    });
    return response;
  },
  (error) => {
    console.error('Supabase API Error:', {
      url: error.request?.url,
      message: error.message,
      status: error.status
    });
    return Promise.reject(error);
  }
);