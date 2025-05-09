
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Initialize the Supabase client with environment variables
// For Vite, we should use import.meta.env instead of process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single instance of the Supabase client to use throughout the app
// Add fallback values to prevent runtime errors when environment variables are missing
export const supabase = createClient<Database>(
  supabaseUrl || 'https://your-project-url.supabase.co',
  supabaseAnonKey || 'your-anon-key'
);

// Export Database type for TypeScript compatibility
export type { Database };
