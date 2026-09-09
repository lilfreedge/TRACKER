import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, OWNER_EMAIL } from '../lib/supabase';
import type { CareerSave } from '../types/database';

export default function SavesPage() {
  const [saves, setSaves] = useState<CareerSave[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('career_saves')
      .select('*')
      .eq('owner_email', OWNER_EMAIL)
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    setSaves(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createSave() {
    const name = newName.trim();
    if (!name) return;
    const { error } = await supabase.from('career_saves').insert({
      name,
      owner_email: OWNER_EMAIL,
    });
    if (error) { alert(error.message); return; }
    setNewName('');
    load();
  }

  async function deleteSave(id: string) {
    if (!confirm('Borrar este save y toda su data?')) return;
    const { error } = await supabase.from('career_saves').delete().eq('id', id);
    if (error) { alert(error.message); return; }
    load();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Tus partidas</h1>
        <p className="text-slate-400 text-sm">Cada save es una carrera independiente. Puedes tener varias en paralelo.</p>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nombre nueva partida"
          className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm"
          onKeyDown={(e) => { if (e.key === 'Enter') createSave(); }}
        />
        <button
          onClick={createSave}
          className="bg-blue-600 hover:bg-blue-500 rounded px-4 py-2 text-sm font-medium"
        >
          Crear
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400">Cargando...</div>
      ) : saves.length === 0 ? (
        <div className="text-slate-400 border border-dashed border-slate-800 rounded p-8 text-center">
          No hay partidas aún. Crea una arriba, o importa tu sheet con <code className="bg-slate-800 px-1 rounded">npm run import-sheet</code>.
        </div>
      ) : (
        <div className="grid gap-3">
          {saves.map((s) => (
            <div key={s.id} className="border border-slate-800 rounded p-4 flex items-center gap-3 hover:border-slate-700">
              <Link to={`/save/${s.id}`} className="flex-1">
                <div className="font-medium">{s.name}</div>
                <div className="text-slate-500 text-xs mt-0.5">
                  {new Date(s.created_at).toLocaleDateString()}
                </div>
              </Link>
              <button
                onClick={() => deleteSave(s.id)}
                className="text-slate-500 hover:text-red-400 text-sm"
              >
                Borrar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
