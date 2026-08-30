import { describe, expect, it } from 'vitest';
import { SupabaseConfigurationError, readSupabaseConfig } from './supabaseConfig';

describe('readSupabaseConfig', () => {
  it('requires both public Supabase environment values', () => {
    expect(() => readSupabaseConfig({ VITE_SUPABASE_URL: 'https://project.supabase.co' })).toThrow(SupabaseConfigurationError);
    expect(() => readSupabaseConfig({ VITE_SUPABASE_ANON_KEY: 'secret-value' })).toThrow('Supabase 环境变量尚未完整配置');
  });

  it('returns trimmed values without including them in errors', () => {
    expect(readSupabaseConfig({
      VITE_SUPABASE_URL: ' https://project.supabase.co ',
      VITE_SUPABASE_ANON_KEY: ' anon-key ',
    })).toEqual({ url: 'https://project.supabase.co', anonKey: 'anon-key' });
  });

  it('accepts the current Supabase publishable key variable', () => {
    expect(readSupabaseConfig({
      VITE_SUPABASE_URL: 'https://project.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
    })).toEqual({ url: 'https://project.supabase.co', anonKey: 'sb_publishable_example' });
  });
});
