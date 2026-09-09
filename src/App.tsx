import { Routes, Route, Link } from 'react-router-dom';
import SavesPage from './pages/SavesPage';
import SavePage from './pages/SavePage';
import SeasonPage from './pages/SeasonPage';

export default function App() {
  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link to="/" className="font-bold tracking-tight text-lg">
          Career Tracker
        </Link>
        <span className="text-slate-500 text-sm ml-auto">EAFC 26</span>
      </header>
      <main className="flex-1 p-4 max-w-6xl w-full mx-auto">
        <Routes>
          <Route path="/" element={<SavesPage />} />
          <Route path="/save/:saveId" element={<SavePage />} />
          <Route path="/season/:seasonId" element={<SeasonPage />} />
        </Routes>
      </main>
    </div>
  );
}
