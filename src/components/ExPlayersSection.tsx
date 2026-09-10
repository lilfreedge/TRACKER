import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ExPlayer } from '../types/database';
export default function ExPlayersSection({ seasonId }: { seasonId: string }) {
  const [rows, setRows] = useState<ExPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<ExPlayer>>({});
  async function load() { setLoading(true); const { data } = await supabase.from('ex_players').select('*').eq('season_id', seasonId).order('year_gone', { ascending: false }); setRows(data ?? []); setLoading(false); }
  useEffect(() => { load(); }, [seasonId]);
  async function add() { if (!form.player_name) return; const { error } = await supabase.from('ex_players').insert({ ...form, season_id: seasonId }); if (error) { alert(error.message); return; } setForm({}); setShowForm(false); load(); }
  async function del(id: string) { if (!confirm('Delete?')) return; await supabase.from('ex_players').delete().eq('id', id); load(); }
  if (loading) return <div className="text-slate-500 text-sm py-6 text-center">…</div>;
  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={() => setShowForm((v) => !v)} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-3 py-1.5 text-sm">+ Add ex-player</button>
      </div>
      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 mb-4 grid gap-2 sm:grid-cols-3">
          <input placeholder="Name" value={form.player_name ?? ''} onChange={(e) => setForm({ ...form, player_name: e.target.value })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input placeholder="Position" value={form.position ?? ''} onChange={(e) => setForm({ ...form, position: e.target.value })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input placeholder="OVR" type="number" value={form.ovr ?? ''} onChange={(e) => setForm({ ...form, ovr: e.target.value ? Number(e.target.value) : null })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input placeholder="Current team" value={form.current_team ?? ''} onChange={(e) => setForm({ ...form, current_team: e.target.value })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input placeholder="Value" value={form.value ?? ''} onChange={(e) => setForm({ ...form, value: e.target.value })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input placeholder="Year gone" type="number" value={form.year_gone ?? ''} onChange={(e) => setForm({ ...form, year_gone: e.target.value ? Number(e.target.value) : null })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <div className="sm:col-span-3 flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-slate-500">Cancel</button>
            <button onClick={add} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-3 py-1.5 text-sm">Save</button>
          </div>
        </div>
      )}
      <div className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden bg-white dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase">
            <tr><th className="text-left px-3 py-2">Name</th><th className="text-left px-3 py-2">Pos</th><th className="text-right px-3 py-2">OVR</th><th className="text-left px-3 py-2">Now at</th><th className="text-right px-3 py-2">Value</th><th className="text-right px-3 py-2">Gone</th><th></th></tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (<tr><td colSpan={7} className="text-center text-slate-400 py-6">No ex-players.</td></tr>) : rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="px-3 py-2 font-medium">{r.player_name}</td>
                <td className="px-3 py-2 font-mono">{r.position ?? '—'}</td>
                <td className="px-3 py-2 text-right">{r.ovr ?? '—'}</td>
                <td className="px-3 py-2">{r.current_team ?? '—'}</td>
                <td className="px-3 py-2 text-right">{r.value ?? '—'}</td>
                <td className="px-3 py-2 text-right text-slate-500">{r.year_gone ?? '—'}</td>
                <td className="px-3 py-2 text-right"><button onClick={() => del(r.id)} className="text-xs text-red-500">×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
