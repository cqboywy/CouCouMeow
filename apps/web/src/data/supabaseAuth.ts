type AuthUser = { id: string };
type Session = { user: AuthUser };
type AuthResult<T> = Promise<{ data: T; error: Error | null }>;

export type AnonymousAuthClient = {
  getSession(): AuthResult<{ session: Session | null }>;
  signInAnonymously(): AuthResult<{ user: AuthUser | null }>;
};

export class SupabaseAuthenticationError extends Error {
  constructor() {
    super('暂时无法建立安全的学习档案，请稍后重试。');
    this.name = 'SupabaseAuthenticationError';
  }
}

export async function ensureAuthenticatedUser(auth: AnonymousAuthClient): Promise<AuthUser> {
  const sessionResult = await auth.getSession();
  if (sessionResult.error) throw new SupabaseAuthenticationError();
  if (sessionResult.data.session?.user) return sessionResult.data.session.user;

  const signInResult = await auth.signInAnonymously();
  if (signInResult.error || !signInResult.data.user) throw new SupabaseAuthenticationError();
  return signInResult.data.user;
}
