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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [eLabel, setELabel] = useState('');
  const [eIsCurrent, setEIsCurrent] = useState(false);
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
  }
  useEffect(() => { load(); }, [saveId]);

  async function createSeason() {
    if (!saveId) return;
    // Find the active club contract (most recent). International contracts
    // don't spawn a new season on their own — they merge into the current one.
    const { data: contracts } = await supabase.from('contracts').select('*').eq('save_id', saveId).order('signed_year', { ascending: false });
    const contract = contracts?.find((c: any) => (c.contract_type ?? 'club') === 'club');
    if (!contract) { alert('You need an active club contract first. Go to Contracts and create one.'); return; }

    // Determine the next season's start year: max end year across existing seasons, or contract signed_year
    let nextYear = contract.signed_year ?? new Date().getFullYear();
    for (const s of seasons) {
      const m = /Season\s+(\d{4})-(\d{4})|^(\d{4})-(\d{4})$/.exec(s.label);
      if (m) { const end = Number(m[2] ?? m[4]); if (end > nextYear) nextYear = end; }
    }
    const label = `Season ${nextYear}-${nextYear + 1}`;
    // Guard against duplicates
    if (seasons.some((s) => s.label === label)) { alert(`${label} already exists.`); return; }

    const insertPayload: any = {
      save_id: saveId,
      label,
      team_id: contract.team_catalog_id ?? null,
      team_name_snapshot: contract.team_name,
      team_color: contract.team_color,
      club_since_year: contract.signed_year,
      contract_id: contract.id,
      is_current: true,
    };
    const { data: newSeason, error } = await supabase.from('seasons').insert(insertPayload).select().maybeSingle();
    if (error || !newSeason) { alert('Error: ' + (error?.message ?? 'insert failed')); return; }
    // Unmark other current seasons
    await supabase.from('seasons').update({ is_current: false }).eq('save_id', saveId).neq('id', newSeason.id);

    // Copy previous season's squad (age +1) so the user can edit right away
    const prev = [...seasons].sort((a, b) => (a.label > b.label ? -1 : 1))[0];
    if (prev) {
      const { data: prevSq } = await supabase.from('squad_players').select('*').eq('season_id', prev.id);
      if (prevSq?.length) {
        const rows = prevSq.map((p: any) => ({ season_id: newSeason.id, name_snapshot: p.name_snapshot, jersey: p.jersey, position: p.position, age: p.age != null ? p.age + 1 : null, ovr: p.ovr, nationality_snapshot: p.nationality_snapshot, since_year: p.since_year, role: p.role, photo_url: p.photo_url, player_id: p.player_id, formation_slot: p.formation_slot }));
        await supabase.from('squad_players').insert(rows);
      }
    }

    load();
    navigate(`/season/${newSeason.id}`);
  }

  function startEdit(s: Season) {
    setEditingId(s.id);
    setELabel(s.label);
    setEIsCurrent(!!s.is_current);
  }
  function cancelEdit() { setEditingId(null); }
  async function saveEdit() {
    if (!editingId) return;
    const payload: any = {
      label: eLabel.trim(),
      is_current: eIsCurrent,
    };
    // If setting current, unset current on the other seasons of this save
    if (eIsCurrent && saveId) {
      await supabase.from('seasons').update({ is_current: false }).eq('save_id', saveId).neq('id', editingId);
    }
    const { error } = await supabase.from('seasons').update(payload).eq('id', editingId);
    if (error) { alert('Error: ' + error.message); return; }
    setEditingId(null); load();
  }
  async function deleteSeason(s: Season) {
    if (!confirm(`Delete season "${s.label}"?`)) return;
    await supabase.from('seasons').delete().eq('id', s.id); load();
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
    career:      { title: 'Whole Career', icon: CareerIcon, accent: 'from-blue-500/10 to-blue-500/5 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300', onClick: () => navigate(`/save/${saveId}/career`) },
    current:     { title: t('current_season'), icon: CurrentSeasonIcon, accent: 'from-emerald-500/10 to-emerald-500/5 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300', onClick: () => current && navigate(`/season/${current.id}`), disabled: !current, subtitle: current ? `${current.label} · ${current.team_name_snapshot ?? ''}` : undefined },
    competition: { title: 'Competitions', icon: CompetitionIcon, accent: 'from-amber-500/10 to-amber-500/5 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300', onClick: () => navigate(`/save/${saveId}/competition`) },
    rivals:      { title: t('rivals'), icon: RivalsIcon, accent: 'from-rose-500/10 to-rose-500/5 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300', onClick: () => navigate(`/save/${saveId}/rivals`) },
  };

  return (
    <div>
      <Link to={`/game/${encodeURIComponent(save.game_edition ?? '')}`} className="text-emerald-600 text-xs uppercase font-semibold tracking-wide flex items-center gap-1 hover:text-emerald-500">← {save.game_edition ?? '—'}</Link>
      <div className="mt-1 mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 text-center">
          <h1 className="text-3xl font-bold">{save.name}</h1>
          <p className="text-slate-500 text-sm mt-1">{seasons.length} {t('seasons')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/save/${saveId}/contracts`)} className="border border-slate-300 dark:border-slate-700 hover:border-emerald-400 rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 transition">
            <ContractIcon width={16} height={16} /> Contracts
          </button>
          <button onClick={createSeason} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 transition">
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
              className={`text-left rounded-2xl p-4 border-2 bg-gradient-to-br ${tile.accent} hover:rounded-3xl hover:shadow-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:rounded-2xl`}>
              <Icon width={22} height={22} />
              <div className="mt-3 font-semibold text-slate-900 dark:text-slate-100">{tile.title}</div>
              {tile.subtitle && <div className="text-xs mt-1 opacity-75">{tile.subtitle}</div>}
            </button>
          );
        })}
      </div>

      {/* Sub-nav */}
      <div className="flex flex-wrap gap-2 mb-6 text-xs">
        {[['Compare', `/save/${saveId}/compare`]].map(([lbl, to]) => (
          <Link key={to} to={to} className="text-slate-500 hover:text-emerald-600 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1 transition">{lbl}</Link>
        ))}
      </div>


      {/* Search seasons */}
      <div className="relative mb-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search seasons…" className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm" />
        <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
      </div>

      {filtered.length === 0 ? (
        <div className="text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded p-8 text-center bg-white dark:bg-slate-900">{q ? 'No matches.' : 'No seasons yet.'}</div>
      ) : (() => {
        const currentList = filtered.filter((s) => s.is_current);
        const previousList = filtered.filter((s) => !s.is_current);
        const renderCard = (s: Season) => editingId === s.id ? (
            <div key={s.id} className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-lg p-4 grid gap-2">
              <input value={eLabel} onChange={(e) => setELabel(e.target.value)} placeholder="Label" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input type="checkbox" checked={eIsCurrent} onChange={(e) => setEIsCurrent(e.target.checked)} /> Mark as current season
              </label>
              <div className="flex justify-between gap-2">
                <button onClick={() => deleteSeason(s)} className="text-xs text-red-500 hover:text-red-400">Delete season</button>
                <div className="flex gap-2"><button onClick={cancelEdit} className="text-sm px-3 py-2 text-slate-500">Cancel</button><button onClick={saveEdit} className="bg-emerald-600 text-white rounded px-4 py-2 text-sm">Save</button></div>
              </div>
            </div>
          ) : (
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
                    {s.national_team && <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded">🌍 {s.national_team}</span>}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">
                    {s.team_name_snapshot ? <span className="font-medium text-slate-700 dark:text-slate-300">{s.team_name_snapshot}</span> : <span>—</span>}
                    {s.club_since_year && <span> · since {s.club_since_year}</span>}
                  </div>
                </div>
                <svg className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </Link>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); startEdit(s); }} className="px-2 text-slate-400 hover:text-emerald-500 text-sm" title="Edit season">✎</button>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteSeason(s); }} className="px-3 text-slate-400 hover:text-red-500 text-lg" title="Delete season">×</button>
            </div>
          );
        return (
          <div className="grid gap-6">
            <div>
              <div className="text-xs uppercase tracking-wide text-emerald-600 font-semibold mb-2">🟢 Current {currentList.length > 0 && <span className="text-slate-400 font-normal">({currentList.length})</span>}</div>
              {currentList.length === 0 ? (
                <div className="text-slate-400 text-xs italic border border-dashed border-slate-200 dark:border-slate-800 rounded p-3 bg-white dark:bg-slate-900">No current season.</div>
              ) : (
                <div className="grid gap-2">{currentList.map(renderCard)}</div>
              )}
            </div>
            {previousList.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">📁 Previous <span className="text-slate-400 font-normal">({previousList.length})</span></div>
                <div className="grid gap-2">{previousList.map(renderCard)}</div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
