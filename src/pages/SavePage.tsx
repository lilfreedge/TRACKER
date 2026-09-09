import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import Loading from '../components/Loading';
import type { CareerSave, Season } from '../types/database';

export default function SavePage() {
  const { saveId } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const [save, setSave] = useState<CareerSave | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState('');
  const [team, setTeam] = useState('');
  const [color, setColor] = useState('#059669');
  const [clubSince, setClubSince] = useState('');
  const [nationalTeam, setNationalTeam] = useState('');
  const [nationalSince, setNationalSince] = useState('');
  const [openInfo, setOpenInfo] = useState<string | null>(null);

  async function load() {
    if (!saveId) return;
    setLoading(true);
    const [{ data: s }, { data: se }] = await Promise.all([
      supabase.from('career_saves').select('*').eq('id', saveId).single(),
      supabase.from('seasons').select('*').eq('save_id', saveId).order('label', { ascending: false }),
    ]);
    setSave(s);
    setSeasons(se ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [saveId]);

  async function createSeason() {
    if (!saveId || !label.trim()) return;
    const { error } = await supabase.from('seasons').insert({
      save_id: saveId,
      label: label.trim(),
      team_name_snapshot: team.trim() || null,
      team_color: color || null,
      team_text_color: '#ffffff',
      formation: null,
      club_since_year: clubSince ? Number(clubSince) : null,
      national_team: nationalTeam.trim() || null,
      national_team_since_year: nationalSince ? Number(nationalSince) : null,
      is_current: false,
    });
    if (error) { alert(error.message); return; }
    setLabel(''); setTeam(''); setColor('#059669'); setClubSince(''); setNationalTeam(''); setNationalSince('');
    setShowForm(false);
    load();
  }

  if (loading) return <Loading />;
  if (!save) return <div className="text-slate-500 dark:text-slate-400">Save not found. <Link to="/" className="text-emerald-600">home</Link></div>;

  const current = seasons.find((s) => s.is_current) ?? seasons[0];

  return (
    <div>
      <Link to={`/game/${encodeURIComponent(save.game_edition)}`} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm">{t('back_saves')}</Link>

      <div className="mt-2 mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-emerald-600 text-sm font-medium">{save.game_edition}</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{save.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{seasons.length} {t('seasons')}</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-4 py-2 text-sm font-medium"
        >
          + {t('new_season')}
        </button>
      </div>

      {/* Hero tiles: Career · Current · Competition · Rivals */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <HeroTile
          icon="📜"
          color="from-blue-500 to-blue-600"
          title={t('career')}
          onClick={() => navigate(`/save/${save.id}/career`)}
        />
        <HeroTile
          icon="⚡"
          color="from-emerald-500 to-emerald-600"
          title={t('current_season')}
          subtitle={current ? `${current.label} · ${current.team_name_snapshot ?? ''}` : undefined}
          onClick={() => current ? navigate(`/season/${current.id}`) : null}
          disabled={!current}
        />
        <HeroTile
          icon="🏆"
          color="from-amber-500 to-amber-600"
          title={t('competition')}
          onClick={() => navigate(`/save/${save.id}/competition`)}
        />
        <HeroTile
          icon="⚔️"
          color="from-red-500 to-red-600"
          title={t('rivals')}
          onClick={() => navigate(`/save/${save.id}/rivals`)}
        />
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 mb-6 grid gap-2 sm:grid-cols-2">
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t('label_placeholder')} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-slate-100" />
          <input value={team} onChange={(e) => setTeam(e.target.value)} placeholder={t('team_placeholder')} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-slate-100" />
          <input value={clubSince} onChange={(e) => setClubSince(e.target.value)} placeholder={t('club_since_placeholder')} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-slate-100" />
          <input value={nationalTeam} onChange={(e) => setNationalTeam(e.target.value)} placeholder={t('national_team_placeholder')} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-slate-100" />
          <input value={nationalSince} onChange={(e) => setNationalSince(e.target.value)} placeholder={t('national_since_placeholder')} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-slate-100" />
          <div className="flex gap-2 items-center">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 rounded border border-slate-300 dark:border-slate-700" />
            <input value={color} onChange={(e) => setColor(e.target.value)} placeholder={t('color_placeholder')} className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-slate-100" />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">{t('cancel')}</button>
            <button onClick={createSeason} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-4 py-2 text-sm font-medium">{t('save_btn')}</button>
          </div>
        </div>
      )}

      {seasons.length === 0 ? (
        <div className="text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded p-8 text-center bg-white dark:bg-slate-900">
          {t('empty_seasons')}
        </div>
      ) : (
        <div className="grid gap-3">
          {seasons.map((s) => (
            <div key={s.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-4 flex items-center gap-3 hover:border-emerald-400 hover:shadow-sm transition group">
              <Link to={`/season/${s.id}`} className="flex-1 flex items-center gap-3">
                {s.team_color && (<div className="w-2 h-10 rounded-sm" style={{ background: s.team_color }} />)}
                <div className="flex-1">
                  <div className="font-medium text-slate-900 dark:text-slate-100">{s.label}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-sm">
                    {s.team_name_snapshot ?? '—'}
                    {s.club_since_year ? ` · ${t('since')} ${s.club_since_year}` : ''}
                    {s.national_team ? ` · 🌍 ${s.national_team}` : ''}
                  </div>
                </div>
              </Link>
              {s.is_current && (<span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded">{t('current')}</span>)}
              <button
                onClick={() => setOpenInfo(openInfo === s.id ? null : s.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title={t('registered')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              </button>
              {openInfo === s.id && (
                <div className="absolute -mt-16 ml-8 bg-slate-900 text-white text-xs rounded px-3 py-2 shadow-lg z-10">
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

function HeroTile({ icon, color, title, subtitle, onClick, disabled }: {
  icon: string; color: string; title: string; subtitle?: string; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-gradient-to-br ${color} text-white rounded-lg p-4 text-left hover:brightness-110 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      <div className="text-2xl">{icon}</div>
      <div className="mt-2 font-semibold">{title}</div>
      {subtitle && <div className="text-xs opacity-90 mt-1 line-clamp-1">{subtitle}</div>}
    </button>
  );
}
