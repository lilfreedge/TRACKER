import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import Loading from '../components/Loading';
import { CareerIcon, CurrentSeasonIcon, CompetitionIcon, RivalsIcon, ContractIcon, PlusIcon } from '../components/Icons';
import type { CareerSave, Season } from '../types/database';

type TileKey = 'career' | 'current' | 'competition' | 'rivals';
const DEFAULT_ORDER: TileKey[] = ['career', 'current', 'competition', 'rivals'];

export default function SavePage() {
  const { saveId } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const [save, setSave] = useState<CareerSave | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [tileOrder, setTileOrder] = useState<TileKey[]>(DEFAULT_ORDER);
  const [showSeasonForm, setShowSeasonForm] = useState(false);
  const [nationalTeam, setNationalTeam] = useState('');
  const [nationalSinceMonth, setNationalSinceMonth] = useState('');
  const [nationalSinceYear, setNationalSinceYear] = useState('');
  const [label, setLabel] = useState('');
  const dragId = useRef<string | null>(null);

  async function load() {
    if (!saveId) return;
    setLoading(true);
    const [{ data: s }, { data: se }] = await Promise.all([
      supabase.from('career_saves').select('*').eq('id', saveId).single(),
      supabase.from('seasons').select('*').eq('save_id', saveId).order('sort_order', { ascending: true }).order('label', { ascending: false }),
    ]);
    setSave(s); setSeasons(se ?? []); setLoading(false);
    try { const stored = localStorage.getItem(`tileOrder:${saveId}`); if (stored) { const parsed = JSON.parse(stored) as TileKey[]; if (parsed.every((k) => DEFAULT_ORDER.includes(k))) setTileOrder(parsed); } } catch {}
    if (se && se.length) { const first = se[0].label; const m = /^(\d{4})-(\d{4})$/.exec(first); if (m) { const y2 = Number(m[2]); setLabel(`${y2}-${y2 + 1}`); } } else { setLabel('2037-2038'); }
  }
  useEffect(() => { load(); }, [saveId]);

  async function createSeason() {
    if (!saveId || !label.trim()) return;
    const payload: any = { save_id: saveId, label: label.trim(), national_team: nationalTeam.trim() || null, national_team_since_year: nationalSinceYear ? Number(nationalSinceYear) : null, national_since_month: nationalSinceMonth ? Number(nationalSinceMonth) : null, is_current: false };
    const { error } = await supabase.from('seasons').insert(payload);
    if (error) { alert('Error: ' + error.message); return; }
    setLabel(''); setNationalTeam(''); setNationalSinceMonth(''); setNationalSinceYear(''); setShowSeasonForm(false); load();
  }

  async function onDrop(targetId: string) {
    const sourceId = dragId.current;
    if (!sourceId || sourceId === targetId) return;
    const src = seasons.findIndex((s) => s.id === sourceId);
    const tgt = seasons.findIndex((s) => s.id === targetId);
    if (src < 0 || tgt < 0) return;
    const next = [...seasons];
    const [moved] = next.splice(src, 1);
    next.splice(tgt, 0, moved);
    setSeasons(next); dragId.current = null;
    await Promise.all(next.map((s, i) => supabase.from('seasons').update({ sort_order: i + 1 }).eq('id', s.id)));
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return seasons;
    return seasons.filter((s) => (s.label + ' ' + (s.team_name_snapshot ?? '')).toLowerCase().includes(term));
  }, [seasons, q]);

  if (loading) return <Loading />;
  if (!save) return null;

  const current = seasons.find((s) => s.is_current) ?? seasons[0];
  const tiles: Record<TileKey, { title: string; icon: any; onClick: () => void; disabled?: boolean; subtitle?: string; accent: string }> = {
    career:      { title: t('career'), icon: CareerIcon, accent: 'from-blue-500/10 to-blue-500/5 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300', onClick: () => navigate(`/save/${saveId}/career`) },
    current:     { title: t('current_season'), icon: CurrentSeasonIcon, accent: 'from-emerald-500/10 to-emerald-500/5 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300', onClick: () => current && navigate(`/season/${current.id}`), disabled: !current, subtitle: current ? `${current.label} · ${current.team_name_snapshot ?? ''}` : undefined },
    competition: { title: t('competition'), icon: CompetitionIcon, accent: 'from-amber-500/10 to-amber-500/5 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300', onClick: () => navigate(`/save/${saveId}/competition`) },
    rivals:      { title: t('rivals'), icon: RivalsIcon, accent: 'from-rose-500/10 to-rose-500/5 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300', onClick: () => navigate(`/save/${saveId}/rivals`) },
  };

  return (
    <div>
      <Link to={`/game/${encodeURIComponent(save.game_edition ?? '')}`} className="text-emerald-600 text-xs uppercase font-semibold tracking-wide">{save.game_edition ?? '—'}</Link>
      <div className="mt-1 mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">{save.name}</h1>
          <p className="text-slate-500 text-sm mt-1">{seasons.length} {t('seasons')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/save/${saveId}/contracts`)} className="border border-slate-300 dark:border-slate-700 hover:border-emerald-400 rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 transition">
            <ContractIcon width={16} height={16} /> {t('new_contract') ?? 'Contracts'}
          </button>
          <button onClick={() => setShowSeasonForm((v) => !v)} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 transition">
            <PlusIcon width={16} height={16} /> {t('new_season')}
          </button>
        </div>
      </div>

      {/* Hero tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {tileOrder.map((key) => {
          const tile = tiles[key];
          const Icon = tile.icon;
          return (
            <button key={key} disabled={tile.disabled} onClick={tile.onClick}
              className={`text-left rounded-xl p-4 border bg-gradient-to-br ${tile.accent} hover:scale-[1.02] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100`}>
              <Icon width={22} height={22} />
              <div className="mt-3 font-semibold text-slate-900 dark:text-slate-100">{tile.title}</div>
              {tile.subtitle && <div className="text-xs mt-1 opacity-75">{tile.subtitle}</div>}
            </button>
          );
        })}
      </div>

      {/* Sub-nav */}
      <div className="flex flex-wrap gap-2 mb-6 text-xs">
        {[['Dashboard', `/save/${saveId}/dashboard`], ['Compare', `/save/${saveId}/compare`], ['Contracts', `/save/${saveId}/contracts`], ['Awards', `/save/${saveId}/awards`], ['Manager', `/save/${saveId}/manager`]].map(([lbl, to]) => (
          <Link key={to} to={to} className="text-slate-500 hover:text-emerald-600 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1 transition">{lbl}</Link>
        ))}
      </div>

      {showSeasonForm && (
        <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-lg p-4 mb-4 grid gap-2 sm:grid-cols-4">
          <input autoFocus value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (e.g. 2038-2039)" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input value={nationalTeam} onChange={(e) => setNationalTeam(e.target.value)} placeholder="National team (optional)" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input value={nationalSinceMonth} onChange={(e) => setNationalSinceMonth(e.target.value)} placeholder="Since month" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input value={nationalSinceYear} onChange={(e) => setNationalSinceYear(e.target.value)} placeholder="Since year" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <div className="sm:col-span-4 flex justify-end gap-2"><button onClick={() => setShowSeasonForm(false)} className="text-sm px-3 py-2 text-slate-500">Cancel</button><button onClick={createSeason} className="bg-emerald-600 text-white rounded px-4 py-2 text-sm">Create</button></div>
        </div>
      )}

      {/* Search seasons */}
      <div className="relative mb-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search_seasons') ?? 'Search seasons…'} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm" />
        <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
      </div>

      {filtered.length === 0 ? (
        <div className="text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded p-8 text-center bg-white dark:bg-slate-900">{q ? 'No matches.' : 'No seasons yet.'}</div>
      ) : (
        <div className="grid gap-2">
          {filtered.map((s) => (
            <div key={s.id}
              draggable
              onDragStart={() => { dragId.current = s.id; }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(s.id)}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 rounded-lg flex items-stretch overflow-hidden cursor-move transition">
              <div className="w-1.5" style={{ background: s.team_color ?? '#64748b' }} />
              <Link to={`/season/${s.id}`} className="flex-1 flex items-center gap-4 px-4 py-3 min-w-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{s.label}</span>
                    {s.is_current && <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 rounded">Current</span>}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">
                    {s.team_name_snapshot ? <span className="font-medium text-slate-700 dark:text-slate-300">{s.team_name_snapshot}</span> : <span>—</span>}
                    {s.team_since_year && <span> · since {s.team_since_year}</span>}
                  </div>
                </div>
                <svg className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
