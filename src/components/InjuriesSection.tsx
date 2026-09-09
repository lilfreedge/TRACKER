import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Injury } from '../types/database';

export default function InjuriesSection({ seasonId }: { seasonId: string }) {
  const [rows, setRows] = useState<Injury[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Injury>>({});

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('injuries').select('*').eq('season_id', seasonId).order('created_at', { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [seasonId]);

  async function add() {
    if (!form.player_name) return;
    const { error } = await supabase.from('injuries').insert({ ...form, season_id: seasonId });
    if (error) { alert(error.message); return; }
    setForm({}); setShowForm(false);
    load();
  }
  async function del(id: string) {
    if (!confirm('Delete this injury?')) return;
    await supabase.from('injuries').delete().eq('id', id);
    load();
  }

  if (loading) return <div className="text-slate-500 text-sm py-6 text-center">…</div>;

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={() => setShowForm((v) => !v)} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-3 py-1.5 text-sm">+ Add injury</button>
      </div>
      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 mb-4 grid gap-2 sm:grid-cols-3">
          <input placeholder="Player" value={form.player_name ?? ''} onChange={(e) => setForm({ ...form, player_name: e.target.value })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input placeholder="Injury (ACL, muscle…)" value={form.injury_type ?? ''} onChange={(e) => setForm({ ...form, injury_type: e.target.value })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input placeholder="Duration" value={form.duration ?? ''} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input placeholder="Replaced by" value={form.replaced_by ?? ''} onChange={(e) => setForm({ ...form, replaced_by: e.target.value })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input placeholder="Date" value={form.date ?? ''} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input placeholder="Note" value={form.note ?? ''} onChange={(e) => setForm({ ...form, note: e.target.value })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <div className="sm:col-span-3 flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-slate-500">Cancel</button>
            <button onClick={add} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-3 py-1.5 text-sm">Save</button>
          </div>
        </div>
      )}
      <div className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden bg-white dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase">
            <tr>
              <th className="text-left px-3 py-2">Player</th>
              <th className="text-left px-3 py-2">Injury</th>
              <th className="text-left px-3 py-2">Duration</th>
              <th className="text-left px-3 py-2">Replaced by</th>
              <th className="text-left px-3 py-2">Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-slate-400 dark:text-slate-600 py-6">No injuries logged.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="px-3 py-2 font-medium">{r.player_name}</td>
                <td className="px-3 py-2">{r.injury_type ?? '—'}</td>
                <td className="px-3 py-2">{r.duration ?? '—'}</td>
                <td className="px-3 py-2">{r.replaced_by ?? '—'}</td>
                <td className="px-3 py-2 text-slate-500">{r.date ?? '—'}</td>
                <td className="px-3 py-2 text-right"><button onClick={() => del(r.id)} className="text-xs text-red-500 hover:text-red-600">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
