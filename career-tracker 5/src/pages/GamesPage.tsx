import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, OWNER_EMAIL } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import Loading from '../components/Loading';

interface GameGroup { edition: string; count: number; }

export default function GamesPage() {
  const { t } = useLang();
  const [games, setGames] = useState<GameGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEd, setNewEd] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('career_saves')
      .select('game_edition, name')
      .eq('owner_email', OWNER_EMAIL);
    if (error) { console.error('[games load]', error); alert('Load error: ' + error.message); }
    const groups = new Map<string, number>();
    for (const r of data ?? []) {
      const g = (r as any).game_edition || 'EAFC 26';
      const isReal = (r as any).name !== 'Untitled';
      const prev = groups.get(g) ?? 0;
      groups.set(g, prev + (isReal ? 1 : 0));
    }
    if (![...groups.keys()].length) groups.set('EAFC 26', 0);
    setGames([...groups.entries()].map(([edition, count]) => ({ edition, count })).sort((a, b) => b.edition.localeCompare(a.edition)));
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function addGame() {
    const ed = newEd.trim();
    if (!ed) { alert('Type a game name first'); return; }
    setBusy(true);
    try {
      const { data, error } = await supabase.from('career_saves').insert({
        name: 'Untitled',
        owner_email: OWNER_EMAIL,
        game_edition: ed,
        is_active: false,
      }).select();
      if (error) {
        console.error('[addGame] error', error);
        alert('Error adding game: ' + error.message + (error.hint ? '\n' + error.hint : ''));
        return;
      }
      console.log('[addGame] inserted', data);
      setNewEd('');
      await load();
    } catch (e: any) {
      console.error('[addGame] threw', e);
      alert('Unexpected error: ' + (e?.message ?? String(e)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1 text-slate-900 dark:text-slate-100">{t('games')}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{t('games_subtitle')}</p>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          value={newEd}
          onChange={(e) => setNewEd(e.target.value)}
          placeholder={t('new_game')}
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm placeholder:text-slate-400 dark:text-slate-100"
          onKeyDown={(e) => { if (e.key === 'Enter') addGame(); }}
          disabled={busy}
        />
        <button
          onClick={addGame}
          disabled={busy}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded px-4 py-2 text-sm font-medium"
        >
          {busy ? '…' : t('add')}
        </button>
      </div>

      {loading ? <Loading /> : games.length === 0 ? (
        <div className="text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded p-8 text-center bg-white dark:bg-slate-900">
          {t('empty_games')}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {games.map((g) => (
            <Link
              key={g.edition}
              to={`/game/${encodeURIComponent(g.edition)}`}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 hover:border-emerald-400 hover:shadow-sm transition"
            >
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">{g.edition}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('saves_count', g.count)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
