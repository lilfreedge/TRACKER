import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { CareerSave, Season } from '../types/database';

export default function SavePage() {
  const { saveId } = useParams();
  const [save, setSave] = useState<CareerSave | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!saveId) return;
    setLoading(true);
    const [{ data: s }, { data: se }] = await Promise.all([
      supabase.from('career_saves').select('*').eq('id', saveId).single(),
      supabase.from('seasons').select('*').eq('save_id', saveId).order('label', { ascending: false }),
    ]);
    setSave(s);
    setSeasons(se ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [saveId]);

  if (loading) return <div className="text-slate-400">Cargando...</div>;
  if (!save) return <div className="text-slate-400">Save no encontrado. <Link to="/" className="text-blue-400">Volver</Link></div>;

  return (
    <div>
      <div className="mb-6">
        <Link to="/" className="text-slate-500 hover:text-slate-300 text-sm">← Partidas</Link>
        <h1 className="text-2xl font-bold mt-2">{save.name}</h1>
        <p className="text-slate-400 text-sm">{seasons.length} temporadas</p>
      </div>

      {seasons.length === 0 ? (
        <div className="text-slate-400 border border-dashed border-slate-800 rounded p-8 text-center">
          Este save no tiene temporadas aún.
        </div>
      ) : (
        <div className="grid gap-3">
          {seasons.map((s) => (
            <Link
              key={s.id}
              to={`/season/${s.id}`}
              className="border border-slate-800 rounded p-4 flex items-center gap-3 hover:border-slate-700"
            >
              {s.team_color && (
                <div className="w-2 h-10 rounded-sm" style={{ background: s.team_color }} />
              )}
              <div className="flex-1">
                <div className="font-medium">{s.label}</div>
                <div className="text-slate-400 text-sm">
                  {s.team_name_snapshot || '—'} {s.formation ? `· ${s.formation}` : ''}
                </div>
              </div>
              {s.is_current && (
                <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">Actual</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
