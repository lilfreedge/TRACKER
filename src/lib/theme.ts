import { useSyncExternalStore, useEffect } from 'react';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'theme';

function readInitial(): Theme {
  if (typeof localStorage === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return 'light';
}

let current: Theme = readInitial();
const listeners = new Set<() => void>();

function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
function getSnapshot(): Theme { return current; }

export function setTheme(t: Theme) {
  current = t;
  try { localStorage.setItem(STORAGE_KEY, t); } catch {}
  applyToDom(t);
  listeners.forEach((fn) => fn());
}

export function applyToDom(t: Theme = current) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', t === 'dark');
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  useEffect(() => { applyToDom(theme); }, [theme]);
  return { theme, setTheme };
}
