
// Mock client that replaces Supabase functionality
// This can be used as a placeholder when Supabase is disconnected

// Create a simple mock client object with common Supabase methods
export const supabase = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signUp: async () => ({ data: null, error: null }),
    signIn: async () => ({ data: null, error: null }),
    signInWithPassword: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        limit: () => ({ data: [], error: null }),
        range: () => ({ data: [], error: null }),
        order: () => ({ data: [], error: null }),
        execute: async () => ({ data: [], error: null }),
      }),
      neq: () => ({
        execute: async () => ({ data: [], error: null }),
      }),
      execute: async () => ({ data: [], error: null }),
    }),
    insert: () => ({
      select: () => ({ execute: async () => ({ data: [], error: null }) }),
      execute: async () => ({ data: null, error: null }),
    }),
    update: () => ({
      eq: () => ({ execute: async () => ({ data: null, error: null }) }),
      match: () => ({ execute: async () => ({ data: null, error: null }) }),
    }),
    delete: () => ({
      eq: () => ({ execute: async () => ({ data: null, error: null }) }),
      match: () => ({ execute: async () => ({ data: null, error: null }) }),
    }),
  }),
  storage: {
    from: (bucket: string) => ({
      upload: async () => ({ data: { path: 'mock-path' }, error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: `https://example.com/${path}` } }),
      remove: async () => ({ error: null }),
    }),
  },
  rpc: (fn: string, params: any) => ({
    single: async () => ({ data: null, error: null }),
    execute: async () => ({ data: null, error: null }),
  }),
};

// Export a fake Database type for TypeScript compatibility
export type Database = any;
