import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Loading from '../components/Loading';

interface Champion { id: string; save_id: string; competition_name: string; team_name: string; team_country: string | null; team_color?: string | null; team_text_color?: string | null; wins: number; runners_up: number; years_won: string | null; years_runner_up: string | null; }
interface League { id: string; save_id: string; name: string; logo_url: string | null; country: string | null; }
interface TopScorer { id: string; save_id: string; competition_name: string; player_name: string; nationality: string | null; goals: number; season_label: string; team_name: string | null; team_color: string | null; team_text_color: string | null; nationality_color: string | null; }

// Normalize "38" → "2038", "27-28" → "2027-2028", already 4-digit unchanged.
function normYear(s: string, base = 2000): string {
  return s.trim().split(/\s+/).map((tok) => tok.split('-').map((p) => {
    const n = p.replace(/\D+/g, '');
    if (!n) return p;
    if (n.length === 4) return n;
    if (n.length === 2) return String(base + Number(n));
    return n;
  }).join('-')).join(' ');
}

export default function LeagueDetailPage() {
  const { saveId, name } = useParams();
  const compName = decodeURIComponent(name ?? '');
  const [league, setLeague] = useState<League | null>(null);
  const [champs, setChamps] = useState<Champion[]>([]);
  const [scorers, setScorers] = useState<TopScorer[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightFrom, setHighlightFrom] = useState(2026);
  const [showChampForm, setShowChampForm] = useState(false);
  const [showScorerForm, setShowScorerForm] = useState(false);
  const [cForm, setCForm] = useState<Partial<Champion>>({ wins: 0, runners_up: 0 });
  const [sForm, setSForm] = useState<Partial<TopScorer>>({ goals: 0 });

  async function load() {
    if (!saveId) return;
    setLoading(true);
    const [{ data: lg }, { data: ch }, { data: ts }, { data: pref }] = await Promise.all([
      supabase.from('save_competitions').select('*').eq('save_id', saveId).eq('name', compName).maybeSingle(),
      supabase.from('competition_champions').select('*').eq('save_id', saveId).eq('competition_name', compName).order('wins', { ascending: false }),
      supabase.from('competition_top_scorers').select('*').eq('save_id', saveId).eq('competition_name', compName).order('goals', { ascending: false }),
      supabase.from('preferences').select('value').eq('key', 'highlight_from_year').maybeSingle(),
    ]);
    setLeague(lg as League | null);
    setChamps((ch ?? []) as Champion[]);
    setScorers((ts ?? []) as TopScorer[]);
    if (pref?.value) setHighlightFrom(Number(pref.value));
    setLoading(false);
  }
  useEffect(() => { load(); }, [saveId, compName]);

  function yearBadge(y: string) {
    const clean = normYear(y);
    return clean.split(/\s+/).map((tok, i) => {
      const firstYear = Number(tok.split('-')[0].replace(/\D+/g, ''));
      const isHi = firstYear >= highlightFrom;
      return <span key={i} className={`inline-block mr-1 px-1.5 py-0.5 rounded ${isHi ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 font-semibold' : 'text-slate-600 dark:text-slate-300'}`}>{tok}</span>;
    });
  }

  async function saveChamp() {
    if (!saveId || !cForm.team_name) return;
    const payload: any = { save_id: saveId, competition_name: compName, team_name: cForm.team_name, team_country: cForm.team_country || null, team_color: cForm.team_color || null, team_text_color: cForm.team_text_color || null, wins: Number(cForm.wins ?? 0), runners_up: Number(cForm.runners_up ?? 0), years_won: cForm.years_won || null, years_runner_up: cForm.years_runner_up || null };
    if (cForm.id) await supabase.from('competition_champions').update(payload).eq('id', cForm.id);
    else await supabase.from('competition_champions').insert(payload);
    setCForm({ wins: 0, runners_up: 0 }); setShowChampForm(false); load();
  }
  async function delChamp(id: string) { if (!confirm('Delete?')) return; await supabase.from('competition_champions').delete().eq('id', id); load(); }

  async function saveScorer() {
    if (!saveId || !sForm.player_name || !sForm.season_label) return;
    const payload: any = { save_id: saveId, competition_name: compName, player_name: sForm.player_name, nationality: sForm.nationality || null, goals: Number(sForm.goals ?? 0), season_label: normYear(String(sForm.season_label)), team_name: sForm.team_name || null, team_color: sForm.team_color || null, team_text_color: sForm.team_text_color || null, nationality_color: sForm.nationality_color || null };
    if (sForm.id) await supabase.from('competition_top_scorers').update(payload).eq('id', sForm.id);
    else await supabase.from('competition_top_scorers').insert(payload);
    setSForm({ goals: 0 }); setShowScorerForm(false); load();
  }
  async function delScorer(id: string) { if (!confirm('Delete?')) return; await supabase.from('competition_top_scorers').delete().eq('id', id); load(); }

  if (loading) return <Loading />;

  return (
    <div>
      <Link to={`/save/${saveId}/competition`} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm">← Competition</Link>

      {/* Header: country + league */}
      <div className="mt-3 mb-6 flex items-stretch rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="bg-white dark:bg-slate-900 px-6 py-4 flex items-center border-r border-slate-200 dark:border-slate-800 min-w-[140px]">
          <div className="text-red-800 dark:text-red-400 font-black text-2xl tracking-tight uppercase">{league?.country ?? '—'}</div>
        </div>
        <div className="flex-1 bg-purple-500 text-white px-6 py-4 flex items-center gap-3">
          {league?.logo_url && <img src={league.logo_url} alt="" className="w-10 h-10 object-contain bg-white/10 rounded p-1" />}
          <div className="font-bold uppercase text-lg tracking-wide">{compName}</div>
        </div>
      </div>

      {/* Champions table */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs uppercase font-semibold text-slate-500">Champions</div>
          <button onClick={() => { setCForm({ wins: 0, runners_up: 0 }); setShowChampForm(true); }} className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded px-3 py-1">+ Add</button>
        </div>
        {showChampForm && (
          <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded p-3 mb-3 grid gap-2 sm:grid-cols-3">
            <input value={cForm.team_name ?? ''} onChange={(e) => setCForm({ ...cForm, team_name: e.target.value })} placeholder="Team" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm" />
            <input value={cForm.team_color ?? ''} onChange={(e) => setCForm({ ...cForm, team_color: e.target.value })} placeholder="Team color hex" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm" />
            <input value={cForm.team_text_color ?? ''} onChange={(e) => setCForm({ ...cForm, team_text_color: e.target.value })} placeholder="Text color hex" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm" />
            <input type="number" value={cForm.wins ?? 0} onChange={(e) => setCForm({ ...cForm, wins: Number(e.target.value) })} placeholder="W" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm" />
            <input type="number" value={cForm.runners_up ?? 0} onChange={(e) => setCForm({ ...cForm, runners_up: Number(e.target.value) })} placeholder="2nd" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm" />
            <div></div>
            <input value={cForm.years_won ?? ''} onChange={(e) => setCForm({ ...cForm, years_won: e.target.value })} placeholder="Years W (e.g. 27 31 35)" className="sm:col-span-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm" />
            <input value={cForm.years_runner_up ?? ''} onChange={(e) => setCForm({ ...cForm, years_runner_up: e.target.value })} placeholder="Years 2nd" className="sm:col-span-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm" />
            <div className="sm:col-span-3 flex justify-end gap-2"><button onClick={() => setShowChampForm(false)} className="text-sm text-slate-500 px-3">Cancel</button><button onClick={saveChamp} className="bg-emerald-600 text-white rounded px-3 py-1 text-sm">Save</button></div>
          </div>
        )}
        <div className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden bg-white dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-purple-500 text-white text-xs uppercase"><tr><th className="text-left px-3 py-2">Team</th><th className="text-right px-3 py-2 w-14">W</th><th className="text-right px-3 py-2 w-14">2ND</th><th className="text-left px-3 py-2">Year W</th><th className="text-left px-3 py-2">Year 2ND</th><th className="w-10"></th></tr></thead>
            <tbody>{champs.length === 0 ? <tr><td colSpan={6} className="text-center text-slate-400 py-6">No data yet.</td></tr> : champs.map((c) => (
              <tr key={c.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="px-3 py-2 font-bold uppercase" style={{ background: c.team_color ?? undefined, color: c.team_text_color ?? undefined }}>{c.team_name}</td>
                <td className="px-3 py-2 text-right">{c.wins}</td>
                <td className="px-3 py-2 text-right">{c.runners_up}</td>
                <td className="px-3 py-2">{c.years_won ? yearBadge(c.years_won) : '—'}</td>
                <td className="px-3 py-2">{c.years_runner_up ? yearBadge(c.years_runner_up) : '—'}</td>
                <td className="px-3 py-2"><button onClick={() => delChamp(c.id)} className="text-slate-300 hover:text-red-500 text-sm">×</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      {/* Top scorers in one season */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs uppercase font-semibold text-slate-500">Top scorer in one season</div>
          <button onClick={() => { setSForm({ goals: 0 }); setShowScorerForm(true); }} className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded px-3 py-1">+ Add</button>
        </div>
        {showScorerForm && (
          <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded p-3 mb-3 grid gap-2 sm:grid-cols-3">
            <input value={sForm.player_name ?? ''} onChange={(e) => setSForm({ ...sForm, player_name: e.target.value })} placeholder="Player name" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm" />
            <input type="number" value={sForm.goals ?? 0} onChange={(e) => setSForm({ ...sForm, goals: Number(e.target.value) })} placeholder="Goals" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm" />
            <input value={sForm.nationality ?? ''} onChange={(e) => setSForm({ ...sForm, nationality: e.target.value })} placeholder="Nationality" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm" />
            <input value={sForm.nationality_color ?? ''} onChange={(e) => setSForm({ ...sForm, nationality_color: e.target.value })} placeholder="Nat color hex" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm" />
            <input value={sForm.season_label ?? ''} onChange={(e) => setSForm({ ...sForm, season_label: e.target.value })} placeholder="Season (e.g. 27-28)" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm" />
            <input value={sForm.team_name ?? ''} onChange={(e) => setSForm({ ...sForm, team_name: e.target.value })} placeholder="Team" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm" />
            <input value={sForm.team_color ?? ''} onChange={(e) => setSForm({ ...sForm, team_color: e.target.value })} placeholder="Team color hex" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm" />
            <input value={sForm.team_text_color ?? ''} onChange={(e) => setSForm({ ...sForm, team_text_color: e.target.value })} placeholder="Text color hex" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-sm" />
            <div className="flex justify-end gap-2"><button onClick={() => setShowScorerForm(false)} className="text-sm text-slate-500 px-3">Cancel</button><button onClick={saveScorer} className="bg-emerald-600 text-white rounded px-3 py-1 text-sm">Save</button></div>
          </div>
        )}
        <div className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden bg-white dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs uppercase"><tr><th className="w-10 px-3 py-2 text-left">#</th><th className="text-left px-3 py-2">Top scorer</th><th className="text-right px-3 py-2 w-16">Goals</th><th className="text-left px-3 py-2">Nationality</th><th className="text-left px-3 py-2">Season</th><th className="text-left px-3 py-2">Team</th><th className="w-10"></th></tr></thead>
            <tbody>{scorers.length === 0 ? <tr><td colSpan={7} className="text-center text-slate-400 py-6">No data yet.</td></tr> : scorers.map((s, i) => {
              const seasonYear = Number(s.season_label.split('-')[0].replace(/\D+/g, ''));
              const highlight = seasonYear >= highlightFrom;
              return (
                <tr key={s.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-3 py-2 text-slate-400 font-mono">{i + 1}</td>
                  <td className="px-3 py-2 font-medium">{s.player_name}</td>
                  <td className="px-3 py-2 text-right font-semibold">{s.goals}</td>
                  <td className="px-3 py-2 font-bold uppercase text-center" style={{ background: s.nationality_color ?? '#e2e8f0', color: (s.nationality_color ? '#fff' : '#334155') }}>{s.nationality ?? '—'}</td>
                  <td className={`px-3 py-2 ${highlight ? 'font-semibold text-emerald-700 dark:text-emerald-300' : ''}`}>{s.season_label}</td>
                  <td className="px-3 py-2 font-bold uppercase" style={{ background: s.team_color ?? undefined, color: s.team_text_color ?? undefined }}>{s.team_name ?? '—'}</td>
                  <td className="px-3 py-2"><button onClick={() => delScorer(s.id)} className="text-slate-300 hover:text-red-500 text-sm">×</button></td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
