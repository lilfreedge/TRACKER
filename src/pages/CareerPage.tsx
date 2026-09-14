import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import Loading from '../components/Loading';
import type { CareerSave } from '../types/database';

interface Contract { id: string; save_id: string; team_name: string; team_color: string | null; team_crest_url: string | null; contract_type?: 'club' | 'international'; signed_year: number | null; signed_month: number | null; ended_year: number | null; ended_month: number | null; }
interface AwardRow { id: string; award_name: string; category: string | null; recipient: string | null; year: number | null; notes: string | null; }
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function CareerPage() {
  const { saveId } = useParams();
  const { t } = useLang();
  const [save, setSave] = useState<CareerSave | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [awards, setAwards] = useState<AwardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [addAward, setAddAward] = useState(false);
  const [af, setAf] = useState<Partial<AwardRow>>({});

  async function load() {
    if (!saveId) return;
    setLoading(true);
    const [{ data: s }, { data: cs }, { data: aw }] = await Promise.all([
      supabase.from('career_saves').select('*').eq('id', saveId).single(),
      supabase.from('contracts').select('*').eq('save_id', saveId).order('signed_year', { ascending: false }),
      supabase.from('awards').select('*').eq('save_id', saveId).order('year', { ascending: false }),
    ]);
    setSave(s); setContracts((cs ?? []) as Contract[]); setAwards((aw ?? []) as AwardRow[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, [saveId]);

  async function saveAward() {
    if (!saveId || !af.award_name) return;
    const payload: any = { save_id: saveId, award_name: af.award_name, category: af.category ?? null, recipient: af.recipient ?? null, year: af.year ? Number(af.year) : null, notes: af.notes ?? null };
    const { error } = await supabase.from('awards').insert(payload);
    if (error) { alert(error.message); return; }
    setAf({}); setAddAward(false); load();
  }
  async function delAward(id: string) { if (!confirm('Delete?')) return; await supabase.from('awards').delete().eq('id', id); load(); }

  if (loading) return <Loading />;
  if (!save) return null;
  const clubs = contracts.filter((c) => (c.contract_type ?? 'club') === 'club');
  const intls = contracts.filter((c) => (c.contract_type ?? 'club') === 'international');
  const durationText = (c: Contract) => { if (!c.signed_year) return ''; const startY = c.signed_year, endY = c.ended_year ?? new Date().getFullYear(); const start = startY * 12 + (c.signed_month ?? 1); const end = endY * 12 + (c.ended_month ?? new Date().getMonth() + 1); const months = Math.max(0, end - start); const y = Math.floor(months / 12); const m = months % 12; if (y === 0) return `${m} mo`; if (m === 0) return `${y}y`; return `${y}y ${m}m`; };

  return (
    <div>
      <Link to={`/save/${saveId}`} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm">{t('back_save')}</Link>
      <h1 className="text-2xl font-bold mt-2 mb-6 text-center">Whole Career · {save.name}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {[['Clubs', clubs.length], ['Countries', intls.length], ['Awards', awards.length], ['Since', clubs.length ? Math.min(...clubs.map((c) => c.signed_year ?? 9999)) : '—']].map(([l, v]) => (
          <div key={l as string} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-3">
            <div className="text-[10px] uppercase text-slate-500 tracking-wide">{l}</div>
            <div className="text-xl font-bold mt-0.5">{v as any}</div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <div className="text-xs uppercase text-slate-500 font-semibold mb-2">🏟 Clubs</div>
        {clubs.length === 0 ? (
          <div className="text-slate-400 text-xs italic border border-dashed border-slate-200 dark:border-slate-800 rounded p-3 bg-white dark:bg-slate-900">No club contracts yet.</div>
        ) : (
          <div className="grid gap-2">{clubs.map((c) => (
            <div key={c.id} className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
              <div className="w-10 h-10 rounded shrink-0 flex items-center justify-center overflow-hidden" style={{ background: c.team_color ?? '#0f172a' }}>
                {c.team_crest_url ? <img src={c.team_crest_url} alt="" className="w-full h-full object-contain p-1" /> : <span className="text-white text-xs font-bold">{c.team_name.slice(0, 2).toUpperCase()}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{c.team_name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {c.signed_month ? MONTHS[c.signed_month - 1] + ' ' : ''}{c.signed_year ?? '?'}
                  {c.ended_year ? ` → ${c.ended_month ? MONTHS[c.ended_month - 1] + ' ' : ''}${c.ended_year}` : ' → present'}
                  <span className="text-slate-400"> · {durationText(c)}</span>
                </div>
              </div>
              {!c.ended_year && <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 rounded">Active</span>}
            </div>
          ))}</div>
        )}
      </div>

      {intls.length > 0 && (
        <div className="mb-6">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-2">🌍 International</div>
          <div className="grid gap-2">{intls.map((c) => (
            <div key={c.id} className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
              <div className="w-10 h-10 rounded shrink-0 flex items-center justify-center overflow-hidden" style={{ background: c.team_color ?? '#0f172a' }}>
                {c.team_crest_url ? <img src={c.team_crest_url} alt="" className="w-full h-full object-contain p-1" /> : <span className="text-white text-xs font-bold">{c.team_name.slice(0, 2).toUpperCase()}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{c.team_name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {c.signed_month ? MONTHS[c.signed_month - 1] + ' ' : ''}{c.signed_year ?? '?'}
                  {c.ended_year ? ` → ${c.ended_month ? MONTHS[c.ended_month - 1] + ' ' : ''}${c.ended_year}` : ' → present'}
                  <span className="text-slate-400"> · {durationText(c)}</span>
                </div>
              </div>
              {!c.ended_year && <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded">Active</span>}
            </div>
          ))}</div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs uppercase text-slate-500 font-semibold">🏆 Awards</div>
          <button onClick={() => setAddAward((v) => !v)} className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded px-3 py-1">+ Add</button>
        </div>
        {addAward && (
          <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded p-3 mb-3 grid gap-2 sm:grid-cols-2">
            <input autoFocus placeholder="Award name (e.g. Ballon d'Or)" value={af.award_name ?? ''} onChange={(e) => setAf({ ...af, award_name: e.target.value })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
            <input placeholder="Category (Manager / Player / Team)" value={af.category ?? ''} onChange={(e) => setAf({ ...af, category: e.target.value })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
            <input placeholder="Recipient" value={af.recipient ?? ''} onChange={(e) => setAf({ ...af, recipient: e.target.value })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
            <input placeholder="Year" type="number" value={af.year ?? ''} onChange={(e) => setAf({ ...af, year: e.target.value as any })} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
            <input placeholder="Notes" value={af.notes ?? ''} onChange={(e) => setAf({ ...af, notes: e.target.value })} className="sm:col-span-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
            <div className="sm:col-span-2 flex justify-end gap-2"><button onClick={() => setAddAward(false)} className="text-sm text-slate-500 px-3">Cancel</button><button onClick={saveAward} className="bg-emerald-600 text-white rounded px-3 py-1 text-sm">Save</button></div>
          </div>
        )}
        {awards.length === 0 ? (
          <div className="text-slate-400 text-xs italic border border-dashed border-slate-200 dark:border-slate-800 rounded p-3 bg-white dark:bg-slate-900">No awards yet.</div>
        ) : (
          <div className="grid gap-2">{awards.map((a) => (
            <div key={a.id} className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-lg">🏆</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{a.award_name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{[a.category, a.recipient, a.year].filter(Boolean).join(' · ')}</div>
                {a.notes && <div className="text-xs text-slate-400 mt-0.5 truncate">{a.notes}</div>}
              </div>
              <button onClick={() => delAward(a.id)} className="text-xs text-slate-400 hover:text-red-500">×</button>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}
