import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Autocomplete, { type AutoOption } from './Autocomplete';
import type { Transfer } from '../types/database';

interface TeamRow { id: string; name: string; primary_color: string | null; crest_url: string | null; aliases: string[] | null; }
type Direction = 'in' | 'out' | 'loan_in' | 'loan_out';

const DIR_LABEL: Record<Direction, string> = { in: 'IN (Bought)', out: 'OUT (Sold)', loan_in: 'LOAN IN', loan_out: 'LOAN OUT' };
const DIR_COLOR: Record<Direction, string> = { in: 'text-emerald-600', out: 'text-red-600', loan_in: 'text-blue-600', loan_out: 'text-amber-600' };

export default function TransfersSection({ seasonId }: { seasonId: string }) {
  const [rows, setRows] = useState<Transfer[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [activeClubName, setActiveClubName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null); // 'new' | id | null
  const [form, setForm] = useState<Partial<Transfer>>({ direction: 'in' });

  async function load() {
    setLoading(true);
    const [{ data: tr }, { data: cats }, { data: season }] = await Promise.all([
      supabase.from('transfers').select('*').eq('season_id', seasonId).order('created_at', { ascending: false }),
      supabase.from('team_catalog').select('id, name, primary_color, crest_url, aliases').order('name', { ascending: true }),
      supabase.from('seasons').select('save_id, team_name_snapshot').eq('id', seasonId).maybeSingle(),
    ]);
    setRows(tr ?? []);
    setTeams((cats ?? []) as TeamRow[]);
    setActiveClubName(season?.team_name_snapshot ?? null);
    setLoading(false);
  }
  useEffect(() => { load(); }, [seasonId]);

  function openNew() { setForm({ direction: 'in', from_team: '', to_team: activeClubName ?? '' }); setEditing('new'); }
  function openEdit(r: Transfer) { setForm({ ...r }); setEditing(r.id); }
  function cancel() { setEditing(null); setForm({ direction: 'in' }); }

  function autoFillTeamByDirection(dir: Direction, current: Partial<Transfer>): Partial<Transfer> {
    if (!activeClubName) return { ...current, direction: dir };
    if (dir === 'in' || dir === 'loan_in') return { ...current, direction: dir, to_team: activeClubName };
    return { ...current, direction: dir, from_team: activeClubName };
  }

  async function save() {
    if (!form.player_name) return;
    const payload: any = { season_id: seasonId, player_name: form.player_name, direction: form.direction ?? 'in', from_team: form.from_team ?? null, to_team: form.to_team ?? null, amount: form.amount ?? null, note: form.note ?? null };
    let ok: any;
    if (editing === 'new') {
      const r = await supabase.from('transfers').insert(payload).select().maybeSingle();
      if (r.error) { alert(r.error.message); return; }
      ok = r.data;
    } else {
      const r = await supabase.from('transfers').update(payload).eq('id', editing!);
      if (r.error) { alert(r.error.message); return; }
    }
    // Side effects: if IN → also add to squad_players; if OUT → also add to ex_players
    if (editing === 'new' && ok) {
      const dir = payload.direction as Direction;
      if (dir === 'in' || dir === 'loan_in') {
        await supabase.from('squad_players').insert({ season_id: seasonId, name_snapshot: payload.player_name, role: dir === 'loan_in' ? 'loaned' : 'reserve' });
      } else if (dir === 'out') {
        await supabase.from('squad_players').delete().eq('season_id', seasonId).ilike('name_snapshot', payload.player_name);
        await supabase.from('ex_players').insert({ season_id: seasonId, player_name: payload.player_name, current_team: payload.to_team ?? null, value: payload.amount ?? null, year_gone: new Date().getFullYear() });
      } else if (dir === 'loan_out') {
        await supabase.from('squad_players').update({ role: 'loaned' }).eq('season_id', seasonId).ilike('name_snapshot', payload.player_name);
      }
    }
    cancel(); load();
  }
  async function del(id: string) { if (!confirm('Delete?')) return; await supabase.from('transfers').delete().eq('id', id); load(); }

  if (loading) return <div className="text-slate-500 text-sm py-6 text-center">…</div>;
  const grouped: Record<Direction, Transfer[]> = { in: [], out: [], loan_in: [], loan_out: [] };
  for (const r of rows) grouped[(r.direction ?? 'in') as Direction]?.push(r);

  const teamOptions: AutoOption[] = teams.map((tt) => ({ value: tt.name, label: tt.name, aliases: tt.aliases ?? [], crest_url: tt.crest_url ?? undefined, color: tt.primary_color ?? undefined }));
  const dir = (form.direction ?? 'in') as Direction;
  const activeIsFrom = dir === 'out' || dir === 'loan_out';

  const Form = (
    <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-lg p-3 mb-4 grid gap-2 sm:grid-cols-3">
      <select value={dir} onChange={(e) => setForm(autoFillTeamByDirection(e.target.value as Direction, form))} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm">
        <option value="in">🟢 IN (Bought)</option>
        <option value="out">🔴 OUT (Sold)</option>
        <option value="loan_in">🔵 LOAN IN</option>
        <option value="loan_out">🟠 LOAN OUT</option>
      </select>
      <input placeholder="Player" value={form.player_name ?? ''} onChange={(e) => setForm({ ...form, player_name: e.target.value })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
      <input placeholder="Amount" value={form.amount ?? ''} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
      <div>
        <div className="text-[10px] uppercase text-slate-500 mb-1">From team {activeIsFrom && <span className="text-emerald-600">(auto)</span>}</div>
        {activeIsFrom ? (
          <input readOnly value={form.from_team ?? ''} className="w-full bg-emerald-50 dark:bg-emerald-900/20 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
        ) : (
          <Autocomplete value={form.from_team ?? ''} onChange={(v) => setForm({ ...form, from_team: v })} options={teamOptions} placeholder="From team" />
        )}
      </div>
      <div>
        <div className="text-[10px] uppercase text-slate-500 mb-1">To team {!activeIsFrom && <span className="text-emerald-600">(auto)</span>}</div>
        {!activeIsFrom ? (
          <input readOnly value={form.to_team ?? ''} className="w-full bg-emerald-50 dark:bg-emerald-900/20 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
        ) : (
          <Autocomplete value={form.to_team ?? ''} onChange={(v) => setForm({ ...form, to_team: v })} options={teamOptions} placeholder="To team" />
        )}
      </div>
      <input placeholder="Note" value={form.note ?? ''} onChange={(e) => setForm({ ...form, note: e.target.value })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
      <div className="sm:col-span-3 flex justify-end gap-2">
        <button onClick={cancel} className="px-3 py-1.5 text-sm text-slate-500">Cancel</button>
        <button onClick={save} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-3 py-1.5 text-sm">{editing === 'new' ? 'Save' : 'Update'}</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={openNew} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-3 py-1.5 text-sm">+ Add transfer</button>
      </div>
      {editing === 'new' && Form}
      <div className="grid gap-4 sm:grid-cols-2">
        {(['in', 'out', 'loan_in', 'loan_out'] as Direction[]).map((d) => {
          const list = grouped[d];
          return (
            <div key={d}>
              <div className={`text-xs uppercase font-semibold mb-1 ${DIR_COLOR[d]}`}>{DIR_LABEL[d]} ({list.length})</div>
              <div className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden bg-white dark:bg-slate-900">
                {list.length === 0 ? (<div className="text-center text-slate-400 dark:text-slate-600 py-6 text-sm">—</div>) : list.map((r) => editing === r.id ? <div key={r.id}>{Form}</div> : (
                  <div key={r.id} className="p-3 border-t first:border-t-0 border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{r.player_name}</div>
                      <div className="text-xs text-slate-500 truncate">{r.from_team ? `${r.from_team} → ` : ''}{r.to_team ?? ''} {r.amount ? `· ${r.amount}` : ''}</div>
                      {r.note && <div className="text-xs text-slate-400 mt-1">{r.note}</div>}
                    </div>
                    <button onClick={() => openEdit(r)} className="text-xs text-slate-400 hover:text-emerald-500">✎</button>
                    <button onClick={() => del(r.id)} className="text-xs text-slate-400 hover:text-red-500">×</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
