import { useEffect, useRef, useState } from 'react';
export interface AutoOption { value: string; label?: string; meta?: any; crest_url?: string; color?: string; aliases?: string[]; }
interface Props { value: string; onChange: (v: string, picked?: AutoOption) => void; options: AutoOption[]; placeholder?: string; className?: string; maxSuggestions?: number; onPick?: (opt: AutoOption) => void; }
function score(text: string, q: string): number {
  const t = text.toLowerCase(); const query = q.toLowerCase().trim(); if (!query) return 0;
  if (t.startsWith(query)) return 100 - Math.abs(t.length - query.length);
  if (t.includes(query)) return 60 - t.indexOf(query);
  let ti = 0, hits = 0;
  for (const ch of query) { const idx = t.indexOf(ch, ti); if (idx < 0) return -1; hits += idx === ti ? 3 : 1; ti = idx + 1; }
  return hits;
}
export default function Autocomplete({ value, onChange, options, placeholder, className, maxSuggestions = 8, onPick }: Props) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const q = value.trim();
  const suggestions = q ? options.map((o) => { const targets = [o.value, o.label ?? '', ...(o.aliases ?? [])].filter(Boolean); const s = Math.max(...targets.map((t) => score(t, q))); return { o, s }; }).filter((r) => r.s >= 0).sort((a, b) => b.s - a.s).slice(0, maxSuggestions).map((r) => r.o) : [];
  useEffect(() => {
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  function pick(o: AutoOption) { onChange(o.label ?? o.value, o); onPick?.(o); setOpen(false); }
  return (
    <div className="relative" ref={ref}>
      <input value={value} onChange={(e) => { onChange(e.target.value); setOpen(true); setActiveIdx(0); }} onFocus={() => setOpen(true)}
        onKeyDown={(e) => { if (!open || !suggestions.length) return; if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1)); } else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); } else if (e.key === 'Enter') { e.preventDefault(); pick(suggestions[activeIdx]); } else if (e.key === 'Escape') { setOpen(false); } }}
        placeholder={placeholder}
        className={className ?? 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-slate-100 w-full'} />
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((o, i) => (
            <button type="button" key={o.value + i} onMouseEnter={() => setActiveIdx(i)} onMouseDown={(e) => { e.preventDefault(); pick(o); }}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${i === activeIdx ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}>
              {o.crest_url && <img src={o.crest_url} alt="" className="w-5 h-5 rounded-sm object-contain" />}
              {o.color && !o.crest_url && <div className="w-3 h-3 rounded-sm" style={{ background: o.color }} />}
              <span className="flex-1">{o.label ?? o.value}</span>
              {o.meta?.country && <span className="text-xs text-slate-400">{o.meta.country}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
