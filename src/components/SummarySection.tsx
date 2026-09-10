import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Summary { id: string; season_id: string; final_position: number | null; points: number | null; top_scorer: string | null; top_scorer_goals: number | null; key_moment: string | null; next_objective: string | null; }

export default function SummarySection({ seasonId }: { seasonId: string }) {
  const [s, setS] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Summary>>({});
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('season_summaries').select('*').eq('season_id', seasonId).maybeSingle();
    setS(data as Summary | null); setForm(data ?? {}); setLoading(false);
  }
  useEffect(() => { load(); }, [seasonId]);

  async function save() {
    setSaving(true);
    const payload: any = { season_id: seasonId, final_position: form.final_position != null ? Number(form.final_position) : null, points: form.points != null ? Number(form.points) : null, top_scorer: form.top_scorer || null, top_scorer_goals: form.top_scorer_goals != null ? Number(form.top_scorer_goals) : null, key_moment: form.key_moment || null, next_objective: form.next_objective || null };
    if (s?.id) await supabase.from('season_summaries').update(payload).eq('id', s.id);
    else await supabase.from('season_summaries').insert(payload);
    setSaving(false); load();
  }

  if (loading) return <div className="text-slate-400 py-6 text-center text-sm">Loading…</div>;

  const Field = (label: string, key: keyof Summary, type: 'text' | 'number' = 'text') => (
    <label className="block">
      <div className="text-xs uppercase text-slate-500 font-semibold mb-1">{label}</div>
      <input type={type} value={(form[key] as any) ?? ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
    </label>
  );

  return (
    <div className="max-w-2xl">
      <p className="text-slate-500 text-sm mb-4">Season summary — carries over to help you review and plan the next campaign.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {Field('Final position', 'final_position', 'number')}
        {Field('Points', 'points', 'number')}
        {Field('Top scorer', 'top_scorer')}
        {Field('Top scorer goals', 'top_scorer_goals', 'number')}
      </div>
      <label className="block mt-3">
        <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Key moment</div>
        <textarea rows={2} value={form.key_moment ?? ''} onChange={(e) => setForm({ ...form, key_moment: e.target.value })} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
      </label>
      <label className="block mt-3">
        <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Next objective</div>
        <textarea rows={2} value={form.next_objective ?? ''} onChange={(e) => setForm({ ...form, next_objective: e.target.value })} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
      </label>
      <div className="mt-4"><button onClick={save} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-5 py-2 text-sm font-medium disabled:opacity-50">{saving ? 'Saving…' : 'Save summary'}</button></div>
    </div>
  );
}
