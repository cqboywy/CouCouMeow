import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export class SupabaseConfigurationError extends Error {
  constructor() {
    super('Supabase 环境变量尚未完整配置，请联系管理员。');
    this.name = 'SupabaseConfigurationError';
  }
}

export type SupabasePublicConfig = { url: string; anonKey: string };

export function readSupabaseConfig(env: Record<string, unknown>): SupabasePublicConfig {
  const url = typeof env.VITE_SUPABASE_URL === 'string' ? env.VITE_SUPABASE_URL.trim() : '';
  const publicKey = env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.VITE_SUPABASE_ANON_KEY;
  const anonKey = typeof publicKey === 'string' ? publicKey.trim() : '';
  if (!url || !anonKey) throw new SupabaseConfigurationError();
  return { url, anonKey };
}

export function createSupabaseBrowserClient(config: SupabasePublicConfig): SupabaseClient {
  return createClient(config.url, config.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
}
