import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import Loading from '../components/Loading';
import type { CareerSave, Season } from '../types/database';

export default function SavePage() {
  const { saveId } = useParams();
  const { t } = useLang();
  const [save, setSave] = useState<CareerSave | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState('');
  const [team, setTeam] = useState('');
  const [formation, setFormation] = useState('4-3-3');
  const [color, setColor] = useState('#059669');

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
      formation: formation.trim() || null,
      is_current: false,
    });
    if (error) { alert(error.message); return; }
    setLabel(''); setTeam(''); setFormation('4-3-3'); setColor('#059669');
    setShowForm(false);
    load();
  }

  if (loading) return <Loading />;
  if (!save) return <div className="text-slate-500 dark:text-slate-400">Save not found. <Link to="/" className="text-emerald-600">home</Link></div>;

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

      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 mb-6 grid gap-2 sm:grid-cols-2">
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t('label_placeholder')} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-slate-100" />
          <input value={team} onChange={(e) => setTeam(e.target.value)} placeholder={t('team_placeholder')} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-slate-100" />
          <input value={formation} onChange={(e) => setFormation(e.target.value)} placeholder={t('formation_placeholder')} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-slate-100" />
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
            <Link key={s.id} to={`/season/${s.id}`} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-4 flex items-center gap-3 hover:border-emerald-400 hover:shadow-sm transition">
              {s.team_color && (<div className="w-2 h-10 rounded-sm" style={{ background: s.team_color }} />)}
              <div className="flex-1">
                <div className="font-medium text-slate-900 dark:text-slate-100">{s.label}</div>
                <div className="text-slate-500 dark:text-slate-400 text-sm">{s.team_name_snapshot || '—'} {s.formation ? `· ${s.formation}` : ''}</div>
              </div>
              {s.is_current && (<span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded">{t('current')}</span>)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
