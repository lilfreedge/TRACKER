import { useEffect, useState } from 'react';
// used by ClubSquad below
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import Loading from '../components/Loading';
import InjuriesSection from '../components/InjuriesSection';
import TransfersSection from '../components/TransfersSection';
import ExPlayersSection from '../components/ExPlayersSection';
import ObjectivesSection from '../components/ObjectivesSection';
import GallerySection from '../components/GallerySection';
import SummarySection from '../components/SummarySection';
import { flagFor, niceName } from '../lib/countries';
import type { Season, SquadPlayer, SquadRole, NationalSquadEntry } from '../types/database';
type Tab = 'club' | 'international' | 'injuries' | 'transfers' | 'ex_players' | 'objectives' | 'gallery' | 'summary';
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
  async function load() {
    if (!seasonId) return;
    setLoading(true);
    const [{ data: se }, { data: sq }, { data: ns }] = await Promise.all([
      supabase.from('seasons').select('*').eq('id', seasonId).single(),
      supabase.from('squad_players').select('*').eq('season_id', seasonId).order('formation_slot', { ascending: true, nullsFirst: false }),
      supabase.from('national_squad').select('*').eq('season_id', seasonId).order('role', { ascending: true }),
    ]);
    setSeason(se); setPlayers(sq ?? []); setNational(ns ?? []); setLoading(false);
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
      <div className="mt-3 rounded-lg p-5 mb-4" style={{ background: bannerBg, color: bannerText }}>
        <div className="text-sm opacity-80">{season.label}</div>
        <div className="text-2xl font-bold mt-1 flex items-center gap-3 flex-wrap">
          <span>{bannerTitle ?? '—'}</span>
          {bannerSince && <span className="text-sm opacity-80 font-normal">· {t('since')} {bannerSince}</span>}
        </div>
      </div>
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 mb-4 overflow-x-auto">
        {[['club', t('club_squad'), false] as const, ['international', t('international_squad'), !hasIntl] as const, ['injuries', t('injuries'), false] as const, ['transfers', t('transfers'), false] as const, ['ex_players', t('ex_players'), false] as const, ['objectives', 'Objectives', false] as const, ['gallery', 'Gallery', false] as const, ['summary', 'Summary', false] as const].map(([k, label, dis]) => (
          <button key={k} onClick={() => !dis && setTab(k)} disabled={dis} title={dis ? t('no_intl') : ''}
            className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition ${dis ? 'border-transparent text-slate-300 dark:text-slate-700 cursor-not-allowed' : tab === k ? 'border-emerald-600 text-slate-900 dark:text-slate-100 font-medium' : 'border-transparent text-slate-500 dark:text-slate-400'}`}>{label}</button>
        ))}
      </div>
      {tab === 'club' && <ClubSquad t={t} grouped={grouped} players={players} onPlayerClick={(id) => navigate(`/player/${id}`)} onReload={load} />}
      {tab === 'international' && <InternationalSquad t={t} entries={national} country={season.national_team ?? '?'} />}
      {tab === 'injuries' && <InjuriesSection seasonId={season.id} />}
      {tab === 'transfers' && <TransfersSection seasonId={season.id} />}
      {tab === 'ex_players' && <ExPlayersSection seasonId={season.id} />}
      {tab === 'objectives' && <ObjectivesSection seasonId={season.id} />}
      {tab === 'gallery' && <GallerySection seasonId={season.id} />}
      {tab === 'summary' && <SummarySection seasonId={season.id} />}
    </div>
  );
}
function ClubSquad({ t, grouped, players, onPlayerClick, onReload }: { t: any; grouped: Record<SquadRole, SquadPlayer[]>; players: SquadPlayer[]; onPlayerClick: (id: string) => void; onReload: () => void }) {
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
                <tr><th className="text-left px-3 py-2 w-10">{t('th_num')}</th><th className="text-left px-3 py-2 w-16">{t('th_pos')}</th><th className="text-left px-3 py-2">{t('th_name')}</th><th className="text-right px-3 py-2 w-14">{t('th_age')}</th><th className="text-right px-3 py-2 w-14">{t('th_ovr')}</th><th className="text-left px-3 py-2 w-28">{t('th_nat')}</th><th className="text-right px-3 py-2 w-16">{t('th_since')}</th></tr>
              </thead>
              <tbody>
                {grouped[role].length === 0 ? (<tr><td colSpan={7} className="text-center text-slate-400 py-6">{t('no_players')}</td></tr>) : grouped[role].map((p) => (
                  <tr key={p.id} onClick={() => onPlayerClick(p.id)} className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
                    <td className="px-3 py-2 text-slate-500">{p.jersey ?? '?'}</td>
                    <td className="px-3 py-2 font-mono">{p.position ?? '?'}</td>
                    <td className="px-3 py-2 flex items-center gap-2">{p.photo_url ? (<img src={p.photo_url} alt="" className="w-6 h-6 rounded-full object-cover" />) : (<div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] text-slate-500">?</div>)}<span>{p.name_snapshot}</span></td>
                    <td className="px-3 py-2 text-right">{p.age ?? '?'}</td>
                    <td className="px-3 py-2 text-right font-semibold">{p.ovr ?? '?'}</td>
                    <td className="px-3 py-2">{p.nationality_snapshot ? (<span className="flex items-center gap-1"><span className="text-base">{flagFor(p.nationality_snapshot)}</span><span>{niceName(p.nationality_snapshot)}</span></span>) : '?'}</td>
                    <td className="px-3 py-2 text-right text-slate-500">{p.since_year ?? '?'}</td>
                  </tr>
                ))}
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
