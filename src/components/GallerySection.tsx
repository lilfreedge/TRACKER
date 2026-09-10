import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Photo { id: string; season_id: string; url: string; caption: string | null; created_at: string; }

export default function GallerySection({ seasonId }: { seasonId: string }) {
  const [rows, setRows] = useState<Photo[]>([]);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('season_photos').select('*').eq('season_id', seasonId).order('created_at', { ascending: false });
    setRows((data ?? []) as Photo[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, [seasonId]);

  async function upload(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const path = `${seasonId}/${Date.now()}.${ext}`;
      const { error: e1 } = await supabase.storage.from('season-photos').upload(path, file, { cacheControl: '3600', upsert: false });
      if (e1) throw e1;
      const { data: pub } = supabase.storage.from('season-photos').getPublicUrl(path);
      const { error: e2 } = await supabase.from('season_photos').insert({ season_id: seasonId, url: pub.publicUrl, caption: caption.trim() || null });
      if (e2) throw e2;
      setCaption(''); load();
    } catch (e: any) { alert(e.message ?? String(e)); }
    setUploading(false);
  }
  async function del(p: Photo) {
    if (!confirm('Delete photo?')) return;
    await supabase.from('season_photos').delete().eq('id', p.id); load();
  }

  if (loading) return <div className="text-slate-400 py-6 text-center text-sm">Loading…</div>;

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto] mb-4">
        <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption (optional)" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
        <label className={`bg-emerald-600 hover:bg-emerald-500 text-white rounded px-4 py-2 text-sm font-medium cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
          {uploading ? 'Uploading…' : '📷 Upload'}
          <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.currentTarget.value = ''; }} />
        </label>
      </div>
      {rows.length === 0 ? (
        <div className="text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded p-6 text-center text-sm bg-white dark:bg-slate-900">No photos yet.</div>
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">{rows.map((p) => (
          <div key={p.id} className="group relative rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-square">
            <img src={p.url} alt={p.caption ?? ''} className="w-full h-full object-cover" />
            {p.caption && <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white text-xs">{p.caption}</div>}
            <button onClick={() => del(p)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-sm">×</button>
          </div>
        ))}</div>
      )}
    </div>
  );
}
