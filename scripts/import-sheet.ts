// Seed script — creates the first save with the current Man United 37-38 season.
// This is intentionally minimal for now: enough to see real data in the app.
// Later we can extend to parse the whole ARSEN-LEVER-DEPOR sheet.
//
// Usage:
//   npm install
//   cp .env.example .env         # keys already filled by defaults
//   npm run import-sheet

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const url = process.env.VITE_SUPABASE_URL!;
const anon = process.env.VITE_SUPABASE_ANON_KEY!;
const ownerEmail = process.env.VITE_OWNER_EMAIL || 'felipetorreira2@gmail.com';

if (!url || !anon) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const sb = createClient(url, anon);

async function main() {
  console.log('→ Creating save ARSEN-LEVER-DEPOR...');
  const { data: save, error: saveErr } = await sb
    .from('career_saves')
    .insert({
      name: 'ARSEN-LEVER-DEPOR',
      owner_email: ownerEmail,
      notes: 'Imported from Google Sheet',
    })
    .select()
    .single();
  if (saveErr) throw saveErr;
  console.log('  save id:', save.id);

  console.log('→ Creating season 2037-2038 · MANCHESTER UNITED...');
  const { data: season, error: seErr } = await sb
    .from('seasons')
    .insert({
      save_id: save.id,
      label: '2037-2038',
      team_name_snapshot: 'MANCHESTER UNITED',
      team_color: '#DA291C',
      team_text_color: '#FBE122',
      formation: '4-3-3',
      start_date: '2037-08',
      is_current: true,
    })
    .select()
    .single();
  if (seErr) throw seErr;
  console.log('  season id:', season.id);

  const starting = [
    { pos: 'LW',  name: 'IBRAHIM MBAYE',   ovr: 85, age: 30, nat: 'FRANCE',  slot: 1 },
    { pos: 'ST',  name: 'SEŠKO',           ovr: 87, age: null, nat: 'SLOVAKIA', slot: 2 },
    { pos: 'RW',  name: 'YERAY VARELA',    ovr: 84, age: null, nat: null, slot: 3 },
    { pos: 'CAM', name: 'MOLEIRO',         ovr: 86, age: 29, nat: 'SPAIN', slot: 4 },
    { pos: 'CAM', name: 'AMAD',            ovr: 83, age: null, nat: null, slot: 5 },
    { pos: 'CM',  name: 'MAINOO',          ovr: null, age: null, nat: null, slot: 6 },
    { pos: 'LB',  name: 'CAS FRANÇOIS',    ovr: 88, age: 21, nat: 'BELGIUM', slot: 7, jersey: 2 },
    { pos: 'CB',  name: 'ARCE',            ovr: 79, age: null, nat: null, slot: 8 },
    { pos: 'CB',  name: 'MOURIÑO',         ovr: 84, age: null, nat: null, slot: 9 },
    { pos: 'RB',  name: 'BURNETT',         ovr: 65, age: null, nat: null, slot: 10 },
    { pos: 'GK',  name: 'SENNE LAMMENS',   ovr: 87, age: 30, nat: 'BELGIUM', slot: 11, jersey: 1 },
  ];
  const bench = [
    { pos: 'CAM', name: 'CUNHA',           ovr: 78 },
    { pos: 'CAM', name: 'MOORHOUSE',       ovr: 69 },
    { pos: 'CM',  name: 'LEROUX',          ovr: 78 },
    { pos: 'CDM', name: 'OYEDELE',         ovr: 81 },
    { pos: 'CM',  name: 'VITINHA',         ovr: 79 },
    { pos: 'CDM', name: 'THOMASSEN',       ovr: 79 },
    { pos: 'LB',  name: 'ALUKO',           ovr: 79 },
    { pos: 'CB',  name: 'FREDRICSON',      ovr: 80 },
  ];

  console.log('→ Inserting titulares...');
  const startRows = starting.map((p) => ({
    season_id: season.id,
    name_snapshot: p.name,
    position: p.pos,
    ovr: p.ovr,
    age: p.age,
    nationality_snapshot: p.nat,
    role: 'starting' as const,
    formation_slot: p.slot,
    jersey: (p as any).jersey ?? null,
  }));
  const benchRows = bench.map((p) => ({
    season_id: season.id,
    name_snapshot: p.name,
    position: p.pos,
    ovr: p.ovr,
    role: 'bench' as const,
  }));

  const { error: sqErr } = await sb.from('squad_players').insert([...startRows, ...benchRows]);
  if (sqErr) throw sqErr;

  console.log(`✓ Done. Inserted ${startRows.length} titulares + ${benchRows.length} bench.`);
  console.log(`\nOpen the app and you should see save "${save.name}" with season 2037-2038.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
