import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Autocomplete, { type AutoOption } from './Autocomplete';
import { flagFor, COUNTRY_NAMES, isKnownCountry } from '../lib/countries';
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
    if (nat && !isKnownCountry(nat)) { alert(`"${nat}" is not a recognized country. Pick one from the list.`); return; }
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

  function parseLine(line: string) {
    // Try tab/comma first
    if (/\t|,/.test(line)) {
      const [j, p, n, a, o, na, si] = line.split(/\t|,/).map((c) => c.trim());
      return { j, p, n, a, o, na, si };
    }
    // Fall back to space-separated with regex:
    // # POS NAME(1+ words) AGE OVR NAT(1+ words) SINCE
    const m = /^(\S+)\s+(\S+)\s+(.+?)\s+(\d{1,2})\s+(\d{2,3})\s+(.+?)\s+(\d{4})\s*$/.exec(line.trim());
    if (m) return { j: m[1], p: m[2], n: m[3], a: m[4], o: m[5], na: m[6], si: m[7] };
    return null;
  }
  async function bulkPaste() {
    if (!paste.trim()) return;
    setBusy(true); setStatus('Parsing…');
    const rows = paste.split('\n').map((l) => l.trim()).filter(Boolean).map((line) => {
      const parts = parseLine(line);
      if (!parts) return null;
      return { season_id: seasonId, name_snapshot: parts.n ?? '', jersey: Number(parts.j) || null, position: parts.p || null, age: Number(parts.a) || null, ovr: Number(parts.o) || null, nationality_snapshot: parts.na || null, since_year: Number(parts.si) || null, role };
    }).filter((r): r is NonNullable<typeof r> => !!r && !!r.name_snapshot);
    if (!rows.length) { setBusy(false); setStatus('Nothing to import — check format'); return; }
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
        <button onClick={() => setMode(mode === 'paste' ? 'idle' : 'paste')} className={`text-xs rounded-full px-3 py-1.5 flex items-center gap-1.5 ${mode === 'paste' ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-700 hover:border-emerald-400'}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></svg>
          Bulk import
        </button>
        {prevSeasonId && <button onClick={copyPrevious} disabled={busy} className="text-xs border border-slate-300 dark:border-slate-700 hover:border-emerald-400 rounded-full px-3 py-1.5 flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
          Copy previous season
        </button>}
        <button disabled className="text-xs border border-slate-200 dark:border-slate-800 text-slate-400 rounded-full px-3 py-1.5 cursor-not-allowed flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
          Upload photo (v1.7)
        </button>
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
          <Autocomplete value={nat} onChange={(v) => setNat(v)} options={COUNTRY_NAMES.map((n) => ({ value: n, label: n }))} placeholder="NAT" />
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
