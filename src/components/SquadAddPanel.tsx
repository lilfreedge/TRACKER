import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Autocomplete, { type AutoOption } from './Autocomplete';
import { flagFor } from '../lib/countries';
import type { SquadRole } from '../types/database';

interface Props { seasonId: string; saveId: string; onReload: () => void; }

const ROLES: SquadRole[] = ['starting', 'bench', 'reserve', 'loaned'];
const POSITIONS = ['GK','CB','LB','RB','LWB','RWB','CDM','CM','CAM','LM','RM','LW','RW','ST','CF','LF','RF'];

interface KnownPlayer { name: string; position: string | null; ovr: number | null; age: number | null; nationality: string | null; photo_url: string | null; }

export default function SquadAddPanel({ seasonId, saveId, onReload }: Props) {
  const [mode, setMode] = useState<'idle' | 'add' | 'paste' | 'copy'>('idle');
  const [known, setKnown] = useState<KnownPlayer[]>([]);
  const [prevSeasonId, setPrevSeasonId] = useState<string | null>(null);
  const [role, setRole] = useState<SquadRole>('starting');
  const [jersey, setJersey] = useState('');
  const [pos, setPos] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [ovr, setOvr] = useState('');
  const [nat, setNat] = useState('');
  const [since, setSince] = useState('');
  const [paste, setPaste] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => { (async () => {
    // Load a pool of known players across all seasons of this save for autocomplete
    const { data: seasons } = await supabase.from('seasons').select('id').eq('save_id', saveId);
    if (!seasons?.length) return;
    const ids = seasons.map((s) => s.id);
    const { data: sp } = await supabase.from('squad_players').select('name_snapshot, position, ovr, age, nationality_snapshot, photo_url').in('season_id', ids).limit(2000);
    if (sp) {
      const seen = new Set<string>();
      const arr: KnownPlayer[] = [];
      for (const p of sp as any[]) {
        if (seen.has(p.name_snapshot)) continue;
        seen.add(p.name_snapshot);
        arr.push({ name: p.name_snapshot, position: p.position, ovr: p.ovr, age: p.age, nationality: p.nationality_snapshot, photo_url: p.photo_url });
      }
      setKnown(arr);
    }
    // Find previous season (largest label smaller than current's label)
    const { data: curr } = await supabase.from('seasons').select('label').eq('id', seasonId).maybeSingle();
    if (curr?.label) {
      const { data: all } = await supabase.from('seasons').select('id, label').eq('save_id', saveId).order('label', { ascending: true });
      if (all) {
        const idx = all.findIndex((s: any) => s.id === seasonId);
        if (idx > 0) setPrevSeasonId(all[idx - 1].id);
      }
    }
  })(); }, [saveId, seasonId]);

  const options: AutoOption[] = known.map((k) => ({ value: k.name, label: k.name, aliases: [], meta: k }));

  async function addOne() {
    if (!name.trim()) return;
    setBusy(true);
    if (role === 'starting') {
      const { count } = await supabase.from('squad_players').select('*', { count: 'exact', head: true }).eq('season_id', seasonId).eq('role', 'starting');
      if ((count ?? 0) >= 11) { alert('Starting XI is full (11 players). Move someone out first.'); setBusy(false); return; }
    }
    const payload: any = { season_id: seasonId, name_snapshot: name.trim(), jersey: jersey ? Number(jersey) : null, position: pos || null, age: age ? Number(age) : null, ovr: ovr ? Number(ovr) : null, nationality_snapshot: nat || null, since_year: since ? Number(since) : null, role };
    const { error } = await supabase.from('squad_players').insert(payload);
    setBusy(false);
    if (error) { alert(error.message); return; }
    setJersey(''); setPos(''); setName(''); setAge(''); setOvr(''); setNat(''); setSince('');
    onReload();
  }

  async function copyPrevious() {
    if (!prevSeasonId) { alert('No previous season'); return; }
    setBusy(true); setStatus('Copying…');
    const { data: prev } = await supabase.from('squad_players').select('*').eq('season_id', prevSeasonId);
    if (!prev?.length) { setBusy(false); setStatus('Previous season is empty'); return; }
    const rows = prev.map((p: any) => ({ season_id: seasonId, name_snapshot: p.name_snapshot, jersey: p.jersey, position: p.position, age: p.age != null ? p.age + 1 : null, ovr: p.ovr, nationality_snapshot: p.nationality_snapshot, since_year: p.since_year, role: p.role, photo_url: p.photo_url, player_id: p.player_id, formation_slot: p.formation_slot }));
    const { error } = await supabase.from('squad_players').insert(rows);
    setBusy(false);
    if (error) { setStatus('Error: ' + error.message); return; }
    setStatus(`Copied ${rows.length} players (age +1)`);
    onReload();
    setMode('idle');
  }

  async function bulkPaste() {
    if (!paste.trim()) return;
    setBusy(true); setStatus('Parsing…');
    // Accept tab or comma separated. Columns: #, POS, NAME, AGE, OVR, NAT, SINCE
    const rows = paste.split('\n').map((l) => l.trim()).filter(Boolean).map((line) => {
      const parts = line.split(/\t|,/).map((c) => c.trim());
      const [j, p, n, a, o, na, si] = parts;
      return { season_id: seasonId, name_snapshot: n ?? '', jersey: Number(j) || null, position: p || null, age: Number(a) || null, ovr: Number(o) || null, nationality_snapshot: na || null, since_year: Number(si) || null, role };
    }).filter((r) => r.name_snapshot);
    if (!rows.length) { setBusy(false); setStatus('Nothing to import'); return; }
    const { error } = await supabase.from('squad_players').insert(rows);
    setBusy(false);
    if (error) { setStatus('Error: ' + error.message); return; }
    setStatus(`Imported ${rows.length} players into ${role}`);
    setPaste(''); onReload(); setMode('idle');
  }

  return (
    <div className="mb-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900">
      <div className="p-3 flex gap-2 flex-wrap items-center border-b border-slate-200 dark:border-slate-800">
        <button onClick={() => setMode(mode === 'add' ? 'idle' : 'add')} className={`text-xs rounded-full px-3 py-1.5 ${mode === 'add' ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-700 hover:border-emerald-400'}`}>+ Add player</button>
        <button onClick={() => setMode(mode === 'paste' ? 'idle' : 'paste')} className={`text-xs rounded-full px-3 py-1.5 ${mode === 'paste' ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-700 hover:border-emerald-400'}`}>📋 Paste squad</button>
        {prevSeasonId && <button onClick={copyPrevious} disabled={busy} className="text-xs border border-slate-300 dark:border-slate-700 hover:border-emerald-400 rounded-full px-3 py-1.5">↻ Copy previous season</button>}
        <button disabled className="text-xs border border-slate-200 dark:border-slate-800 text-slate-400 rounded-full px-3 py-1.5 cursor-not-allowed">📷 Upload photo (v1.6)</button>
        {status && <span className="text-xs text-slate-500 ml-auto">{status}</span>}
      </div>

      {mode === 'add' && (
        <div className="p-3 grid gap-2 sm:grid-cols-8 text-sm">
          <select value={role} onChange={(e) => setRole(e.target.value as SquadRole)} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5">
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <input value={jersey} onChange={(e) => setJersey(e.target.value)} placeholder="#" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5" />
          <select value={pos} onChange={(e) => setPos(e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5">
            <option value="">Pos</option>{POSITIONS.map((p) => <option key={p}>{p}</option>)}
          </select>
          <div className="sm:col-span-2">
            <Autocomplete value={name} onChange={(v, opt) => { setName(v); if (opt?.meta) { const m = opt.meta as KnownPlayer; if (m.position) setPos(m.position); if (m.ovr) setOvr(String(m.ovr)); if (m.age) setAge(String(m.age)); if (m.nationality) setNat(m.nationality); } }} options={options} placeholder="Player name" />
          </div>
          <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5" />
          <input value={ovr} onChange={(e) => setOvr(e.target.value)} placeholder="OVR" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5" />
          <input value={nat} onChange={(e) => setNat(e.target.value)} placeholder="NAT" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5" />
          <input value={since} onChange={(e) => setSince(e.target.value)} placeholder="Since" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5" />
          <div className="sm:col-span-8 flex justify-end gap-2">
            <button onClick={() => setMode('idle')} className="text-xs text-slate-500 px-3">Cancel</button>
            <button onClick={addOne} disabled={busy} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-4 py-1.5 text-sm">Add {flagFor(nat)}</button>
          </div>
        </div>
      )}

      {mode === 'paste' && (
        <div className="p-3">
          <div className="text-xs text-slate-500 mb-2">Paste rows from a spreadsheet. Columns (tab or comma separated): <code>#, POS, NAME, AGE, OVR, NAT, SINCE</code>. All rows go into role: <b>{role}</b>.</div>
          <div className="flex gap-2 mb-2 items-center">
            <label className="text-xs text-slate-500">Role:</label>
            <select value={role} onChange={(e) => setRole(e.target.value as SquadRole)} className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1">
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <textarea rows={6} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={`10\tCF\tMbappé\t28\t92\tFRA\t2024\n7\tRW\tSaka\t26\t89\tENG\t2019`} className="w-full font-mono text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-2" />
          <div className="mt-2 flex justify-end gap-2"><button onClick={() => setMode('idle')} className="text-xs text-slate-500 px-3">Cancel</button><button onClick={bulkPaste} disabled={busy} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-4 py-1.5 text-sm">Import</button></div>
        </div>
      )}
    </div>
  );
}
