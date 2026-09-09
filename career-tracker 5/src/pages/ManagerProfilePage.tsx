import { useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, OWNER_EMAIL } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import { flagFor, niceName } from '../lib/countries';
import Loading from '../components/Loading';
import type { ManagerProfile } from '../types/database';

export default function ManagerProfilePage() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [m, setM] = useState<ManagerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<ManagerProfile>>({});

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('manager_profiles').select('*').eq('owner_email', OWNER_EMAIL).maybeSingle();
    setM(data);
    setForm(data ?? { owner_email: OWNER_EMAIL });
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    const payload = { ...form, owner_email: OWNER_EMAIL, updated_at: new Date().toISOString() };
    let error;
    if (m?.id) {
      ({ error } = await supabase.from('manager_profiles').update(payload).eq('id', m.id));
    } else {
      ({ error } = await supabase.from('manager_profiles').insert(payload as any));
    }
    if (error) { alert(error.message); return; }
    load();
  }

  async function uploadPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const path = `${OWNER_EMAIL}-${Date.now()}.${file.name.split('.').pop()}`;
    const { error: upErr } = await supabase.storage.from('manager-photos').upload(path, file, { upsert: true });
    if (upErr) { alert(upErr.message); return; }
    const { data: pub } = supabase.storage.from('manager-photos').getPublicUrl(path);
    setForm({ ...form, photo_url: pub.publicUrl });
  }

  if (loading) return <Loading />;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm mb-4">← Back</button>

      <h1 className="text-2xl font-bold mb-4">{t('manager_profile')}</h1>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex gap-6 flex-wrap sm:flex-nowrap items-start">
        <div className="w-40 h-40 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center shrink-0">
          {form.photo_url ? (
            <img src={form.photo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl">👤</span>
          )}
        </div>
        <div className="flex-1 min-w-0 grid gap-3">
          <label className="text-xs text-slate-500">{t('upload_photo')}
            <input type="file" accept="image/*" onChange={uploadPhoto} className="block w-full mt-1 text-sm" />
          </label>
          <TextField label={t('manager_name')} value={form.display_name ?? ''} onChange={(v) => setForm({ ...form, display_name: v })} />
          <TextField label={t('nickname')} value={form.nickname ?? ''} onChange={(v) => setForm({ ...form, nickname: v })} />
          <TextField label={t('started_year')} value={form.career_started_year ?? ''} onChange={(v) => setForm({ ...form, career_started_year: v ? Number(v) : null })} />
          <TextField label={t('nationality')} value={form.nationality ?? ''} onChange={(v) => setForm({ ...form, nationality: v })} />
          <label className="text-xs text-slate-500">{t('bio')}
            <textarea value={form.bio ?? ''} onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="block w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-slate-100" />
          </label>
          {form.nationality && (
            <div className="text-sm text-slate-500">{flagFor(form.nationality)} {niceName(form.nationality)}</div>
          )}
          <div className="flex justify-end">
            <button onClick={save} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-4 py-2 text-sm">{t('save_btn')}</button>
          </div>
        </div>
      </div>
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
