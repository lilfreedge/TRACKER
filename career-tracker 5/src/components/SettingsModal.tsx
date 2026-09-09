import { Link } from 'react-router-dom';
import { useLang } from '../lib/i18n';
import { useTheme } from '../lib/theme';
import { CHANGELOG, APP_VERSION, APP_NAME } from '../lib/changelog';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start sm:items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-lg w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-3">
          <div className="flex items-center gap-2 font-semibold">
            <img src="/app-logo.png" alt="" className="w-7 h-7 rounded" />
            Settings
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-6">
          <Link
            to="/manager"
            onClick={onClose}
            className="block bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded p-3 hover:border-emerald-400 transition"
          >
            <div className="text-sm font-medium">👤 Manager profile</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your photo, name, career start year, bio.</div>
          </Link>

          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Language</div>
            <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700 overflow-hidden text-sm">
              <button
                onClick={() => setLang('en')}
                className={`px-4 py-1.5 ${lang === 'en' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >English</button>
              <button
                onClick={() => setLang('es')}
                className={`px-4 py-1.5 ${lang === 'es' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >Español</button>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Theme</div>
            <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700 overflow-hidden text-sm">
              <button
                onClick={() => setTheme('light')}
                className={`px-4 py-1.5 ${theme === 'light' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >Light</button>
              <button
                onClick={() => setTheme('dark')}
                className={`px-4 py-1.5 ${theme === 'dark' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >Dark</button>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded p-3 bg-slate-50 dark:bg-slate-800/40">
            <div className="mb-1"><span className="font-medium">Currency:</span> EUR</div>
            <div><span className="font-medium">Salary period:</span> per week</div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Changelog</div>
            <div className="space-y-4">
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

          <div className="text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
            v{APP_VERSION} · {APP_NAME}
          </div>
        </div>
      </div>
    </div>
  );
}
