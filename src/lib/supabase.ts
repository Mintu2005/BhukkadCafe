import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function makeMissingEnvProxy(): any {
  const message =
    'Missing Supabase environment variables. Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in a .env file (see .env.example).';

  // Friendly fallback for local development: don't throw at import time—log a clear message
  // and return safe no-op/resolved promise responses so the app can render.
  // This avoids a white screen while developers set up `.env.local`.
  // IMPORTANT: This does NOT provide real Supabase functionality. Fill in the
  // environment variables to enable full behavior.
  console.error(message);

  const noopResponse = <T = unknown>(result: T | null = null) => ({ data: result as T | null, error: null as Error | null });

  const makeChainable = (result: any) => {
    const obj: any = {
      then: (resolve: any) => Promise.resolve(result).then(resolve),
      catch: () => Promise.resolve(result),
      // allow awaiting the thenable
    };
    const chainMethods = ['select', 'insert', 'update', 'delete', 'eq', 'neq', 'in', 'order', 'limit', 'range', 'single'];
    chainMethods.forEach((m) => {
      obj[m] = (..._args: unknown[]) => obj;
    });
    return obj;
  };

  const tableHandler = () => makeChainable(noopResponse<unknown[]>([]));

  const auth = {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: null, error: new Error(message) }),
    signOut: async () => ({ data: null, error: new Error(message) }),
  };

  const storage = {
    from: () => ({
      upload: async () => ({ data: null, error: new Error(message) }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
      remove: async () => ({ data: null, error: new Error(message) }),
    }),
  };

  return new Proxy(
    {
      from: (_: string) => tableHandler(),
      rpc: () => Promise.resolve(noopResponse(null)),
      auth,
      storage,
    },
    {
      get(target, prop) {
        if (prop in target) return (target as any)[prop];
        // return a noop function/thenable for unknown props
        return () => makeChainable(noopResponse(null));
      },
    }
  );
}

const isValidSupabaseUrl = typeof supabaseUrl === 'string' && /^https?:\/\//.test(supabaseUrl);
const isValidAnonKey = typeof supabaseAnonKey === 'string' && supabaseAnonKey.length > 20;

export const supabase =
  isValidSupabaseUrl && isValidAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : makeMissingEnvProxy();
