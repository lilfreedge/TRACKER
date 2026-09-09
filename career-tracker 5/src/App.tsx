import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import GamesPage from './pages/GamesPage';
import SavesPage from './pages/SavesPage';
import SavePage from './pages/SavePage';
import SeasonPage from './pages/SeasonPage';
import PlayerProfilePage from './pages/PlayerProfilePage';
import CareerPage from './pages/CareerPage';
import CompetitionPage from './pages/CompetitionPage';
import RivalsPage from './pages/RivalsPage';
import RivalDetailPage from './pages/RivalDetailPage';
import ManagerProfilePage from './pages/ManagerProfilePage';
import DashboardPage from './pages/DashboardPage';
import ContractsPage from './pages/ContractsPage';
import CompareSeasonsPage from './pages/CompareSeasonsPage';
import SearchPage from './pages/SearchPage';
import SettingsModal from './components/SettingsModal';
import { useLang } from './lib/i18n';
import { applyToDom } from './lib/theme';
import { APP_NAME } from './lib/changelog';

export default function App() {
  const { t } = useLang();
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => { applyToDom(); }, []);

  return (
    <div className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 backdrop-blur px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-lg text-slate-900 dark:text-slate-100">
          <img src="/app-logo.png" alt="Logo" className="w-10 h-10 rounded-lg object-cover ring-2 ring-emerald-500/40" />
          <span>{APP_NAME}</span>
        </Link>
        <Link
          to="/search"
          className="ml-auto text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Search"
          aria-label="Search"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </Link>
        <button
          onClick={() => setSettingsOpen(true)}
          className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label={t('settings')}
          title={t('settings')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </header>
      <main className="flex-1 p-4 max-w-6xl w-full mx-auto">
        <Routes>
          <Route path="/" element={<GamesPage />} />
          <Route path="/game/:edition" element={<SavesPage />} />
          <Route path="/save/:saveId" element={<SavePage />} />
          <Route path="/save/:saveId/career" element={<CareerPage />} />
          <Route path="/save/:saveId/competition" element={<CompetitionPage />} />
          <Route path="/save/:saveId/rivals" element={<RivalsPage />} />
          <Route path="/save/:saveId/rivals/:rivalId" element={<RivalDetailPage />} />
          <Route path="/save/:saveId/dashboard" element={<DashboardPage />} />
          <Route path="/save/:saveId/contracts" element={<ContractsPage />} />
          <Route path="/save/:saveId/compare" element={<CompareSeasonsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/season/:seasonId" element={<SeasonPage />} />
          <Route path="/player/:playerId" element={<PlayerProfilePage />} />
          <Route path="/manager" element={<ManagerProfilePage />} />
        </Routes>
      </main>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
