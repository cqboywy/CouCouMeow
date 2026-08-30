import { describe, expect, it, vi } from 'vitest';
import { SupabaseAuthenticationError, ensureAuthenticatedUser } from './supabaseAuth';

describe('ensureAuthenticatedUser', () => {
  it('reuses the authenticated session without creating another user', async () => {
    const auth = {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } }, error: null }),
      signInAnonymously: vi.fn(),
    };

    await expect(ensureAuthenticatedUser(auth)).resolves.toEqual({ id: 'user-1' });
    expect(auth.signInAnonymously).not.toHaveBeenCalled();
  });

  it('creates an anonymous user when no session exists', async () => {
    const auth = {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signInAnonymously: vi.fn().mockResolvedValue({ data: { user: { id: 'user-2' } }, error: null }),
    };

    await expect(ensureAuthenticatedUser(auth)).resolves.toEqual({ id: 'user-2' });
  });

  it('turns provider failures into a safe startup error', async () => {
    const auth = {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: new Error('raw-token') }),
      signInAnonymously: vi.fn(),
    };

    await expect(ensureAuthenticatedUser(auth)).rejects.toEqual(expect.objectContaining({
      name: SupabaseAuthenticationError.name,
      message: '暂时无法建立安全的学习档案，请稍后重试。',
    }));
  });
});
