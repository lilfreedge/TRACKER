import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase, OWNER_EMAIL } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import Loading from '../components/Loading';
import type { CareerSave } from '../types/database';
export default function SavesPage() {
  const { edition } = useParams();
  const decodedEdition = decodeURIComponent(edition ?? '');
  const { t } = useLang();
  const [saves, setSaves] = useState<CareerSave[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('career_saves').select('*').eq('owner_email', OWNER_EMAIL).eq('game_edition', decodedEdition).order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    if (error) { console.error(error); alert('Load error: ' + error.message); }
    setSaves((data ?? []).filter((s: CareerSave) => s.name !== 'Untitled'));
    setLoading(false);
  }
  useEffect(() => { load(); }, [decodedEdition]);
  async function createSave() {
    const name = newName.trim();
    if (!name) { alert('Type a save name first'); return; }
    setBusy(true);
    try {
      const { error } = await supabase.from('career_saves').insert({ name, owner_email: OWNER_EMAIL, game_edition: decodedEdition, is_active: true });
      if (error) { console.error(error); alert('Error: ' + error.message); return; }
      setNewName(''); await load();
    } catch (e: any) { alert('Unexpected: ' + (e?.message ?? String(e))); }
    finally { setBusy(false); }
  }
  async function deleteSave(id: string) {
    if (!confirm(t('confirm_delete_save'))) return;
    const { error } = await supabase.from('career_saves').delete().eq('id', id);
    if (error) { alert(error.message); return; }
    load();
  }
  return (
    <div>
      <Link to="/" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm">{t('back_games')}</Link>
      <div className="mt-2 mb-6">
        <div className="text-emerald-600 text-sm font-medium">{decodedEdition}</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('your_saves')}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{t('saves_subtitle')}</p>
      </div>
      <div className="flex gap-2 mb-6">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t('new_save')} className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" onKeyDown={(e) => { if (e.key === 'Enter') createSave(); }} disabled={busy} />
        <button onClick={createSave} disabled={busy} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded px-4 py-2 text-sm font-medium">{busy ? '…' : t('add')}</button>
      </div>
      {loading ? <Loading /> : saves.length === 0 ? (
        <div className="text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded p-8 text-center bg-white dark:bg-slate-900">{t('empty_saves')}</div>
      ) : (
        <div className="grid gap-3">
          {saves.map((s) => (
            <div key={s.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-4 flex items-center gap-3 hover:border-emerald-400 hover:shadow-sm transition">
              <Link to={`/save/${s.id}`} className="flex-1">
                <div className="font-medium text-slate-900 dark:text-slate-100">{s.name}</div>
                <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{new Date(s.created_at).toLocaleDateString()}</div>
              </Link>
              <button onClick={() => deleteSave(s.id)} className="text-slate-400 hover:text-red-500 text-sm">{t('delete')}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
