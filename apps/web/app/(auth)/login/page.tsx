import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { safeRedirectPath } from '@/lib/auth/redirect';
import { AuthBrandPanel } from '../_components/AuthBrandPanel';
import { GoogleButton } from '../_components/GoogleButton';
import { LoginForm } from './LoginForm';
import '../auth.css';

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to continue your FX Academy learning path.',
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  // Next.js 15: searchParams is async.
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Login page shell (RSC). If the visitor already has a session we bounce them to
 * their destination — the auth state of record is read server-side, never from
 * the client (PROJECT.md §6.1). The interactive form is a `'use client'` leaf.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = safeRedirectPath(params.redirect, '/dashboard');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect(redirectTo);
  }

  return (
    <div className="auth">
      <AuthBrandPanel variant="login" />

      <main className="auth-form" id="main">
        <div className="auth-form-inner">
          <h1 className="h-md">Welcome back</h1>
          <p className="muted" style={{ margin: '6px 0 26px' }}>
            Log in to continue your learning path.
          </p>

          <div className="auth-oauth" style={{ marginBottom: 18 }}>
            <GoogleButton label="Continue with Google" />
          </div>

          <div className="auth-divider">
            <hr />
            <span>or</span>
            <hr />
          </div>

          <LoginForm redirectTo={redirectTo} />

          <p className="auth-meta">
            New to FX Academy? <a href="/signup">Create an account</a>
          </p>
        </div>
      </main>
    </div>
  );
}
