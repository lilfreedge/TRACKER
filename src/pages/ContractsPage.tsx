import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import Loading from '../components/Loading';
import Autocomplete, { type AutoOption } from '../components/Autocomplete';

interface Contract { id: string; save_id: string; team_name: string; team_color: string | null; team_crest_url: string | null; team_catalog_id?: string | null; contract_type?: 'club' | 'international'; signed_year: number | null; signed_month: number | null; ended_year: number | null; ended_month: number | null; monthly_salary: number | null; monthly_salary_currency: string | null; notes: string | null; created_at: string; }
interface TeamRow { id: string; name: string; country: string | null; primary_color: string | null; text_color: string | null; crest_url: string | null; aliases: string[] | null; }
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const empty = { team: '', color: '#059669', crest: '', catalogId: null as string | null, signedMonth: '', signedYear: '', endedMonth: '', endedYear: '', salary: '', contractType: 'club' as 'club' | 'international' };

function ContractCard({ c, onEdit, onDel, onResign, durationText }: { c: any; onEdit: () => void; onDel: () => void; onResign?: () => void; durationText: (c: any) => string }) {
  const endedDate = c.ended_year ? `${c.ended_month ? MONTHS[c.ended_month - 1] + ' ' : ''}${c.ended_year}` : null;
  return (
    <div className={`flex items-center gap-3 border rounded-lg p-3 hover:border-emerald-400 transition ${c.ended_year ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 opacity-80' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
      <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden shrink-0" style={{ background: c.team_color ?? '#0f172a' }}>
        {c.team_crest_url ? <img src={c.team_crest_url} alt="" className="w-full h-full object-contain p-1" /> : <span className="text-white font-bold">{c.team_name.slice(0, 2).toUpperCase()}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium flex items-center gap-2 flex-wrap">
          <span>{c.team_name}</span>
          {c.contract_type === 'international' ? (
            <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded">🌍 Intl</span>
          ) : (
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 rounded">🏟 Club</span>
          )}
          {endedDate && <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-200 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded">Ended · {durationText(c)}</span>}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">
          {c.signed_month ? `${MONTHS[c.signed_month - 1]} ` : ''}{c.signed_year ?? '?'}
          {endedDate ? ` → ${endedDate}` : ''}
          {c.monthly_salary != null ? ` · ${c.monthly_salary_currency ?? 'EUR'} ${Number(c.monthly_salary).toLocaleString()}/mo` : ''}
        </div>
      </div>
      {onResign && <button onClick={onResign} className="text-xs text-slate-500 hover:text-amber-600 border border-slate-200 dark:border-slate-700 hover:border-amber-500 rounded-full px-2 py-1" title="Resign">🚪 Resign</button>}
      <button onClick={onEdit} className="text-xs text-slate-500 hover:text-emerald-600 px-2" title="Edit">✎</button>
      <button onClick={onDel} className="text-xs text-slate-400 hover:text-red-500 px-2" title="Delete">×</button>
    </div>
  );
}

export default function ContractsPage() {
  const { saveId } = useParams();
  const { t } = useLang();
  const [rows, setRows] = useState<Contract[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null); // 'new' | contract id | null
  const [f, setF] = useState({ ...empty });

  async function load() {
    if (!saveId) return;
    setLoading(true);
    const [{ data: cs }, { data: cats }] = await Promise.all([
      supabase.from('contracts').select('*').eq('save_id', saveId).order('signed_year', { ascending: false }),
      supabase.from('team_catalog').select('*').order('name', { ascending: true }),
    ]);
    setRows((cs ?? []) as Contract[]); setTeams((cats ?? []) as TeamRow[]); setLoading(false);
  }
  useEffect(() => { load(); }, [saveId]);

  function openNew() { setF({ ...empty }); setEditing('new'); }
  function openEdit(c: Contract) {
    setF({
      team: c.team_name, color: c.team_color ?? '#059669', crest: c.team_crest_url ?? '',
      catalogId: c.team_catalog_id ?? null,
      signedMonth: c.signed_month ? String(c.signed_month) : '',
      signedYear: c.signed_year ? String(c.signed_year) : '',
      endedMonth: c.ended_month ? String(c.ended_month) : '',
      endedYear: c.ended_year ? String(c.ended_year) : '',
      salary: c.monthly_salary != null ? String(c.monthly_salary) : '',
      contractType: c.contract_type ?? 'club',
    });
    setEditing(c.id);
  }
  function cancel() { setEditing(null); setF({ ...empty }); }

  async function save() {
    if (!saveId || !f.team.trim()) return;
    // Guard: only one active contract per type (club / international)
    if (editing === 'new') {
      const existingActive = rows.find((c) => !c.ended_year && (c.contract_type ?? 'club') === f.contractType);
      if (existingActive) {
        alert(`You already have an active ${f.contractType} contract with ${existingActive.team_name}. Resign from it first.`);
        return;
      }
    }
    const payload: any = { save_id: saveId, team_name: f.team.trim(), team_color: f.color || null, team_crest_url: f.crest || null, team_catalog_id: f.catalogId, contract_type: f.contractType, signed_year: f.signedYear ? Number(f.signedYear) : null, signed_month: f.signedMonth ? Number(f.signedMonth) : null, ended_year: f.endedYear ? Number(f.endedYear) : null, ended_month: f.endedMonth ? Number(f.endedMonth) : null, monthly_salary: f.salary ? Number(f.salary) : null };
    let error;
    let newContract: any = null;
    if (editing === 'new') {
      const ins = await supabase.from('contracts').insert(payload).select().maybeSingle();
      error = ins.error; newContract = ins.data;
    } else {
      ({ error } = await supabase.from('contracts').update(payload).eq('id', editing!));
    }
    if (error) { alert(error.message); return; }

    // Auto-create a matching season for new contracts if none exists yet.
    // Club contracts create a full season (label=Season YYYY-YYYY, is_current=true).
    // International contracts merge into the CURRENT season by writing the
    // national_team fields (since they run in parallel with the club season).
    if (newContract && f.signedYear) {
      const y = Number(f.signedYear);
      if (f.contractType === 'international') {
        const { data: cur } = await supabase.from('seasons').select('id').eq('save_id', saveId).eq('is_current', true).maybeSingle();
        if (cur) {
          await supabase.from('seasons').update({ national_team: f.team.trim(), national_team_color: f.color || null, national_team_since_year: y, national_since_month: f.signedMonth ? Number(f.signedMonth) : null }).eq('id', cur.id);
        } else {
          alert('International contract saved. Create a club season first so we can attach the national team info.');
        }
      } else {
        const label = `Season ${y}-${y + 1}`;
        const { data: existing } = await supabase.from('seasons').select('id').eq('save_id', saveId).eq('label', label).maybeSingle();
        if (!existing) {
          await supabase.from('seasons').insert({
            save_id: saveId,
            label,
            team_id: f.catalogId,
            team_name_snapshot: f.team.trim(),
            team_color: f.color || null,
            club_since_year: y,
            club_since_month: f.signedMonth ? Number(f.signedMonth) : null,
            contract_id: newContract.id ?? null,
            is_current: true,
          });
          await supabase.from('seasons').update({ is_current: false }).eq('save_id', saveId).neq('label', label);
        }
      }
    }
    cancel(); load();
  }
  async function del(id: string) { if (!confirm('Delete?')) return; await supabase.from('contracts').delete().eq('id', id); load(); }
  async function resign(c: Contract) {
    const now = new Date();
    const yStr = prompt(`Resign from ${c.team_name}. End year:`, String(now.getFullYear()));
    if (!yStr) return;
    const mStr = prompt('End month (1-12):', String(now.getMonth() + 1));
    if (!mStr) return;
    const y = Number(yStr); const m = Number(mStr);
    if (!y || !m || m < 1 || m > 12) { alert('Invalid date'); return; }
    const { error } = await supabase.from('contracts').update({ ended_year: y, ended_month: m }).eq('id', c.id);
    if (error) { alert(error.message); return; }
    load();
  }
  function durationText(c: Contract): string {
    if (!c.signed_year || !c.ended_year) return '';
    const start = c.signed_year * 12 + (c.signed_month ?? 1);
    const end = c.ended_year * 12 + (c.ended_month ?? 12);
    const months = Math.max(0, end - start);
    const years = Math.floor(months / 12);
    const rem = months % 12;
    if (years === 0) return `${rem} mo`;
    if (rem === 0) return `${years} yr${years === 1 ? '' : 's'}`;
    return `${years}y ${rem}m`;
  }
  const active = rows.filter((c) => !c.ended_year);
  const past = rows.filter((c) => c.ended_year);

  const teamOptions: AutoOption[] = teams.map((tt) => ({ value: tt.name, label: tt.name, aliases: tt.aliases ?? [], crest_url: tt.crest_url ?? undefined, color: tt.primary_color ?? undefined, meta: { country: tt.country, primary_color: tt.primary_color, text_color: tt.text_color, crest_url: tt.crest_url, id: tt.id } }));
  if (loading) return <Loading />;

  const Form = (
    <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-lg p-4 mb-4 grid gap-2 sm:grid-cols-2">
      <div className="sm:col-span-2 flex gap-2 mb-1">
        <button type="button" onClick={() => setF((p) => ({ ...p, contractType: 'club' }))} className={`flex-1 text-sm rounded-lg px-3 py-2 border transition ${f.contractType === 'club' ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400'}`}>🏟 Club</button>
        <button type="button" onClick={() => setF((p) => ({ ...p, contractType: 'international' }))} className={`flex-1 text-sm rounded-lg px-3 py-2 border transition ${f.contractType === 'international' ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 dark:border-slate-700 hover:border-blue-400'}`}>🌍 International</button>
      </div>
      <Autocomplete value={f.team} onChange={(v, opt) => { setF((p) => ({ ...p, team: v, color: opt?.meta?.primary_color ?? p.color, crest: opt?.meta?.crest_url ?? p.crest, catalogId: opt?.meta?.id ?? p.catalogId })); }} options={teamOptions} placeholder={f.contractType === 'international' ? 'National team (e.g. Senegal)' : 'Team (type to search)'} />
      <div className="flex gap-2 items-center">
        <input type="color" value={f.color} onChange={(e) => setF({ ...f, color: e.target.value })} className="w-10 h-10 rounded border border-slate-300 dark:border-slate-700" />
        <input value={f.color} onChange={(e) => setF({ ...f, color: e.target.value })} placeholder="#hex" className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
      </div>
      <select value={f.signedMonth} onChange={(e) => setF({ ...f, signedMonth: e.target.value })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm">
        <option value="">Signed month…</option>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
      </select>
      <input value={f.signedYear} onChange={(e) => setF({ ...f, signedYear: e.target.value })} placeholder="Signed year" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
      <input value={f.salary} onChange={(e) => setF({ ...f, salary: e.target.value })} placeholder="Monthly salary (EUR)" type="number" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
      <input value={f.crest} onChange={(e) => setF({ ...f, crest: e.target.value })} placeholder="Crest URL" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
      <select value={f.endedMonth} onChange={(e) => setF({ ...f, endedMonth: e.target.value })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm">
        <option value="">Ended month (optional)…</option>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
      </select>
      <input value={f.endedYear} onChange={(e) => setF({ ...f, endedYear: e.target.value })} placeholder="Ended year (optional)" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
      <div className="sm:col-span-2 flex justify-end gap-2"><button onClick={cancel} className="px-3 py-2 text-sm text-slate-500">Cancel</button><button onClick={save} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-4 py-2 text-sm">{editing === 'new' ? 'Save' : 'Update'}</button></div>
    </div>
  );

  return (
    <div>
      <Link to={`/save/${saveId}`} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm">{t('back_save')}</Link>
      <div className="mt-2 mb-6 flex items-start justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Contracts</h1>
        <button onClick={openNew} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-4 py-2 text-sm font-medium">+ New contract</button>
      </div>
      {editing === 'new' && Form}
      {rows.length === 0 ? (
        <div className="text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded p-8 text-center bg-white dark:bg-slate-900">No contracts yet.</div>
      ) : (
        <div className="grid gap-6">
          {/* ACTIVE */}
          <div>
            <div className="text-xs uppercase tracking-wide text-emerald-600 font-semibold mb-2">🟢 Active {active.length > 0 && <span className="text-slate-400 font-normal">({active.length})</span>}</div>
            {active.length === 0 ? (
              <div className="text-slate-400 text-xs italic border border-dashed border-slate-200 dark:border-slate-800 rounded p-3 bg-white dark:bg-slate-900">No active contracts.</div>
            ) : (
              <div className="grid gap-3">{active.map((c) => editing === c.id ? <div key={c.id}>{Form}</div> : (
                <ContractCard key={c.id} c={c} onEdit={() => openEdit(c)} onDel={() => del(c.id)} onResign={() => resign(c)} durationText={durationText} />
              ))}</div>
            )}
          </div>
          {/* PAST */}
          {past.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">📁 Previous <span className="text-slate-400 font-normal">({past.length})</span></div>
              <div className="grid gap-3">{past.map((c) => editing === c.id ? <div key={c.id}>{Form}</div> : (
                <ContractCard key={c.id} c={c} onEdit={() => openEdit(c)} onDel={() => del(c.id)} durationText={durationText} />
              ))}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
