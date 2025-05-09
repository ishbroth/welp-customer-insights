
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Initialize the Supabase client with environment variables
// For Lovable, we'll use process.env as a fallback, but prioritize import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single instance of the Supabase client to use throughout the app
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Export Database type for TypeScript compatibility
export type { Database };
