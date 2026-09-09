import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Check env.');
}

export const supabase = createClient(url, anonKey);

// Single-user MVP (auth arrives in v2). Every insert/query uses this email.
export const OWNER_EMAIL = (import.meta.env.VITE_OWNER_EMAIL as string) || 'felipetorreira2@gmail.com';
