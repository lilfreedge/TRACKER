import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import Loading from '../components/Loading';
import type { Season, SquadPlayer, SquadRole, NationalSquadEntry } from '../types/database';

type Tab = 'club' | 'international';

const ROLE_ORDER: SquadRole[] = ['starting', 'bench', 'reserve', 'loaned'];

export default function SeasonPage() {
  const { seasonId } = useParams();
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
    setSeason(se);
    setPlayers(sq ?? []);
    setNational(ns ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [seasonId]);

  if (loading) return <Loading />;
  if (!season) return <div className="text-slate-500 dark:text-slate-400">Season not found.</div>;

  const grouped: Record<SquadRole, SquadPlayer[]> = {
    starting: [], bench: [], reserve: [], loaned: [],
  };
  for (const p of players) grouped[p.role].push(p);

  return (
    <div>
      <Link to={`/save/${season.save_id}`} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm">{t('back_save')}</Link>

      <div
        className="mt-3 rounded-lg p-5 mb-4"
        style={{
          background: season.team_color || '#1e293b',
          color: season.team_text_color || '#fff',
        }}
      >
        <div className="text-sm opacity-80">{season.label}</div>
        <div className="text-2xl font-bold mt-1">{season.team_name_snapshot}</div>
        <div className="text-sm opacity-80 mt-1">
          {season.formation} {season.start_date ? `· ${t('from')} ${season.start_date}` : ''}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 mb-4 overflow-x-auto">
        <button
          onClick={() => setTab('club')}
          className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition ${
            tab === 'club'
              ? 'border-emerald-600 text-slate-900 dark:text-slate-100 font-medium'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Club Squad
        </button>
        <button
          onClick={() => setTab('international')}
          className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition ${
            tab === 'international'
              ? 'border-emerald-600 text-slate-900 dark:text-slate-100 font-medium'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          International Squad
        </button>
      </div>

      {tab === 'club' ? (
        <ClubSquad t={t} grouped={grouped} />
      ) : (
        <InternationalSquad t={t} entries={national} />
      )}
    </div>
  );
}

function ClubSquad({ t, grouped }: { t: any; grouped: Record<SquadRole, SquadPlayer[]> }) {
  return (
    <>
      {ROLE_ORDER.map((role) => (
        <div key={role} className="mb-6">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            {t(role)} <span className="text-slate-400 dark:text-slate-600">({grouped[role].length})</span>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden bg-white dark:bg-slate-900">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase">
                <tr>
                  <th className="text-left px-3 py-2 w-10">{t('th_num')}</th>
                  <th className="text-left px-3 py-2 w-16">{t('th_pos')}</th>
                  <th className="text-left px-3 py-2">{t('th_name')}</th>
                  <th className="text-right px-3 py-2 w-14">{t('th_age')}</th>
                  <th className="text-right px-3 py-2 w-14">{t('th_ovr')}</th>
                  <th className="text-left px-3 py-2 w-32">{t('th_nat')}</th>
                  <th className="text-right px-3 py-2 w-16">{t('th_since')}</th>
                </tr>
              </thead>
              <tbody>
                {grouped[role].length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-slate-400 dark:text-slate-600 py-6">{t('no_players')}</td></tr>
                ) : grouped[role].map((p) => (
                  <tr key={p.id} className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{p.jersey ?? '?'}</td>
                    <td className="px-3 py-2 font-mono">{p.position ?? '?'}</td>
                    <td className="px-3 py-2 flex items-center gap-2">
                      {p.photo_url && (<img src={p.photo_url} alt="" className="w-6 h-6 rounded-full object-cover" />)}
                      <span>{p.name_snapshot}</span>
                    </td>
                    <td className="px-3 py-2 text-right">{p.age ?? '?'}</td>
                    <td className="px-3 py-2 text-right font-semibold">{p.ovr ?? '?'}</td>
                    <td className="px-3 py-2">{p.nationality_snapshot ?? '?'}</td>
                    <td className="px-3 py-2 text-right text-slate-500 dark:text-slate-400">{p.since_year ?? '?'}</td>
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

function InternationalSquad({ t, entries }: { t: any; entries: NationalSquadEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded p-8 text-center bg-white dark:bg-slate-900">
        No international call-ups this season.
      </div>
    );
  }
  const byCountry = new Map<string, NationalSquadEntry[]>();
  for (const e of entries) {
    const k = e.country;
    if (!byCountry.has(k)) byCountry.set(k, []);
    byCountry.get(k)!.push(e);
  }
  return (
    <>
      {[...byCountry.entries()].map(([country, list]) => (
        <div key={country} className="mb-6">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            {country} <span className="text-slate-400 dark:text-slate-600">({list.length})</span>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden bg-white dark:bg-slate-900">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase">
                <tr>
                  <th className="text-left px-3 py-2 w-10">{t('th_num')}</th>
                  <th className="text-left px-3 py-2 w-16">{t('th_pos')}</th>
                  <th className="text-left px-3 py-2">{t('th_name')}</th>
                  <th className="text-left px-3 py-2">Club</th>
                  <th className="text-right px-3 py-2 w-14">{t('th_age')}</th>
                  <th className="text-right px-3 py-2 w-14">{t('th_ovr')}</th>
                  <th className="text-right px-3 py-2 w-20">Called since</th>
                </tr>
              </thead>
              <tbody>
                {list.map((e) => (
                  <tr key={e.id} className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{e.jersey ?? '?'}</td>
                    <td className="px-3 py-2 font-mono">{e.position ?? '?'}</td>
                    <td className="px-3 py-2">{e.player_name}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{e.club ?? '?'}</td>
                    <td className="px-3 py-2 text-right">{e.age ?? '?'}</td>
                    <td className="px-3 py-2 text-right font-semibold">{e.ovr ?? '?'}</td>
                    <td className="px-3 py-2 text-right text-slate-500 dark:text-slate-400">{e.called_since ?? '?'}</td>
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
