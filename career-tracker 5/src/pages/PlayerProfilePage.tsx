import { useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import { flagFor, niceName } from '../lib/countries';
import Loading from '../components/Loading';
import type { SquadPlayer } from '../types/database';

interface SalaryHistoryRow {
  season_label: string;
  team: string | null;
  role: string;
  ovr: number | null;
  amount: number;
  currency: string;
  period: string;
  contract_ends: number | null;
}

export default function PlayerProfilePage() {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const [p, setP] = useState<SquadPlayer | null>(null);
  const [history, setHistory] = useState<SalaryHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<SquadPlayer>>({});

  async function load() {
    if (!playerId) return;
    setLoading(true);
    const { data: cur } = await supabase.from('squad_players').select('*').eq('id', playerId).single();
    setP(cur);
    setForm(cur ?? {});
    if (cur) {
      const { data: h } = await supabase
        .from('player_salary_history')
        .select('season_label, team, role, ovr, amount, currency, period, contract_ends')
        .eq('player_name', cur.name_snapshot)
        .order('season_label', { ascending: true });
      setHistory((h ?? []) as any);
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, [playerId]);

  async function save() {
    if (!playerId) return;
    const patch: any = {};
    ['jersey','position','age','ovr','nationality_snapshot','since_year','salary_amount','salary_currency','salary_period','contract_ends','market_value','market_value_currency','photo_url','benched_reason']
      .forEach((k) => { if (form[k as keyof SquadPlayer] !== undefined) patch[k] = form[k as keyof SquadPlayer]; });
    const { error } = await supabase.from('squad_players').update(patch).eq('id', playerId);
    if (error) { alert(error.message); return; }
    setEditing(false);
    load();
  }

  async function uploadPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !playerId) return;
    const path = `${playerId}-${Date.now()}.${file.name.split('.').pop()}`;
    const { error: upErr } = await supabase.storage.from('player-photos').upload(path, file, { upsert: true });
    if (upErr) { alert(upErr.message); return; }
    const { data: pub } = supabase.storage.from('player-photos').getPublicUrl(path);
    setForm({ ...form, photo_url: pub.publicUrl });
  }

  async function autoFetchPhoto() {
    if (!p) return;
    try {
      const r = await fetch(`/api/fetch-photo?name=${encodeURIComponent(p.name_snapshot)}`);
      const j = await r.json();
      if (j.url) {
        const patch = { photo_url: j.url };
        await supabase.from('squad_players').update(patch).eq('id', p.id);
        setForm({ ...form, photo_url: j.url });
        setP({ ...p, photo_url: j.url });
      } else {
        alert('No photo found for ' + p.name_snapshot);
      }
    } catch (e: any) {
      alert('Error fetching photo: ' + (e?.message ?? String(e)));
    }
  }

  if (loading) return <Loading />;
  if (!p) return <div className="text-slate-500">Player not found.</div>;

  const fmtMoney = (n: number | null | undefined, ccy: string | null | undefined) =>
    n == null ? '—' : `${ccy ?? 'EUR'} ${Number(n).toLocaleString()}`;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm mb-4">← Back</button>

      {/* EAFC-style card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 flex gap-6 flex-wrap sm:flex-nowrap">
          <div className="w-40 h-40 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center shrink-0">
            {p.photo_url ? (
              <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl">👤</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 justify-between">
              <div className="text-6xl font-black text-emerald-600 leading-none">{p.ovr ?? '?'}</div>
              <div className="text-2xl font-bold text-slate-600 dark:text-slate-300">{p.position ?? '?'}</div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{p.name_snapshot}</div>
              <div className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                <span>{p.age ?? '?'} yrs</span>
                <span>·</span>
                <span className="text-lg">{flagFor(p.nationality_snapshot)}</span>
                <span>{niceName(p.nationality_snapshot)}</span>
                {p.jersey != null && (<><span>·</span><span>#{p.jersey}</span></>)}
              </div>
            </div>
          </div>
        </div>
        {/* Financial */}
        <div className="border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-slate-950">
          <div>
            <div className="text-xs uppercase text-slate-500 dark:text-slate-400 mb-1">{t('value')}</div>
            <div className="text-lg font-semibold">{fmtMoney(p.market_value, p.market_value_currency)}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-slate-500 dark:text-slate-400 mb-1">{t('wage')}</div>
            <div className="text-lg font-semibold">
              {fmtMoney(p.salary_amount, p.salary_currency)}
              <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">{p.salary_period === 'year' ? '/yr' : t('per_week')}</span>
            </div>
            {p.contract_ends && (
              <div className="text-xs text-slate-500 mt-1">{t('contract_ends')}: {p.contract_ends}</div>
            )}
          </div>
        </div>
      </div>

      {/* Edit + Fetch photo buttons */}
      <div className="mt-4 flex gap-3 items-center">
        <button
          onClick={() => setEditing((v) => !v)}
          className="text-sm text-emerald-600 hover:text-emerald-700"
        >
          {editing ? t('cancel') : 'Edit'}
        </button>
        <button
          onClick={autoFetchPhoto}
          className="text-sm text-blue-600 hover:text-blue-700"
          title="Auto-fetch photo from internet"
        >
          🔄 Buscar foto
        </button>
      </div>

      {editing && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 mt-2 grid gap-2 sm:grid-cols-2">
          <label className="text-xs text-slate-500 sm:col-span-2">{t('upload_photo')}
            <input type="file" accept="image/*" onChange={uploadPhoto} className="block w-full mt-1 text-sm" />
          </label>
          <TextField label="Jersey" value={form.jersey ?? ''} onChange={(v) => setForm({ ...form, jersey: v ? Number(v) : null })} />
          <TextField label="Position" value={form.position ?? ''} onChange={(v) => setForm({ ...form, position: v })} />
          <TextField label="Age" value={form.age ?? ''} onChange={(v) => setForm({ ...form, age: v ? Number(v) : null })} />
          <TextField label="OVR" value={form.ovr ?? ''} onChange={(v) => setForm({ ...form, ovr: v ? Number(v) : null })} />
          <TextField label="Nationality" value={form.nationality_snapshot ?? ''} onChange={(v) => setForm({ ...form, nationality_snapshot: v })} />
          <TextField label="Since year" value={form.since_year ?? ''} onChange={(v) => setForm({ ...form, since_year: v ? Number(v) : null })} />
          <TextField label={t('wage')} value={form.salary_amount ?? ''} onChange={(v) => setForm({ ...form, salary_amount: v ? Number(v) : null })} />
          <TextField label={t('value')} value={form.market_value ?? ''} onChange={(v) => setForm({ ...form, market_value: v ? Number(v) : null })} />
          <TextField label="Contract ends" value={form.contract_ends ?? ''} onChange={(v) => setForm({ ...form, contract_ends: v ? Number(v) : null })} />
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button onClick={() => setEditing(false)} className="px-3 py-2 text-sm text-slate-500">{t('cancel')}</button>
            <button onClick={save} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-4 py-2 text-sm">{t('save_btn')}</button>
          </div>
        </div>
      )}

      {/* Salary history */}
      {history.length > 0 && (
        <div className="mt-8">
          <div className="text-xs uppercase text-slate-500 dark:text-slate-400 mb-2">{t('salary_history')}</div>
          <div className="border border-slate-200 dark:border-slate-800 rounded overflow-hidden bg-white dark:bg-slate-900">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase">
                <tr>
                  <th className="text-left px-3 py-2">Season</th>
                  <th className="text-left px-3 py-2">Team</th>
                  <th className="text-right px-3 py-2">OVR</th>
                  <th className="text-right px-3 py-2">Wage</th>
                  <th className="text-right px-3 py-2">Ends</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-3 py-2">{h.season_label}</td>
                    <td className="px-3 py-2">{h.team ?? '?'}</td>
                    <td className="px-3 py-2 text-right">{h.ovr ?? '?'}</td>
                    <td className="px-3 py-2 text-right">{h.currency} {Number(h.amount).toLocaleString()}<span className="text-slate-500 text-xs ml-1">{h.period === 'year' ? '/yr' : '/wk'}</span></td>
                    <td className="px-3 py-2 text-right">{h.contract_ends ?? '?'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: any; onChange: (v: string) => void }) {
  return (
    <label className="text-xs text-slate-500">
      {label}
      <input
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
      />
    </label>
  );
}
