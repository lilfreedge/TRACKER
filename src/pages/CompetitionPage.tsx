import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import Loading from '../components/Loading';

interface Competition { id: string; save_id: string; name: string; logo_url: string | null; hidden: boolean; sort_order: number | null; }

export default function CompetitionPage() {
  const { saveId } = useParams();
  const { t } = useLang();
  const [rows, setRows] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHidden, setShowHidden] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLogo, setNewLogo] = useState('');
  const dragId = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  async function load() {
    if (!saveId) return;
    setLoading(true);
    const { data } = await supabase.from('save_competitions').select('*').eq('save_id', saveId).order('sort_order', { ascending: true });
    setRows((data ?? []) as Competition[]); setLoading(false);
  }
  useEffect(() => { load(); }, [saveId]);

  const visible = rows.filter((r) => !r.hidden);
  const hidden = rows.filter((r) => r.hidden);
  const list = showHidden ? hidden : visible;

  async function toggleHidden(c: Competition) {
    await supabase.from('save_competitions').update({ hidden: !c.hidden }).eq('id', c.id); load();
  }
  async function del(c: Competition) {
    if (!confirm(`Delete ${c.name}?`)) return;
    await supabase.from('save_competitions').delete().eq('id', c.id); load();
  }
  async function addCompetition() {
    if (!saveId || !newName.trim()) return;
    const maxOrder = rows.reduce((m, r) => Math.max(m, r.sort_order ?? 0), 0);
    const { error } = await supabase.from('save_competitions').insert({ save_id: saveId, name: newName.trim(), logo_url: newLogo.trim() || null, sort_order: maxOrder + 1 });
    if (error) { alert(error.message); return; }
    setNewName(''); setNewLogo(''); setShowAdd(false); load();
  }
  async function onDrop(targetId: string) {
    const sourceId = dragId.current;
    setDraggingId(null); setOverId(null); dragId.current = null;
    if (!sourceId || sourceId === targetId) return;
    const src = rows.findIndex((r) => r.id === sourceId);
    const tgt = rows.findIndex((r) => r.id === targetId);
    if (src < 0 || tgt < 0) return;
    const next = [...rows];
    const [moved] = next.splice(src, 1);
    next.splice(tgt, 0, moved);
    setRows(next);
    await Promise.all(next.map((r, i) => supabase.from('save_competitions').update({ sort_order: i + 1 }).eq('id', r.id)));
  }

  if (loading) return <Loading />;

  return (
    <div>
      <Link to={`/save/${saveId}`} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm">{t('back_save')}</Link>
      <div className="mt-2 mb-6 flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">{showHidden ? 'Hidden leagues' : t('competition')}</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowHidden((v) => !v)} className="border border-slate-300 dark:border-slate-700 hover:border-emerald-400 rounded-lg px-3 py-2 text-xs font-medium transition">
            {showHidden ? `← Visible (${visible.length})` : `👁 Hidden (${hidden.length})`}
          </button>
          <button onClick={() => setShowAdd((v) => !v)} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-4 py-2 text-sm font-medium">+ Add</button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-lg p-4 mb-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCompetition()} placeholder="League name" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <input value={newLogo} onChange={(e) => setNewLogo(e.target.value)} placeholder="Logo URL (optional)" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm" />
          <div className="flex gap-2"><button onClick={() => setShowAdd(false)} className="text-sm px-3 py-2 text-slate-500">Cancel</button><button onClick={addCompetition} className="bg-emerald-600 text-white rounded px-4 py-2 text-sm">Save</button></div>
        </div>
      )}

      {list.length === 0 ? (
        <div className="text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center bg-white dark:bg-slate-900">
          {showHidden ? 'No hidden leagues.' : 'No leagues yet. Click + Add to create one.'}
        </div>
      ) : (
        <div className="grid gap-2">
          {list.map((c) => {
            const isDragging = draggingId === c.id;
            const isOver = overId === c.id && draggingId !== c.id;
            return (
              <div key={c.id}
                draggable
                onDragStart={(e) => { dragId.current = c.id; setDraggingId(c.id); try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', c.id); } catch {} }}
                onDragEnd={() => { setDraggingId(null); setOverId(null); }}
                onDragEnter={() => setOverId(c.id)}
                onDragOver={(e) => { e.preventDefault(); }}
                onDragLeave={(e) => { if (overId === c.id) { const t = e.relatedTarget as Node | null; if (!t || !(e.currentTarget as Node).contains(t)) setOverId(null); } }}
                onDrop={() => onDrop(c.id)}
                style={{ transform: isDragging ? 'scale(1.02)' : isOver ? 'translateY(-2px)' : 'none', transition: 'transform 150ms ease, box-shadow 150ms ease, opacity 150ms ease', opacity: isDragging ? 0.6 : 1 }}
                className={`select-none flex items-center gap-3 bg-white dark:bg-slate-900 border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md ${isOver ? 'border-emerald-500 shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-emerald-400'} ${c.hidden ? 'opacity-60' : ''}`}>
                <div className="text-slate-300 hover:text-slate-500 transition" title="Drag to reorder">
                  <svg width="14" height="18" viewBox="0 0 12 18" fill="currentColor"><circle cx="3" cy="3" r="1.4" /><circle cx="9" cy="3" r="1.4" /><circle cx="3" cy="9" r="1.4" /><circle cx="9" cy="9" r="1.4" /><circle cx="3" cy="15" r="1.4" /><circle cx="9" cy="15" r="1.4" /></svg>
                </div>
                <div className="w-8 h-8 rounded flex items-center justify-center bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden">
                  {c.logo_url ? <img src={c.logo_url} alt="" className="w-full h-full object-contain p-0.5" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} /> : <span className="text-[10px] font-bold text-slate-400">{c.name.slice(0, 2).toUpperCase()}</span>}
                </div>
                <Link to={`/save/${saveId}/competition/${encodeURIComponent(c.name)}`} className="flex-1 min-w-0 font-medium truncate hover:text-emerald-600 transition">{c.name}</Link>
                <button onClick={() => toggleHidden(c)} className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2" title={c.hidden ? 'Show' : 'Hide'}>{c.hidden ? '👁' : '👁‍🗨'}</button>
                <button onClick={() => del(c)} className="text-xs text-slate-400 hover:text-red-500 px-2" title="Delete">×</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
