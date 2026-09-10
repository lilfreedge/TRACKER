import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Loading from '../components/Loading';
import type { Match, Rival, Season } from '../types/database';
export default function RivalDetailPage() {
  const { saveId, rivalId } = useParams();
  const [rival, setRival] = useState<Rival | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Match>>({});
  async function load() {
    if (!rivalId || !saveId) return;
    setLoading(true);
    const [{ data: r }, { data: ms }, { data: ss }] = await Promise.all([
      supabase.from('rivals').select('*').eq('id', rivalId).single(),
      supabase.from('matches').select('*').eq('rival_id', rivalId).order('match_date', { ascending: false }),
      supabase.from('seasons').select('*').eq('save_id', saveId).order('label', { ascending: false }),
    ]);
    setRival(r); setMatches(ms ?? []); setSeasons(ss ?? []); setLoading(false);
  }
  useEffect(() => { load(); }, [rivalId]);
  async function addMatch() {
    if (!saveId || !rivalId || !form.competition) return;
    const hg = form.home_goals ?? 0, ag = form.away_goals ?? 0;
    const homeIsMine = (form.home_team ?? '').toLowerCase() !== (rival?.rival_team ?? '').toLowerCase();
    const myGoals = homeIsMine ? hg : ag; const theirGoals = homeIsMine ? ag : hg;
    const result = myGoals > theirGoals ? 'W' : myGoals < theirGoals ? 'L' : 'D';
    const { error } = await supabase.from('matches').insert({ save_id: saveId, rival_id: rivalId, season_id: form.season_id ?? null, match_date: form.match_date ?? null, competition: form.competition ?? null, venue: form.venue ?? null, home_team: form.home_team ?? null, away_team: form.away_team ?? null, home_goals: hg, away_goals: ag, result, scorers: form.scorers ?? null, notes: form.notes ?? null });
    if (error) { alert(error.message); return; }
    setForm({}); setShowForm(false); load();
  }
  if (loading) return <Loading />;
  if (!rival) return <div className="text-slate-500">Rival not found.</div>;
  let w = 0, d = 0, l = 0, gf = 0, ga = 0;
  for (const m of matches) {
    if (m.result === 'W') w++; else if (m.result === 'D') d++; else if (m.result === 'L') l++;
    const isHome = (m.home_team || '').toLowerCase() !== (rival.rival_team || '').toLowerCase();
    gf += isHome ? (m.home_goals ?? 0) : (m.away_goals ?? 0);
    ga += isHome ? (m.away_goals ?? 0) : (m.home_goals ?? 0);
  }
  const logo = (rival.notes ?? '').startsWith('logo:') ? (rival.notes ?? '').slice(5) : null;
  return (
    <div>
      <Link to={`/save/${saveId}/rivals`} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm">← Rivals</Link>
      <div className="mt-3 rounded-lg p-5 mb-4 flex items-center gap-4" style={{ background: rival.rival_color ?? '#0f172a', color: '#fff' }}>
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/20 flex items-center justify-center">
          {logo ? <img src={logo} alt="" className="w-full h-full object-cover" /> : <span className="font-bold">{rival.rival_team.slice(0,2).toUpperCase()}</span>}
        </div>
        <div>
          <div className="text-2xl font-bold">{rival.rival_team}</div>
          <div className="opacity-80 text-sm mt-1">{matches.length} matches</div>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2 mb-6">
        {[['Wins', w, 'emerald'], ['Draws', d, 'slate'], ['Losses', l, 'red'], ['GF', gf, 'emerald'], ['GA', ga, 'red']].map(([label, value, color]) => (
          <div key={label as string} className={`rounded-lg p-3 ${color === 'emerald' ? 'bg-emerald-50 text-emerald-700' : color === 'red' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
            <div className="text-xs uppercase opacity-80">{label}</div>
            <div className="text-2xl font-bold mt-1">{value as number}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mb-3">
        <button onClick={() => setShowForm((v) => !v)} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-4 py-2 text-sm">+ New match</button>
      </div>
      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 mb-6 grid gap-2 sm:grid-cols-3">
          <select value={form.season_id ?? ''} onChange={(e) => setForm({ ...form, season_id: e.target.value || null })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm">
            <option value="">Season…</option>{seasons.map((s) => (<option key={s.id} value={s.id}>{s.label}</option>))}
          </select>
          <input value={form.competition ?? ''} onChange={(e) => setForm({ ...form, competition: e.target.value })} placeholder="Competition" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input value={form.match_date ?? ''} onChange={(e) => setForm({ ...form, match_date: e.target.value })} placeholder="Date" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input value={form.home_team ?? ''} onChange={(e) => setForm({ ...form, home_team: e.target.value })} placeholder="Home team" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input value={form.away_team ?? ''} onChange={(e) => setForm({ ...form, away_team: e.target.value })} placeholder="Away team" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <input type="number" value={form.home_goals ?? ''} onChange={(e) => setForm({ ...form, home_goals: e.target.value ? Number(e.target.value) : null })} placeholder="Home" className="w-1/2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
            <input type="number" value={form.away_goals ?? ''} onChange={(e) => setForm({ ...form, away_goals: e.target.value ? Number(e.target.value) : null })} placeholder="Away" className="w-1/2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          </div>
          <div className="sm:col-span-3 flex justify-end gap-2"><button onClick={() => setShowForm(false)} className="px-3 py-2 text-sm text-slate-500">Cancel</button><button onClick={addMatch} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-4 py-2 text-sm">Save</button></div>
        </div>
      )}
      <div className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden bg-white dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs uppercase"><tr><th className="text-left px-3 py-2">Date</th><th className="text-left px-3 py-2">Competition</th><th className="text-left px-3 py-2">Home</th><th className="text-center px-3 py-2">Score</th><th className="text-left px-3 py-2">Away</th><th className="text-center px-3 py-2">R</th></tr></thead>
          <tbody>
            {matches.length === 0 ? (<tr><td colSpan={6} className="text-center text-slate-400 py-6">No matches.</td></tr>) : matches.map((m) => (
              <tr key={m.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="px-3 py-2 text-slate-500">{m.match_date ?? '—'}</td>
                <td className="px-3 py-2">{m.competition ?? '—'}</td>
                <td className="px-3 py-2">{m.home_team ?? '—'}</td>
                <td className="px-3 py-2 text-center font-mono">{m.home_goals ?? '?'} - {m.away_goals ?? '?'}</td>
                <td className="px-3 py-2">{m.away_team ?? '—'}</td>
                <td className="px-3 py-2 text-center"><span className={`inline-block w-6 h-6 rounded text-xs leading-6 font-bold text-white ${m.result === 'W' ? 'bg-emerald-600' : m.result === 'L' ? 'bg-red-600' : 'bg-slate-400'}`}>{m.result ?? '?'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
