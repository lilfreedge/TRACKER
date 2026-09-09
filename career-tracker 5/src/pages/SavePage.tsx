import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import Loading from '../components/Loading';
import { CareerIcon, CurrentSeasonIcon, CompetitionIcon, RivalsIcon, ContractIcon, InfoIcon, PlusIcon, ChevronUp, ChevronDown } from '../components/Icons';
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
  const [openInfoId, setOpenInfoId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [tileOrder, setTileOrder] = useState<TileKey[]>(DEFAULT_ORDER);
  const [reorderMode, setReorderMode] = useState(false);

  // New season form (redesigned)
  const [nationalTeam, setNationalTeam] = useState('');
  const [nationalSinceMonth, setNationalSinceMonth] = useState('');
  const [nationalSinceYear, setNationalSinceYear] = useState('');
  const [label, setLabel] = useState('');

  async function load() {
    if (!saveId) return;
    setLoading(true);
    const [{ data: s }, { data: se }] = await Promise.all([
      supabase.from('career_saves').select('*').eq('id', saveId).single(),
      supabase.from('seasons').select('*').eq('save_id', saveId).order('sort_order', { ascending: true }).order('label', { ascending: false }),
    ]);
    setSave(s);
    setSeasons(se ?? []);
    setLoading(false);
    // load tile order from localStorage
    try {
      const stored = localStorage.getItem(`tileOrder:${saveId}`);
      if (stored) {
        const parsed = JSON.parse(stored) as TileKey[];
        if (parsed.every((k) => DEFAULT_ORDER.includes(k))) setTileOrder(parsed);
      }
    } catch {}
    // suggest label for new season based on last existing season
    if (se && se.length) {
      const first = se[0].label; // most recent (order desc)
      const m = /^(\d{4})-(\d{4})$/.exec(first);
      if (m) {
        const y2 = Number(m[2]);
        setLabel(`${y2}-${y2 + 1}`);
      }
    } else {
      setLabel('2037-2038');
    }
  }
  useEffect(() => { load(); }, [saveId]);

  function moveTile(idx: number, dir: -1 | 1) {
    setTileOrder((prev) => {
      const next = [...prev];
      const to = idx + dir;
      if (to < 0 || to >= next.length) return prev;
      [next[idx], next[to]] = [next[to], next[idx]];
      try { localStorage.setItem(`tileOrder:${saveId}`, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  async function createSeason() {
    if (!saveId || !label.trim()) return;
    const payload: any = {
      save_id: saveId,
      label: label.trim(),
      national_team: nationalTeam.trim() || null,
      national_team_since_year: nationalSinceYear ? Number(nationalSinceYear) : null,
      national_since_month: nationalSinceMonth ? Number(nationalSinceMonth) : null,
      is_current: false,
    };
    const { error } = await supabase.from('seasons').insert(payload);
    if (error) { alert('Error creating season: ' + error.message); console.error(error); return; }
    setLabel(''); setNationalTeam(''); setNationalSinceMonth(''); setNationalSinceYear('');
    setShowForm(false);
    load();
  }

  async function moveSeason(idx: number, dir: -1 | 1) {
    const next = [...seasons];
    const to = idx + dir;
    if (to < 0 || to >= next.length) return;
    [next[idx], next[to]] = [next[to], next[idx]];
    setSeasons(next);
    // persist sort_order
    for (let i = 0; i < next.length; i++) {
      await supabase.from('seasons').update({ sort_order: i }).eq('id', next[i].id);
    }
  }

  if (loading) return <Loading />;
  if (!save) return <div className="text-slate-500 dark:text-slate-400">Save not found. <Link to="/" className="text-emerald-600">home</Link></div>;

  const current = seasons.find((s) => s.is_current) ?? seasons[0];

  const tiles: Record<TileKey, { title: string; icon: any; onClick: () => void; disabled?: boolean; subtitle?: string; accent: string }> = {
    career:      { title: t('career'),         icon: CareerIcon,        accent: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',       onClick: () => navigate(`/save/${save.id}/career`) },
    current:     { title: t('current_season'), icon: CurrentSeasonIcon, accent: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300', onClick: () => current && navigate(`/season/${current.id}`), disabled: !current, subtitle: current ? `${current.label} · ${current.team_name_snapshot ?? ''}` : undefined },
    competition: { title: t('competition'),    icon: CompetitionIcon,   accent: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300', onClick: () => navigate(`/save/${save.id}/competition`) },
    rivals:      { title: t('rivals'),         icon: RivalsIcon,        accent: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300', onClick: () => navigate(`/save/${save.id}/rivals`) },
  };

  return (
    <div>
      <Link to={`/game/${encodeURIComponent(save.game_edition)}`} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm">{t('back_saves')}</Link>

      <div className="mt-2 mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-emerald-600 text-sm font-medium">{save.game_edition}</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{save.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{seasons.length} {t('seasons')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/save/${save.id}/contracts`)}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded px-4 py-2 text-sm font-medium flex items-center gap-1.5"
          >
            <ContractIcon width="16" height="16" /> New contract
          </button>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-4 py-2 text-sm font-medium flex items-center gap-1"
          >
            <PlusIcon width="16" height="16" /> {t('new_season')}
          </button>
        </div>
      </div>

      {/* Hero tiles */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs uppercase text-slate-500 dark:text-slate-400">Overview</div>
        <button
          onClick={() => setReorderMode((v) => !v)}
          className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >{reorderMode ? 'Done' : 'Reorder'}</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {tileOrder.map((k, i) => {
          const tile = tiles[k];
          const Icon = tile.icon;
          return (
            <div key={k} className={`relative border rounded-lg p-4 transition ${tile.accent} ${tile.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-sm cursor-pointer'}`}
              onClick={() => !tile.disabled && !reorderMode && tile.onClick()}
            >
              <div className="flex items-center gap-2 mb-3"><Icon width="20" height="20" /></div>
              <div className="font-semibold">{tile.title}</div>
              {tile.subtitle && <div className="text-xs mt-1 opacity-80 line-clamp-1">{tile.subtitle}</div>}
              {reorderMode && (
                <div className="absolute top-2 right-2 flex flex-col">
                  <button onClick={(e) => { e.stopPropagation(); moveTile(i, -1); }} className="p-1 hover:bg-white/50 dark:hover:bg-slate-800 rounded"><ChevronUp width="14" height="14" /></button>
                  <button onClick={(e) => { e.stopPropagation(); moveTile(i, 1); }}  className="p-1 hover:bg-white/50 dark:hover:bg-slate-800 rounded"><ChevronDown width="14" height="14" /></button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 mb-6 grid gap-2 sm:grid-cols-3">
          <input value={nationalTeam} onChange={(e) => setNationalTeam(e.target.value)} placeholder={t('national_team_placeholder')} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-slate-100" />
          <select value={nationalSinceMonth} onChange={(e) => setNationalSinceMonth(e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-slate-100">
            <option value="">Since month…</option>
            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <input value={nationalSinceYear} onChange={(e) => setNationalSinceYear(e.target.value)} placeholder="Since year (2037)" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-slate-100" />
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t('label_placeholder')} className="sm:col-span-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-slate-100" />
          <div className="sm:col-span-3 flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">{t('cancel')}</button>
            <button onClick={createSeason} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-4 py-2 text-sm font-medium">{t('save_btn')}</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap text-sm mb-4">
        <Link to={`/save/${save.id}/dashboard`} className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded hover:border-emerald-400">📊 Dashboard</Link>
        <Link to={`/save/${save.id}/compare`}   className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded hover:border-emerald-400">🔀 Compare seasons</Link>
        <Link to={`/save/${save.id}/contracts`} className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded hover:border-emerald-400">📜 Contracts</Link>
        <Link to="/manager"                     className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded hover:border-emerald-400">👤 Manager</Link>
      </div>

      {seasons.length === 0 ? (
        <div className="text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded p-8 text-center bg-white dark:bg-slate-900">
          {t('empty_seasons')}
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {seasons.map((s, idx) => (
            <div key={s.id} className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 hover:border-emerald-400 hover:shadow-sm transition flex items-center gap-3 group">
              <Link to={`/season/${s.id}`} className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-slate-900 dark:text-slate-100 truncate">{s.team_name_snapshot ?? '—'}</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 truncate">
                  {s.label}
                  {s.club_since_year ? ` · ${t('since')} ${s.club_since_year}` : ''}
                  {s.national_team ? ` · 🌍 ${s.national_team}` : ''}
                </div>
              </Link>
              {s.team_color && (<div className="w-1 h-8 rounded-sm order-first" style={{ background: s.team_color }} />)}
              {s.is_current && (<span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded">{t('current')}</span>)}
              <button
                onClick={(e) => { e.preventDefault(); setOpenInfoId(openInfoId === s.id ? null : s.id); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition"
                title={t('registered')}
              ><InfoIcon width="16" height="16" /></button>
              {reorderMode && (
                <div className="flex flex-col">
                  <button onClick={() => moveSeason(idx, -1)} className="text-slate-400 hover:text-slate-700 p-0.5"><ChevronUp width="14" height="14" /></button>
                  <button onClick={() => moveSeason(idx, 1)}  className="text-slate-400 hover:text-slate-700 p-0.5"><ChevronDown width="14" height="14" /></button>
                </div>
              )}
              {openInfoId === s.id && (
                <div className="absolute right-2 top-full mt-1 bg-slate-900 text-white text-xs rounded px-3 py-2 shadow-lg z-10 whitespace-nowrap">
                  {t('registered')}: {formatRegistered(s.created_at)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatRegistered(iso: string): string {
  const d = new Date(iso);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}
