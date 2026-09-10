import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Transfer } from '../types/database';
export default function TransfersSection({ seasonId }: { seasonId: string }) {
  const [rows, setRows] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Transfer>>({ direction: 'in' });
  async function load() { setLoading(true); const { data } = await supabase.from('transfers').select('*').eq('season_id', seasonId).order('created_at', { ascending: false }); setRows(data ?? []); setLoading(false); }
  useEffect(() => { load(); }, [seasonId]);
  async function add() { if (!form.player_name) return; const { error } = await supabase.from('transfers').insert({ ...form, season_id: seasonId }); if (error) { alert(error.message); return; } setForm({ direction: 'in' }); setShowForm(false); load(); }
  async function del(id: string) { if (!confirm('Delete?')) return; await supabase.from('transfers').delete().eq('id', id); load(); }
  if (loading) return <div className="text-slate-500 text-sm py-6 text-center">…</div>;
  const ins = rows.filter((r) => r.direction === 'in');
  const outs = rows.filter((r) => r.direction === 'out');
  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={() => setShowForm((v) => !v)} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-3 py-1.5 text-sm">+ Add transfer</button>
      </div>
      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 mb-4 grid gap-2 sm:grid-cols-3">
          <select value={form.direction ?? 'in'} onChange={(e) => setForm({ ...form, direction: e.target.value as any })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm">
            <option value="in">IN</option><option value="out">OUT</option>
          </select>
          <input placeholder="Player" value={form.player_name ?? ''} onChange={(e) => setForm({ ...form, player_name: e.target.value })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input placeholder="Amount" value={form.amount ?? ''} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input placeholder="From team" value={form.from_team ?? ''} onChange={(e) => setForm({ ...form, from_team: e.target.value })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input placeholder="To team" value={form.to_team ?? ''} onChange={(e) => setForm({ ...form, to_team: e.target.value })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input placeholder="Note" value={form.note ?? ''} onChange={(e) => setForm({ ...form, note: e.target.value })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <div className="sm:col-span-3 flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-slate-500">Cancel</button>
            <button onClick={add} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-3 py-1.5 text-sm">Save</button>
          </div>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {[['IN', ins, 'emerald'] as const, ['OUT', outs, 'red'] as const].map(([title, list, color]) => (
          <div key={title}>
            <div className={`text-xs uppercase font-semibold mb-1 text-${color}-600 dark:text-${color}-400`}>{title} ({list.length})</div>
            <div className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden bg-white dark:bg-slate-900">
              {list.length === 0 ? (<div className="text-center text-slate-400 dark:text-slate-600 py-6 text-sm">—</div>) : list.map((r) => (
                <div key={r.id} className="p-3 border-t first:border-t-0 border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <div className="flex-1 min-w-0"><div className="font-medium text-sm truncate">{r.player_name}</div><div className="text-xs text-slate-500 truncate">{r.from_team ? `${r.from_team} → ` : ''}{r.to_team ?? ''} {r.amount ? `· ${r.amount}` : ''}</div>{r.note && <div className="text-xs text-slate-400 mt-1">{r.note}</div>}</div>
                  <button onClick={() => del(r.id)} className="text-xs text-red-500">×</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
