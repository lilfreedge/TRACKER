import { useEffect, useState } from 'react';
// used by ClubSquad below
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import Loading from '../components/Loading';
import InjuriesSection from '../components/InjuriesSection';
import TransfersSection from '../components/TransfersSection';
import ExPlayersSection from '../components/ExPlayersSection';
import GallerySection from '../components/GallerySection';
import SummarySection from '../components/SummarySection';
import SquadAddPanel from '../components/SquadAddPanel';
import { flagFor, niceName } from '../lib/countries';
import type { Season, SquadPlayer, SquadRole, NationalSquadEntry } from '../types/database';
type Tab = 'club' | 'international' | 'injuries' | 'transfers' | 'ex_players' | 'gallery' | 'summary';
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
  const [prevSnapshot, setPrevSnapshot] = useState<Map<string, SquadPlayer>>(new Map());
  async function load() {
    if (!seasonId) return;
    setLoading(true);
    const [{ data: se }, { data: sq }, { data: ns }] = await Promise.all([
      supabase.from('seasons').select('*').eq('id', seasonId).single(),
      supabase.from('squad_players').select('*').eq('season_id', seasonId).order('formation_slot', { ascending: true, nullsFirst: false }),
      supabase.from('national_squad').select('*').eq('season_id', seasonId).order('role', { ascending: true }),
    ]);
    setSeason(se); setPlayers(sq ?? []); setNational(ns ?? []); setLoading(false);
    // Fetch neighbor seasons + previous season snapshot for highlight diffs
    if (se?.save_id) {
      const { data: all } = await supabase.from('seasons').select('id, label').eq('save_id', se.save_id).order('label', { ascending: true });
      if (all) {
        const idx = all.findIndex((s) => s.id === seasonId);
        const prevId = idx > 0 ? all[idx - 1].id : null;
        const nextId = idx >= 0 && idx < all.length - 1 ? all[idx + 1].id : null;
        setNeighbors({ prev: prevId, next: nextId });
        if (prevId) {
          const { data: prevSq } = await supabase.from('squad_players').select('*').eq('season_id', prevId);
          const map = new Map<string, SquadPlayer>();
          for (const p of (prevSq ?? []) as SquadPlayer[]) map.set(p.name_snapshot.toLowerCase(), p);
          setPrevSnapshot(map);
        } else {
          setPrevSnapshot(new Map());
        }
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
  const bannerSince = tab === 'international' && hasIntl ? season.national_team_since_year : season.club_since_year;
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
          <div className="text-sm opacity-80">{season.label}</div>
          <div className="text-2xl font-bold mt-1 flex items-center gap-3 flex-wrap">
            <span>{bannerTitle ?? '—'}</span>
            {bannerSince && <span className="text-sm opacity-80 font-normal">· {t('since')} {bannerSince}</span>}
          </div>
        </div>
        <button onClick={() => neighbors.next && navigate(`/season/${neighbors.next}`)} disabled={!neighbors.next} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition" title="Next season">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </div>
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 mb-4 overflow-x-auto">
        {[['club', t('club_squad'), false] as const, ['international', t('international_squad'), !hasIntl] as const, ['injuries', t('injuries'), false] as const, ['transfers', t('transfers'), false] as const, ['ex_players', t('ex_players'), false] as const, ['gallery', 'Gallery', false] as const, ['summary', 'Summary', false] as const].map(([k, label, dis]) => (
          <button key={k} onClick={() => !dis && setTab(k)} disabled={dis} title={dis ? t('no_intl') : ''}
            className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition ${dis ? 'border-transparent text-slate-300 dark:text-slate-700 cursor-not-allowed' : tab === k ? 'border-emerald-600 text-slate-900 dark:text-slate-100 font-medium' : 'border-transparent text-slate-500 dark:text-slate-400'}`}>{label}</button>
        ))}
      </div>
      {tab === 'club' && (
        <>
          <SquadAddPanel seasonId={season.id} saveId={season.save_id} onReload={load} />
          <ClubSquad t={t} grouped={grouped} players={players} prevSnapshot={prevSnapshot} onPlayerClick={(id) => navigate(`/player/${id}`)} onReload={load} />
        </>
      )}
      {tab === 'international' && <InternationalSquad t={t} entries={national} country={season.national_team ?? '?'} />}
      {tab === 'injuries' && <InjuriesSection seasonId={season.id} />}
      {tab === 'transfers' && <TransfersSection seasonId={season.id} />}
      {tab === 'ex_players' && <ExPlayersSection seasonId={season.id} />}
      {tab === 'gallery' && <GallerySection seasonId={season.id} />}
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
const ROLE_RANK: Record<SquadRole, number> = { starting: 4, bench: 3, reserve: 2, loaned: 1 };
function computeHighlight(p: SquadPlayer, prev: SquadPlayer | undefined): 'up' | 'down' | null {
  if (!prev) return 'up'; // new signing
  if ((p.ovr ?? 0) > (prev.ovr ?? 0)) return 'up';
  if ((p.ovr ?? 0) < (prev.ovr ?? 0)) return 'down';
  if (p.jersey != null && prev.jersey != null && p.jersey !== prev.jersey) return 'up';
  const cur = ROLE_RANK[p.role] ?? 0;
  const old = ROLE_RANK[prev.role] ?? 0;
  if (cur > old) return 'up';
  if (cur < old) return 'down';
  return null;
}
function ClubSquad({ t, grouped, players, prevSnapshot, onPlayerClick, onReload }: { t: any; grouped: Record<SquadRole, SquadPlayer[]>; players: SquadPlayer[]; prevSnapshot: Map<string, SquadPlayer>; onPlayerClick: (id: string) => void; onReload: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  async function delPlayer(id: string) { if (!confirm('Delete player?')) return; await supabase.from('squad_players').delete().eq('id', id); onReload(); }
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
                <tr><th className="text-left px-3 py-2 w-10">{t('th_num')}</th><th className="text-left px-3 py-2 w-16">{t('th_pos')}</th><th className="text-left px-3 py-2">{t('th_name')}</th><th className="text-right px-3 py-2 w-14">{t('th_age')}</th><th className="text-right px-3 py-2 w-14">{t('th_ovr')}</th><th className="text-left px-3 py-2 w-28">{t('th_nat')}</th><th className="text-right px-3 py-2 w-16">{t('th_since')}</th><th className="w-16"></th></tr>
              </thead>
              <tbody>
                {grouped[role].length === 0 ? (<tr><td colSpan={8} className="text-center text-slate-400 py-6">{t('no_players')}</td></tr>) : grouped[role].map((p) => {
                  if (editingId === p.id) return <InlineEditRow key={p.id} p={p} onSaved={() => { setEditingId(null); onReload(); }} onCancel={() => setEditingId(null)} onDelete={() => { setEditingId(null); delPlayer(p.id); }} />;
                  const hi = computeHighlight(p, prevSnapshot.get(p.name_snapshot.toLowerCase()));
                  const rowBg = hi === 'up' ? 'bg-emerald-50/70 dark:bg-emerald-900/20' : hi === 'down' ? 'bg-red-50/70 dark:bg-red-900/20' : '';
                  return (
                    <tr key={p.id} className={`group border-t border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 ${rowBg}`}>
                      <td className="px-3 py-2 text-slate-500 cursor-pointer" onClick={() => onPlayerClick(p.id)}>{p.jersey ?? '?'}</td>
                      <td className="px-3 py-2 font-mono cursor-pointer" onClick={() => onPlayerClick(p.id)}>{p.position ?? '?'}</td>
                      <td className="px-3 py-2 flex items-center gap-2 cursor-pointer" onClick={() => onPlayerClick(p.id)}>{p.photo_url ? (<img src={p.photo_url} alt="" className="w-6 h-6 rounded-full object-cover" />) : (<div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] text-slate-500">?</div>)}<span>{p.name_snapshot}</span></td>
                      <td className="px-3 py-2 text-right cursor-pointer" onClick={() => onPlayerClick(p.id)}>{p.age ?? '?'}</td>
                      <td className="px-3 py-2 text-right font-semibold cursor-pointer" onClick={() => onPlayerClick(p.id)}>{p.ovr ?? '?'}</td>
                      <td className="px-3 py-2 cursor-pointer" onClick={() => onPlayerClick(p.id)}>{p.nationality_snapshot ? (<span className="flex items-center gap-1"><span className="text-base">{flagFor(p.nationality_snapshot)}</span><span>{niceName(p.nationality_snapshot)}</span></span>) : '?'}</td>
                      <td className="px-3 py-2 text-right text-slate-500 cursor-pointer" onClick={() => onPlayerClick(p.id)}>{p.since_year ?? '?'}</td>
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
