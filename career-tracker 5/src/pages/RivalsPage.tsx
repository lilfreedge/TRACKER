import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import Loading from '../components/Loading';
import Autocomplete, { type AutoOption } from '../components/Autocomplete';
import type { Rival } from '../types/database';

interface RivalStats extends Rival {
  wins: number; draws: number; losses: number; goals_for: number; goals_against: number;
}
interface TeamRow { id: string; name: string; country: string | null; primary_color: string | null; text_color: string | null; crest_url: string | null; aliases: string[] | null; }

export default function RivalsPage() {
  const { saveId } = useParams();
  const { t } = useLang();
  const [rivals, setRivals] = useState<RivalStats[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [color, setColor] = useState('#DA291C');

  async function load() {
    if (!saveId) return;
    setLoading(true);
    const [{ data: rs }, { data: ms }, { data: cats }] = await Promise.all([
      supabase.from('rivals').select('*').eq('save_id', saveId).order('sort_order', { ascending: true }).order('rival_team', { ascending: true }),
      supabase.from('matches').select('rival_id, result, home_goals, away_goals, home_team').eq('save_id', saveId),
      supabase.from('team_catalog').select('*').order('name', { ascending: true }),
    ]);
    setTeams((cats ?? []) as TeamRow[]);
    const stats: RivalStats[] = (rs ?? []).map((r) => {
      const own = (ms ?? []).filter((m) => m.rival_id === r.id);
      let w = 0, d = 0, l = 0, gf = 0, ga = 0;
      for (const m of own) {
        if (m.result === 'W') w++;
        else if (m.result === 'D') d++;
        else if (m.result === 'L') l++;
        const isHome = (m.home_team || '').toLowerCase() !== (r.rival_team || '').toLowerCase();
        gf += isHome ? (m.home_goals ?? 0) : (m.away_goals ?? 0);
        ga += isHome ? (m.away_goals ?? 0) : (m.home_goals ?? 0);
      }
      return { ...r, wins: w, draws: d, losses: l, goals_for: gf, goals_against: ga };
    });
    setRivals(stats);
    setLoading(false);
  }
  useEffect(() => { load(); }, [saveId]);

  async function addRival() {
    const name = team.trim();
    if (!saveId || !name) { alert('Enter a team'); return; }
    try {
      const { error } = await supabase.from('rivals').insert({
        save_id: saveId,
        rival_team: name,
        rival_color: color,
        notes: logoUrl ? `logo:${logoUrl}` : null,
      });
      if (error) { console.error(error); alert('Error: ' + error.message); return; }
      setTeam(''); setLogoUrl(''); setColor('#DA291C');
      load();
    } catch (e: any) {
      alert('Unexpected: ' + (e?.message ?? String(e)));
    }
  }

  const teamOptions: AutoOption[] = teams.map((tt) => ({
    value: tt.name,
    label: tt.name,
    aliases: tt.aliases ?? [],
    crest_url: tt.crest_url ?? undefined,
    color: tt.primary_color ?? undefined,
    meta: { country: tt.country, primary_color: tt.primary_color, crest_url: tt.crest_url },
  }));

  if (loading) return <Loading />;

  return (
    <div>
      <Link to={`/save/${saveId}`} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm">{t('back_save')}</Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">{t('rivals')}</h1>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 mb-6 grid gap-2 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <Autocomplete
            value={team}
            onChange={(v, opt) => {
              setTeam(v);
              if (opt) {
                if (opt.meta?.primary_color) setColor(opt.meta.primary_color);
                if (opt.meta?.crest_url) setLogoUrl(opt.meta.crest_url);
              }
            }}
            options={teamOptions}
            placeholder={t('rival_placeholder')}
          />
        </div>
        <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder={t('logo_url_placeholder')} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-slate-100" />
        <div className="flex gap-2">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 rounded border border-slate-300 dark:border-slate-700" />
          <button onClick={addRival} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded px-4 py-2 text-sm">+ {t('add')}</button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {rivals.map((r) => {
          const logo = (r.notes ?? '').startsWith('logo:') ? (r.notes ?? '').slice(5) : null;
          const total = r.wins + r.draws + r.losses;
          return (
            <Link
              key={r.id}
              to={`/save/${saveId}/rivals/${r.id}`}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:border-emerald-400 hover:shadow-sm transition flex items-center gap-3"
            >
              <div className="w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden shrink-0" style={{ background: r.rival_color ?? '#0f172a' }}>
                {logo ? <img src={logo} alt="" className="w-full h-full object-contain p-1" /> : <span className="text-white font-bold">{r.rival_team.slice(0,2).toUpperCase()}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{r.rival_team}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {total} {t('matches')} · {r.wins}W {r.draws}D {r.losses}L · {r.goals_for}-{r.goals_against}
                </div>
              </div>
            </Link>
          );
        })}
        {rivals.length === 0 && (
          <div className="sm:col-span-2 text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded p-8 text-center bg-white dark:bg-slate-900">
            No rivals yet. Add one above.
          </div>
        )}
      </div>
    </div>
  );
}
