import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import Loading from '../components/Loading';
import Autocomplete, { type AutoOption } from '../components/Autocomplete';
interface Contract { id: string; save_id: string; team_name: string; team_color: string | null; team_crest_url: string | null; signed_year: number | null; signed_month: number | null; monthly_salary: number | null; monthly_salary_currency: string | null; notes: string | null; created_at: string; }
interface TeamRow { id: string; name: string; country: string | null; primary_color: string | null; text_color: string | null; crest_url: string | null; aliases: string[] | null; }
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export default function ContractsPage() {
  const { saveId } = useParams();
  const { t } = useLang();
  const [rows, setRows] = useState<Contract[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [team, setTeam] = useState('');
  const [color, setColor] = useState('#059669');
  const [crest, setCrest] = useState('');
  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [signedMonth, setSignedMonth] = useState('');
  const [signedYear, setSignedYear] = useState('');
  const [salary, setSalary] = useState('');
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
  async function add() {
    if (!saveId || !team.trim()) return;
    const payload = { save_id: saveId, team_name: team.trim(), team_color: color || null, team_crest_url: crest || null, team_catalog_id: catalogId, signed_year: signedYear ? Number(signedYear) : null, signed_month: signedMonth ? Number(signedMonth) : null, monthly_salary: salary ? Number(salary) : null };
    const { error } = await supabase.from('contracts').insert(payload);
    if (error) { alert(error.message); return; }
    setTeam(''); setColor('#059669'); setCrest(''); setCatalogId(null); setSignedMonth(''); setSignedYear(''); setSalary(''); setShowForm(false); load();
  }
  async function del(id: string) { if (!confirm('Delete?')) return; await supabase.from('contracts').delete().eq('id', id); load(); }
  const teamOptions: AutoOption[] = teams.map((tt) => ({ value: tt.name, label: tt.name, aliases: tt.aliases ?? [], crest_url: tt.crest_url ?? undefined, color: tt.primary_color ?? undefined, meta: { country: tt.country, primary_color: tt.primary_color, text_color: tt.text_color, crest_url: tt.crest_url, id: tt.id } }));
  if (loading) return <Loading />;
  return (
    <div>
      <Link to={`/save/${saveId}`} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm">{t('back_save')}</Link>
      <div className="mt-2 mb-6 flex items-start justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Contracts</h1>
        <button onClick={() => setShowForm((v) => !v)} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-4 py-2 text-sm font-medium">+ New contract</button>
      </div>
      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 mb-6 grid gap-2 sm:grid-cols-2">
          <Autocomplete value={team} onChange={(v, opt) => { setTeam(v); if (opt) { if (opt.meta?.primary_color) setColor(opt.meta.primary_color); if (opt.meta?.crest_url) setCrest(opt.meta.crest_url); if (opt.meta?.id) setCatalogId(opt.meta.id); } }} options={teamOptions} placeholder="Team (type to search)" />
          <div className="flex gap-2 items-center">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 rounded border border-slate-300 dark:border-slate-700" />
            <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="#hex" className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          </div>
          <select value={signedMonth} onChange={(e) => setSignedMonth(e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm">
            <option value="">Signed month…</option>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <input value={signedYear} onChange={(e) => setSignedYear(e.target.value)} placeholder="Signed year" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="Monthly salary (EUR)" type="number" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input value={crest} onChange={(e) => setCrest(e.target.value)} placeholder="Crest URL" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <div className="sm:col-span-2 flex justify-end gap-2"><button onClick={() => setShowForm(false)} className="px-3 py-2 text-sm text-slate-500">Cancel</button><button onClick={add} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-4 py-2 text-sm">Save</button></div>
        </div>
      )}
      {rows.length === 0 ? (
        <div className="text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded p-8 text-center bg-white dark:bg-slate-900">No contracts yet.</div>
      ) : (
        <div className="grid gap-3">{rows.map((c) => (
          <div key={c.id} className="flex items-center gap-3 border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-white dark:bg-slate-900">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden shrink-0" style={{ background: c.team_color ?? '#0f172a' }}>
              {c.team_crest_url ? <img src={c.team_crest_url} alt="" className="w-full h-full object-contain p-1" /> : <span className="text-white font-bold">{c.team_name.slice(0,2).toUpperCase()}</span>}
            </div>
            <div className="flex-1 min-w-0"><div className="font-medium">{c.team_name}</div><div className="text-xs text-slate-500 mt-0.5">{c.signed_month ? `${MONTHS[c.signed_month - 1]} ` : ''}{c.signed_year ?? '?'}{c.monthly_salary != null ? ` · ${c.monthly_salary_currency ?? 'EUR'} ${Number(c.monthly_salary).toLocaleString()}/mo` : ''}</div></div>
            <button onClick={() => del(c.id)} className="text-xs text-red-500">×</button>
          </div>
        ))}</div>
      )}
    </div>
  );
}
