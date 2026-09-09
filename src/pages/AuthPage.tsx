import { useState, type FormEvent } from 'react';
import { signInWithUsername, signUpWithUsername } from '../lib/auth';

type Mode = 'sign-in' | 'sign-up';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('sign-in');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const u = username.trim();
      if (!u) { setError('Enter a username'); return; }
      if (mode === 'sign-in') {
        const { error } = await signInWithUsername(u, password);
        if (error) setError(error.message);
      } else {
        const { error } = await signUpWithUsername(u, password);
        if (error) setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src="/loading-avatar.png" alt="" className="w-16 h-16 rounded-full border-2 border-emerald-500/40 mb-3" />
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">Career Tracker</div>
          <div className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {mode === 'sign-in' ? 'Sign in to your account' : 'Create a new account'}
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 chars)"
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
          />

          {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded px-4 py-2 text-sm font-medium"
          >
            {loading ? '...' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          {mode === 'sign-in' ? (
            <>No account?{' '}
              <button onClick={() => { setMode('sign-up'); setError(null); }} className="text-emerald-600 hover:text-emerald-500">Sign up</button>
            </>
          ) : (
            <>Already have one?{' '}
              <button onClick={() => { setMode('sign-in'); setError(null); }} className="text-emerald-600 hover:text-emerald-500">Sign in</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
