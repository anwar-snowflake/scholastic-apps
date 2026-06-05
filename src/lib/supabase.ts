import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

if (
  !import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.VITE_SUPABASE_URL === "https://your-project.supabase.co" ||
  !import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.VITE_SUPABASE_ANON_KEY === "your-anon-key"
) {
  console.warn(
    "Peringatan: Kredensial Supabase belum dikonfigurasi dengan benar di menu Settings > Secrets. " +
    "Gunakan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY untuk sinkronisasi data riil."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Custom lock function running the operation immediately.
    // This completely prevents Web Locks API / navigator.locks lock-stealing issues in iframe and sandbox environments.
    lock: async <R>(name: string, acquireTimeout: number, fn: () => Promise<R>): Promise<R> => {
      return fn();
    }
  }
});
