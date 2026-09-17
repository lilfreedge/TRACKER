import { useEffect, useState } from 'react';
// used by ClubSquad below
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import Loading from '../components/Loading';
import InjuriesSection from '../components/InjuriesSection';
import TransfersSection from '../components/TransfersSection';
import ExPlayersSection from '../components/ExPlayersSection';
import SummarySection from '../components/SummarySection';
import SquadAddPanel from '../components/SquadAddPanel';
import { flagFor, niceName } from '../lib/countries';
import type { Season, SquadPlayer, SquadRole, NationalSquadEntry } from '../types/database';
type Tab = 'club' | 'international' | 'hub' | 'injuries' | 'transfers' | 'ex_players' | 'gallery' | 'summary';
const ROLE_ORDER: SquadRole[] = ['starting', 'bench', 'reserve', 'loaned'];
export default function SeasonPage() {
  const { seasonId } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const [season, setSeason] = useState<Season | null>(null);
  const [players, setPlayers] = useState<SquadPlayer[]>([]);
  const [national, setNational] = useState<NationalSquadEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('club');
  const [neighbors, setNeighbors] = useState<{ prev: string | null; next: string | null }>({ prev: null, next: null });
  async function load() {
    if (!seasonId) return;
    setLoading(true);
    const [{ data: se }, { data: sq }, { data: ns }] = await Promise.all([
      supabase.from('seasons').select('*').eq('id', seasonId).single(),
      supabase.from('squad_players').select('*').eq('season_id', seasonId).order('formation_slot', { ascending: true, nullsFirst: false }),
      supabase.from('national_squad').select('*').eq('season_id', seasonId).order('role', { ascending: true }),
    ]);
    setSeason(se); setPlayers(sq ?? []); setNational(ns ?? []);
    // Auto-sync: if the current season has no national_team but there's an
    // active international contract on this save, populate it now.
    if (se && se.is_current && !se.national_team) {
      const { data: intlContract } = await supabase.from('contracts').select('team_name, team_color, signed_year, signed_month').eq('save_id', se.save_id).eq('contract_type', 'international').is('ended_year', null).order('signed_year', { ascending: false }).limit(1).maybeSingle();
      if (intlContract) {
        const payload: any = { national_team: intlContract.team_name, national_team_color: intlContract.team_color, national_team_since_year: intlContract.signed_year, national_since_month: intlContract.signed_month };
        await supabase.from('seasons').update(payload).eq('id', se.id);
        setSeason({ ...se, ...payload });
      }
    }
    setLoading(false);
    // Fetch neighbor seasons + previous season snapshot for highlight diffs
    if (se?.save_id) {
      const { data: all } = await supabase.from('seasons').select('id, label').eq('save_id', se.save_id).order('label', { ascending: true });
      if (all) {
        const idx = all.findIndex((s) => s.id === seasonId);
        const prevId = idx > 0 ? all[idx - 1].id : null;
        const nextId = idx >= 0 && idx < all.length - 1 ? all[idx + 1].id : null;
        setNeighbors({ prev: prevId, next: nextId });
      }
    }
  }
  useEffect(() => { load(); }, [seasonId]);
  if (loading) return <Loading />;
  if (!season) return <div className="text-slate-500">Season not found.</div>;
  const grouped: Record<SquadRole, SquadPlayer[]> = { starting: [], bench: [], reserve: [], loaned: [] };
  for (const p of players) grouped[p.role].push(p);
  const hasIntl = !!season.national_team;
  const bannerBg = tab === 'international' && hasIntl ? (season.national_team_color || '#1e293b') : (season.team_color || '#1e293b');
  const bannerText = tab === 'international' && hasIntl ? (season.national_team_text_color || '#fff') : (season.team_text_color || '#fff');
  const bannerTitle = tab === 'international' && hasIntl ? season.national_team : season.team_name_snapshot;
  const bannerSinceYear = tab === 'international' && hasIntl ? season.national_team_since_year : season.club_since_year;
  const bannerSinceMonth = tab === 'international' && hasIntl ? season.national_since_month : (season as any).club_since_month;
  const MONTHS_TITLE = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const bannerSince = bannerSinceYear ? `${bannerSinceMonth ? MONTHS_TITLE[bannerSinceMonth - 1] + ' ' : ''}${bannerSinceYear}` : null;
  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link to={`/save/${season.save_id}`} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm">{t('back_save')}</Link>
        <div className="flex gap-1 text-xs">
          {[['Career', `/save/${season.save_id}/career`], ['Competition', `/save/${season.save_id}/competition`], ['Rivals', `/save/${season.save_id}/rivals`]].map(([lbl, to]) => (
            <Link key={to} to={to} className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 rounded-full px-3 py-1 transition bg-white dark:bg-slate-900">{lbl}</Link>
          ))}
        </div>
      </div>
      <div className="mt-3 rounded-lg p-5 mb-4 flex items-center gap-3" style={{ background: bannerBg, color: bannerText }}>
        <button onClick={() => neighbors.prev && navigate(`/season/${neighbors.prev}`)} disabled={!neighbors.prev} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition" title="Previous season">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <div className="flex-1">
          <div className="text-3xl font-bold flex items-center gap-3 flex-wrap">
            <span>{season.label}</span>
          </div>
          <div className="text-sm opacity-90 mt-1 flex items-center gap-2 flex-wrap">
            <span className="font-medium">{bannerTitle ?? '—'}</span>
            {bannerSince && <span className="opacity-80">· {t('since')} {bannerSince}</span>}
          </div>
        </div>
        <button onClick={() => neighbors.next && navigate(`/season/${neighbors.next}`)} disabled={!neighbors.next} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition" title="Next season">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </div>
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 mb-4 overflow-x-auto">
        {[['club', t('club_squad'), false] as const, ['international', t('international_squad'), !hasIntl] as const, ['hub', 'Squad Hub', false] as const, ['injuries', t('injuries'), false] as const, ['transfers', t('transfers'), false] as const, ['ex_players', t('ex_players'), false] as const, ['summary', 'Summary', false] as const].map(([k, label, dis]) => (
          <button key={k} onClick={() => !dis && setTab(k)} disabled={dis} title={dis ? t('no_intl') : ''}
            className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition ${dis ? 'border-transparent text-slate-300 dark:text-slate-700 cursor-not-allowed' : tab === k ? 'border-emerald-600 text-slate-900 dark:text-slate-100 font-medium' : 'border-transparent text-slate-500 dark:text-slate-400'}`}>{label}</button>
        ))}
      </div>
      {tab === 'club' && (
        <>
          <SquadAddPanel seasonId={season.id} saveId={season.save_id} onReload={load} />
          <ClubSquad t={t} grouped={grouped} players={players} onPlayerClick={(id) => navigate(`/player/${id}`)} onReload={load} />
        </>
      )}
      {tab === 'international' && <InternationalSquad t={t} entries={national} country={season.national_team ?? '?'} />}
      {tab === 'hub' && <SquadHub t={t} players={players} onPlayerClick={(id) => navigate(`/player/${id}`)} />}
      {tab === 'injuries' && <InjuriesSection seasonId={season.id} />}
      {tab === 'transfers' && <TransfersSection seasonId={season.id} />}
      {tab === 'ex_players' && <ExPlayersSection seasonId={season.id} />}
      {tab === 'summary' && <SummarySection seasonId={season.id} />}
    </div>
  );
}
const POSITIONS = ['GK','CB','LB','RB','LWB','RWB','CDM','CM','CAM','LM','RM','LW','RW','ST','CF','LF','RF'];
function InlineEditRow({ p, onSaved, onCancel, onDelete }: { p: SquadPlayer; onSaved: () => void; onCancel: () => void; onDelete: () => void }) {
  const [jersey, setJersey] = useState(p.jersey?.toString() ?? '');
  const [pos, setPos] = useState(p.position ?? '');
  const [name, setName] = useState(p.name_snapshot);
  const [age, setAge] = useState(p.age?.toString() ?? '');
  const [ovr, setOvr] = useState(p.ovr?.toString() ?? '');
  const [nat, setNat] = useState(p.nationality_snapshot ?? '');
  const [since, setSince] = useState(p.since_year?.toString() ?? '');
  const [role, setRole] = useState<SquadRole>(p.role);
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    // Enforce max 11 in Starting XI when moving into 'starting' from another role
    if (role === 'starting' && p.role !== 'starting') {
      const { count } = await supabase.from('squad_players').select('*', { count: 'exact', head: true }).eq('season_id', p.season_id).eq('role', 'starting');
      if ((count ?? 0) >= 11) { alert('Starting XI is full (11 players). Move someone else out first.'); setBusy(false); return; }
    }
    const payload: any = { name_snapshot: name.trim(), jersey: jersey ? Number(jersey) : null, position: pos || null, age: age ? Number(age) : null, ovr: ovr ? Number(ovr) : null, nationality_snapshot: nat || null, since_year: since ? Number(since) : null, role };
    const { error } = await supabase.from('squad_players').update(payload).eq('id', p.id);
    setBusy(false);
    if (error) { alert(error.message); return; }
    onSaved();
  }
  return (
    <tr className="border-t border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20">
      <td className="px-1 py-1"><input value={jersey} onChange={(e) => setJersey(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1 py-0.5 text-xs" /></td>
      <td className="px-1 py-1"><select value={pos} onChange={(e) => setPos(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1 py-0.5 text-xs"><option value="">?</option>{POSITIONS.map((x) => <option key={x}>{x}</option>)}</select></td>
      <td className="px-1 py-1"><input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1 py-0.5 text-xs" /></td>
      <td className="px-1 py-1"><input value={age} onChange={(e) => setAge(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1 py-0.5 text-xs text-right" /></td>
      <td className="px-1 py-1"><input value={ovr} onChange={(e) => setOvr(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1 py-0.5 text-xs text-right" /></td>
      <td className="px-1 py-1"><input value={nat} onChange={(e) => setNat(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1 py-0.5 text-xs" /></td>
      <td className="px-1 py-1"><input value={since} onChange={(e) => setSince(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1 py-0.5 text-xs text-right" /></td>
      <td className="px-1 py-1 whitespace-nowrap">
        <select value={role} onChange={(e) => setRole(e.target.value as SquadRole)} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1 py-0.5 text-[10px]">
          <option value="starting">start</option><option value="bench">bench</option><option value="reserve">reserve</option><option value="loaned">loaned</option>
        </select>
        <button onClick={save} disabled={busy} className="ml-1 text-emerald-600 hover:text-emerald-500 text-sm" title="Save">✓</button>
        <button onClick={onCancel} className="ml-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm" title="Cancel">✕</button>
        <button onClick={onDelete} className="ml-1 text-red-400 hover:text-red-600 text-sm" title="Delete">🗑</button>
      </td>
    </tr>
  );
}
type SortKey = 'jersey' | 'position' | 'name_snapshot' | 'age' | 'ovr' | 'nationality_snapshot' | 'since_year' | 'formation';
// 4-1-4-1 tactical order (top → bottom of the pitch)
const FORMATION_RANK: Record<string, number> = { ST: 1, CF: 1, LF: 1, RF: 1, LW: 2, LM: 2, RW: 3, RM: 3, CM: 4, CAM: 4, CDM: 6, LB: 7, LWB: 7, CB: 8, RB: 10, RWB: 10, GK: 11 };
function formationRank(pos: string | null): number { if (!pos) return 99; return FORMATION_RANK[pos] ?? 99; }
function ClubSquad({ t, grouped, players, onPlayerClick, onReload }: { t: any; grouped: Record<SquadRole, SquadPlayer[]>; players: SquadPlayer[]; onPlayerClick: (id: string) => void; onReload: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('jersey');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(k); setSortDir('asc'); }
  }
  function sortRows(rows: SquadPlayer[], role: SquadRole): SquadPlayer[] {
    const sign = sortDir === 'asc' ? 1 : -1;
    // Formation sort only applies to Starting XI; other roles fall back to jersey ASC
    if (sortKey === 'formation') {
      if (role !== 'starting') return [...rows].sort((a, b) => ((a.jersey ?? 99) - (b.jersey ?? 99)));
      return [...rows].sort((a, b) => (formationRank(a.position) - formationRank(b.position)) * sign);
    }
    return [...rows].sort((a: any, b: any) => {
      const av = a[sortKey]; const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sign;
      return String(av).localeCompare(String(bv)) * sign;
    });
  }
  const arrow = (k: SortKey) => sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';
  async function delPlayer(id: string) {
    if (!confirm('Remove player from squad? Will be recorded in Ex-players.')) return;
    const { data: p } = await supabase.from('squad_players').select('*').eq('id', id).maybeSingle();
    if (p) {
      await supabase.from('ex_players').insert({ season_id: p.season_id, player_name: p.name_snapshot, position: p.position, ovr: p.ovr, year_gone: new Date().getFullYear() });
    }
    await supabase.from('squad_players').delete().eq('id', id);
    onReload();
  }
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const missing = players.filter((p) => !p.photo_url);
  async function fetchAll() {
    if (missing.length === 0) return;
    setBusy(true);
    let ok = 0;
    for (let i = 0; i < missing.length; i++) {
      const p = missing[i];
      setProgress(`${i + 1}/${missing.length} · ${p.name_snapshot}`);
      try {
        const res = await fetch(`/api/fetch-photo?name=${encodeURIComponent(p.name_snapshot)}`);
        if (res.ok) {
          const j = await res.json();
          if (j?.url) { await supabase.from('squad_players').update({ photo_url: j.url }).eq('id', p.id); ok++; }
        }
      } catch {}
    }
    setBusy(false); setProgress(ok > 0 ? `${ok} fotos actualizadas` : ''); if (ok > 0) onReload();
  }
  // Auto-fetch on first render when there are missing photos. Guard with a
  // per-session marker so re-mounting doesn't re-trigger unnecessarily.
  useEffect(() => {
    if (missing.length === 0 || busy) return;
    const key = 'autoFetch:' + missing.map((p) => p.id).sort().join(',');
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missing.length]);
  return (
    <>
      {missing.length > 0 && (
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <button onClick={fetchAll} disabled={busy} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-3 py-1.5 text-xs font-medium disabled:opacity-50">{busy ? 'Buscando…' : `🔄 Buscar fotos faltantes (${missing.length})`}</button>
          {progress && <span className="text-xs text-slate-500">{progress}</span>}
        </div>
      )}
      {ROLE_ORDER.map((role) => (
        <div key={role} className="mb-6">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">{t(role)} <span className="text-slate-400">({grouped[role].length})</span></div>
          <div className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden bg-white dark:bg-slate-900">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase">
                <tr>
                  <th className="text-left px-3 py-2 w-10 cursor-pointer hover:text-emerald-600" onClick={() => toggleSort('jersey')}>{t('th_num')}{arrow('jersey')}</th>
                  <th className="text-left px-3 py-2 w-16 cursor-pointer hover:text-emerald-600" onClick={() => toggleSort('position')}>{t('th_pos')}{arrow('position')}</th>
                  <th className="text-left px-3 py-2 cursor-pointer hover:text-emerald-600" onClick={() => toggleSort('name_snapshot')}>{t('th_name')}{arrow('name_snapshot')}</th>
                  <th className="text-right px-3 py-2 w-14 cursor-pointer hover:text-emerald-600" onClick={() => toggleSort('age')}>{t('th_age')}{arrow('age')}</th>
                  <th className="text-right px-3 py-2 w-14 cursor-pointer hover:text-emerald-600" onClick={() => toggleSort('ovr')}>{t('th_ovr')}{arrow('ovr')}</th>
                  <th className="text-left px-3 py-2 w-28 cursor-pointer hover:text-emerald-600" onClick={() => toggleSort('nationality_snapshot')}>{t('th_nat')}{arrow('nationality_snapshot')}</th>
                  <th className="text-right px-3 py-2 w-16 cursor-pointer hover:text-emerald-600" onClick={() => toggleSort('since_year')}>{t('th_since')}{arrow('since_year')}</th>
                  <th className="w-16"></th>
                </tr>
              </thead>
              <tbody>
                {grouped[role].length === 0 ? (<tr><td colSpan={8} className="text-center text-slate-400 py-6">{t('no_players')}</td></tr>) : sortRows(grouped[role], role).map((p) => {
                  if (editingId === p.id) return <InlineEditRow key={p.id} p={p} onSaved={() => { setEditingId(null); onReload(); }} onCancel={() => setEditingId(null)} onDelete={() => { setEditingId(null); delPlayer(p.id); }} />;
                  return (
                    <tr key={p.id} className="group border-t border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60">
                      <td className={`px-3 py-2 text-slate-500 cursor-pointer ${p.jersey == null ? 'bg-amber-200 dark:bg-amber-800/40' : ''}`} onClick={() => onPlayerClick(p.id)}>{p.jersey ?? '?'}</td>
                      <td className={`px-3 py-2 font-mono cursor-pointer ${!p.position ? 'bg-amber-200 dark:bg-amber-800/40' : ''}`} onClick={() => onPlayerClick(p.id)}>{p.position ?? '?'}</td>
                      <td className={`px-3 py-2 flex items-center gap-2 cursor-pointer ${!p.name_snapshot ? 'bg-amber-200 dark:bg-amber-800/40' : ''}`} onClick={() => onPlayerClick(p.id)}>{p.photo_url ? (<img src={p.photo_url} alt="" className="w-6 h-6 rounded-full object-cover" />) : (<div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] text-slate-500">?</div>)}<span>{p.name_snapshot}</span></td>
                      <td className={`px-3 py-2 text-right cursor-pointer ${p.age == null ? 'bg-amber-200 dark:bg-amber-800/40' : ''}`} onClick={() => onPlayerClick(p.id)}>{p.age ?? '?'}</td>
                      <td className={`px-3 py-2 text-right font-semibold cursor-pointer ${p.ovr == null ? 'bg-amber-200 dark:bg-amber-800/40' : ''}`} onClick={() => onPlayerClick(p.id)}>{p.ovr ?? '?'}</td>
                      <td className={`px-3 py-2 cursor-pointer ${!p.nationality_snapshot ? 'bg-amber-200 dark:bg-amber-800/40' : ''}`} onClick={() => onPlayerClick(p.id)}>{p.nationality_snapshot ? (<span className="flex items-center gap-1"><span className="text-base">{flagFor(p.nationality_snapshot)}</span><span>{niceName(p.nationality_snapshot)}</span></span>) : '?'}</td>
                      <td className={`px-3 py-2 text-right text-slate-500 cursor-pointer ${p.since_year == null ? 'bg-amber-200 dark:bg-amber-800/40' : ''}`} onClick={() => onPlayerClick(p.id)}>{p.since_year ?? '?'}</td>
                      <td className="px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition text-right">
                        <button onClick={(e) => { e.stopPropagation(); setEditingId(p.id); }} className="text-slate-400 hover:text-emerald-500 text-sm mr-2" title="Edit">✎</button>
                        <button onClick={(e) => { e.stopPropagation(); delPlayer(p.id); }} className="text-slate-400 hover:text-red-500 text-sm" title="Delete">×</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  );
}
const ROLE_LABEL: Record<SquadRole, string> = { starting: 'Starting XI', bench: 'Bench', reserve: 'Reserve', loaned: 'Loaned' };
const ROLE_COLOR: Record<SquadRole, string> = { starting: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', bench: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300', reserve: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300', loaned: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
function SquadHub({ t, players, onPlayerClick }: { t: any; players: SquadPlayer[]; onPlayerClick: (id: string) => void }) {
  const [sk, setSk] = useState<SortKey>('jersey');
  const [sd, setSd] = useState<'asc' | 'desc'>('asc');
  function toggle(k: SortKey) { if (sk === k) setSd((d) => d === 'asc' ? 'desc' : 'asc'); else { setSk(k); setSd('asc'); } }
  const arr = (k: SortKey) => sk === k ? (sd === 'asc' ? ' ↑' : ' ↓') : '';
  const rows = [...players].sort((a: any, b: any) => {
    const sign = sd === 'asc' ? 1 : -1;
    if (sk === 'formation') return (formationRank(a.position) - formationRank(b.position)) * sign;
    const av = a[sk]; const bv = b[sk];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sign;
    return String(av).localeCompare(String(bv)) * sign;
  });
  return (
    <div>
      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Squad hub <span className="text-slate-400">({players.length})</span></div>
      <div className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden bg-white dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase">
            <tr>
              <th className="text-left px-3 py-2 w-10 cursor-pointer hover:text-emerald-600" onClick={() => toggle('jersey')}>#{arr('jersey')}</th>
              <th className="text-left px-3 py-2 w-16 cursor-pointer hover:text-emerald-600" onClick={() => toggle('position')}>POS{arr('position')}</th>
              <th className="text-left px-3 py-2 cursor-pointer hover:text-emerald-600" onClick={() => toggle('name_snapshot')}>NAME{arr('name_snapshot')}</th>
              <th className="text-right px-3 py-2 w-14 cursor-pointer hover:text-emerald-600" onClick={() => toggle('age')}>AGE{arr('age')}</th>
              <th className="text-right px-3 py-2 w-14 cursor-pointer hover:text-emerald-600" onClick={() => toggle('ovr')}>OVR{arr('ovr')}</th>
              <th className="text-left px-3 py-2 w-24">STATUS</th>
              <th className="text-left px-3 py-2 w-28 cursor-pointer hover:text-emerald-600" onClick={() => toggle('nationality_snapshot')}>NAT{arr('nationality_snapshot')}</th>
              <th className="text-right px-3 py-2 w-16 cursor-pointer hover:text-emerald-600" onClick={() => toggle('since_year')}>SINCE{arr('since_year')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (<tr><td colSpan={8} className="text-center text-slate-400 py-6">{t('no_players')}</td></tr>) : rows.map((p) => (
              <tr key={p.id} className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer" onClick={() => onPlayerClick(p.id)}>
                <td className="px-3 py-2 text-slate-500">{p.jersey ?? '?'}</td>
                <td className="px-3 py-2 font-mono">{p.position ?? '?'}</td>
                <td className="px-3 py-2 flex items-center gap-2">{p.photo_url ? <img src={p.photo_url} alt="" className="w-6 h-6 rounded-full object-cover" /> : <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] text-slate-500">?</div>}<span>{p.name_snapshot}</span></td>
                <td className="px-3 py-2 text-right">{p.age ?? '?'}</td>
                <td className="px-3 py-2 text-right font-semibold">{p.ovr ?? '?'}</td>
                <td className="px-3 py-2"><span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${ROLE_COLOR[p.role]}`}>{ROLE_LABEL[p.role]}</span></td>
                <td className="px-3 py-2">{p.nationality_snapshot ? <span className="flex items-center gap-1"><span className="text-base">{flagFor(p.nationality_snapshot)}</span><span>{niceName(p.nationality_snapshot)}</span></span> : '?'}</td>
                <td className="px-3 py-2 text-right text-slate-500">{p.since_year ?? '?'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function InternationalSquad({ t, entries, country }: { t: any; entries: NationalSquadEntry[]; country: string }) {
  if (entries.length === 0) return (<div className="text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded p-8 text-center bg-white dark:bg-slate-900">{t('no_intl')}</div>);
  return (
    <div className="mb-6">
      <div className="text-xs font-semibold text-slate-500 uppercase mb-2">{flagFor(country)} {country} <span className="text-slate-400">({entries.length})</span></div>
      <div className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden bg-white dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs uppercase">
            <tr><th className="text-left px-3 py-2 w-10">{t('th_num')}</th><th className="text-left px-3 py-2 w-16">{t('th_pos')}</th><th className="text-left px-3 py-2">{t('th_name')}</th><th className="text-left px-3 py-2">Club</th><th className="text-right px-3 py-2 w-14">{t('th_age')}</th><th className="text-right px-3 py-2 w-14">{t('th_ovr')}</th></tr>
          </thead>
          <tbody>{entries.map((e) => (<tr key={e.id} className="border-t border-slate-200 dark:border-slate-800"><td className="px-3 py-2 text-slate-500">{e.jersey ?? '?'}</td><td className="px-3 py-2 font-mono">{e.position ?? '?'}</td><td className="px-3 py-2">{e.player_name}</td><td className="px-3 py-2 text-slate-600 dark:text-slate-300">{e.club ?? '?'}</td><td className="px-3 py-2 text-right">{e.age ?? '?'}</td><td className="px-3 py-2 text-right font-semibold">{e.ovr ?? '?'}</td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}
