import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import Loading from '../components/Loading';

interface Award { id: string; save_id: string; season_id: string | null; award_name: string; category: string | null; recipient: string | null; year: number | null; notes: string | null; created_at: string; }

export default function AwardsPage() {
  const { saveId } = useParams();
  const { t } = useLang();
  const [rows, setRows] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Award>>({});

  async function load() {
    if (!saveId) return;
    setLoading(true);
    const { data } = await supabase.from('awards').select('*').eq('save_id', saveId).order('year', { ascending: false });
    setRows((data ?? []) as Award[]); setLoading(false);
  }
  useEffect(() => { load(); }, [saveId]);

  async function add() {
    if (!saveId || !form.award_name) return;
    const payload: any = { save_id: saveId, award_name: form.award_name, category: form.category || null, recipient: form.recipient || null, year: form.year ? Number(form.year) : null, notes: form.notes || null };
    const { error } = await supabase.from('awards').insert(payload);
    if (error) { alert(error.message); return; }
    setForm({}); setShowForm(false); load();
  }
  async function del(id: string) { if (!confirm('Delete?')) return; await supabase.from('awards').delete().eq('id', id); load(); }

  if (loading) return <Loading />;

  return (
    <div>
      <Link to={`/save/${saveId}`} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm">{t('back_save')}</Link>
      <div className="mt-2 mb-6 flex items-start justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">🏆 Awards</h1>
        <button onClick={() => setShowForm((v) => !v)} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-4 py-2 text-sm font-medium">+ New award</button>
      </div>
      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-lg p-4 mb-6 grid gap-2 sm:grid-cols-2">
          <input autoFocus value={form.award_name ?? ''} onChange={(e) => setForm({ ...form, award_name: e.target.value })} placeholder="Award name (e.g. Ballon d'Or)" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input value={form.category ?? ''} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category (Player / Manager / Team)" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input value={form.recipient ?? ''} onChange={(e) => setForm({ ...form, recipient: e.target.value })} placeholder="Recipient" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input type="number" value={form.year ?? ''} onChange={(e) => setForm({ ...form, year: e.target.value as any })} placeholder="Year" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="sm:col-span-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <div className="sm:col-span-2 flex justify-end gap-2"><button onClick={() => setShowForm(false)} className="px-3 py-2 text-sm text-slate-500">Cancel</button><button onClick={add} className="bg-emerald-600 text-white rounded px-4 py-2 text-sm">Save</button></div>
        </div>
      )}
      {rows.length === 0 ? (
        <div className="text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded p-8 text-center bg-white dark:bg-slate-900">No awards yet.</div>
      ) : (
        <div className="grid gap-2">{rows.map((a) => (
          <div key={a.id} className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-white dark:bg-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xl">🏆</div>
            <div className="flex-1 min-w-0"><div className="font-medium">{a.award_name}</div><div className="text-xs text-slate-500 mt-0.5">{[a.category, a.recipient, a.year].filter(Boolean).join(' · ')}</div>{a.notes && <div className="text-xs text-slate-400 mt-0.5 truncate">{a.notes}</div>}</div>
            <button onClick={() => del(a.id)} className="text-xs text-red-500">×</button>
          </div>
        ))}</div>
      )}
    </div>
  );
}
