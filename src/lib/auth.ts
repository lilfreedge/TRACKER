import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';

/**
 * We use username + password auth. Supabase Auth speaks email/password,
 * so we translate username → internal email under a fixed dummy domain.
 * The user never sees or types the email.
 */
const INTERNAL_DOMAIN = 'ct.app';

export function usernameToEmail(username: string): string {
  const safe = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
  return `${safe}@${INTERNAL_DOMAIN}`;
}

export function emailToUsername(email: string | undefined | null): string {
  if (!email) return '';
  return email.split('@')[0] ?? '';
}

/**
 * useSession — subscribes to Supabase auth state and returns the current session.
 * `undefined` while loading, `null` when signed out, `Session` when signed in.
 */
export function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  return session;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function signInWithUsername(username: string, password: string) {
  return supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });
}

export async function signUpWithUsername(username: string, password: string) {
  return supabase.auth.signUp({
    email: usernameToEmail(username),
    password,
    options: {
      data: { username: username.trim().toLowerCase() },
      // No email confirmation needed — see README (must be disabled in Supabase auth settings)
    },
  });
}

export function currentUsername(session: Session | null | undefined): string {
  if (!session) return '';
  const meta = (session.user.user_metadata as any)?.username;
  return typeof meta === 'string' && meta ? meta : emailToUsername(session.user.email);
}
