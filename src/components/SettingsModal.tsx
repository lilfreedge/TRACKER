import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../lib/i18n';
import { useTheme } from '../lib/theme';
import { CHANGELOG, APP_VERSION, APP_NAME } from '../lib/changelog';
import { supabase } from '../lib/supabase';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();
  const [showChangelog, setShowChangelog] = useState(false);
  const [highlightYear, setHighlightYear] = useState('2026');
  useEffect(() => { (async () => { const { data } = await supabase.from('preferences').select('value').eq('key', 'highlight_from_year').maybeSingle(); if (data?.value) setHighlightYear(String(data.value)); })(); }, []);
  async function saveHighlightYear(v: string) {
    setHighlightYear(v);
    await supabase.from('preferences').upsert({ key: 'highlight_from_year', value: v, updated_at: new Date().toISOString() });
  }
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start sm:items-center justify-center p-3" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-lg w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-3">
          <div className="flex items-center gap-2 font-semibold">
            <img src="/app-logo.png" alt="" className="w-7 h-7 rounded" />
            Settings
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xl leading-none">×</button>
        </div>
        <div className="p-5 space-y-6">
          <Link to="/manager" onClick={onClose} className="block bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded p-3 hover:border-emerald-400 transition">
            <div className="text-sm font-medium">👤 Manager profile</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your photo, name, career start year, bio.</div>
          </Link>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Language</div>
            <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700 overflow-hidden text-sm">
              <button onClick={() => setLang('en')} className={`px-4 py-1.5 ${lang === 'en' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>English</button>
              <button onClick={() => setLang('es')} className={`px-4 py-1.5 ${lang === 'es' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>Español</button>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Theme</div>
            <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700 overflow-hidden text-sm">
              <button onClick={() => setTheme('light')} className={`px-4 py-1.5 ${theme === 'light' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>Light</button>
              <button onClick={() => setTheme('dark')} className={`px-4 py-1.5 ${theme === 'dark' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>Dark</button>
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded p-3 bg-slate-50 dark:bg-slate-800/40">
            <div className="mb-1"><span className="font-medium">Currency:</span> EUR</div>
            <div><span className="font-medium">Salary period:</span> per week</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Highlight seasons from year</div>
            <input type="number" value={highlightYear} onChange={(e) => saveHighlightYear(e.target.value)} className="w-32 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-sm" />
            <div className="text-xs text-slate-500 mt-1">Seasons from this year onwards are visually highlighted in Competition tables.</div>
          </div>
          <button onClick={() => setShowChangelog(true)} className="w-full text-left bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded p-3 hover:border-emerald-400 transition flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">📋 Changelog</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Version history · currently v{APP_VERSION}</div>
            </div>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
          <div className="text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
            v{APP_VERSION} · {APP_NAME}
          </div>
        </div>
      </div>
      {showChangelog && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-3" onClick={() => setShowChangelog(false)}>
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-lg w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-3">
              <div className="font-semibold">📋 Changelog</div>
              <button onClick={() => setShowChangelog(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xl leading-none">×</button>
            </div>
            <div className="p-5 space-y-4">
              {CHANGELOG.map((entry) => (
                <div key={entry.version} className="border-l-2 border-emerald-500 pl-3">
                  <div className="flex items-baseline gap-2">
                    <div className="font-semibold">v{entry.version}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{entry.date}</div>
                  </div>
                  <ul className="mt-1 text-sm space-y-1 list-disc list-inside">
                    {entry.changes.map((c, i) => <li key={i} className="text-slate-700 dark:text-slate-300">{c}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
