
import { createClient } from '@supabase/supabase-js';

// Access environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase Debug - URL:", supabaseUrl);
console.log("Supabase Debug - Key exists:", !!supabaseAnonKey);
console.log("Supabase Debug - Key length:", supabaseAnonKey?.length);

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase URL or Anon Key');
    alert("Configuration Error: Missing API Keys. Check console.");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

