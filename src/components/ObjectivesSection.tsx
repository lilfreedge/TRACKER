import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Objective { id: string; season_id: string; label: string; status: string | null; note: string | null; created_at: string; }

export default function ObjectivesSection({ seasonId }: { seasonId: string }) {
  const [rows, setRows] = useState<Objective[]>([]);
  const [label, setLabel] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('season_objectives').select('*').eq('season_id', seasonId).order('created_at', { ascending: true });
    setRows((data ?? []) as Objective[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, [seasonId]);

  async function add() {
    if (!label.trim()) return;
    const { error } = await supabase.from('season_objectives').insert({ season_id: seasonId, label: label.trim(), status: 'pending', note: note.trim() || null });
    if (error) { alert(error.message); return; }
    setLabel(''); setNote(''); load();
  }
  async function setStatus(id: string, status: string) { await supabase.from('season_objectives').update({ status }).eq('id', id); load(); }
  async function del(id: string) { if (!confirm('Delete?')) return; await supabase.from('season_objectives').delete().eq('id', id); load(); }

  const badge = (s: string | null) => {
    if (s === 'done') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
    if (s === 'failed') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
    return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  };

  if (loading) return <div className="text-slate-400 py-6 text-center text-sm">Loading…</div>;

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] mb-4">
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Objective (e.g. Win the league)" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
        <button onClick={add} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-4 py-2 text-sm font-medium">Add</button>
      </div>
      {rows.length === 0 ? (
        <div className="text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded p-6 text-center text-sm bg-white dark:bg-slate-900">No objectives yet.</div>
      ) : (
        <div className="grid gap-2">{rows.map((o) => (
          <div key={o.id} className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-white dark:bg-slate-900 flex items-center gap-3">
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${badge(o.status)}`}>{o.status ?? 'pending'}</span>
            <div className="flex-1 min-w-0"><div className="font-medium truncate">{o.label}</div>{o.note && <div className="text-xs text-slate-500 truncate">{o.note}</div>}</div>
            <div className="flex gap-1">
              <button onClick={() => setStatus(o.id, 'done')} className="text-xs text-emerald-600 hover:text-emerald-500" title="Done">✓</button>
              <button onClick={() => setStatus(o.id, 'failed')} className="text-xs text-red-500 hover:text-red-400" title="Failed">✗</button>
              <button onClick={() => setStatus(o.id, 'pending')} className="text-xs text-slate-400 hover:text-slate-300" title="Pending">◐</button>
              <button onClick={() => del(o.id)} className="text-xs text-slate-400 hover:text-red-500 ml-1">×</button>
            </div>
          </div>
        ))}</div>
      )}
    </div>
  );
}
