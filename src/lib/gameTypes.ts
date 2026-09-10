// Registry of supported game types.
// Each game type drives the schema/UI for saves inside it.
// Only 'eafc' is implemented today. Adding a new type here is
// a placeholder — the modules per-type would live under
// src/games/<type>/ eventually.

export interface GameType {
  id: string;
  label: string;
  description: string;
  color: string; // tailwind gradient classes
  implemented: boolean;
}

export const GAME_TYPES: GameType[] = [
  { id: 'eafc',           label: 'EAFC (FIFA)',    description: 'Career mode: seasons, squads, transfers, rivals, contracts.', color: 'from-emerald-600 to-teal-700', implemented: true },
  { id: 'marvel-rivals',  label: 'Marvel Rivals',  description: 'Coming soon — ranked runs, heroes, stats.',                    color: 'from-red-600 to-purple-800',   implemented: false },
  { id: 'other',          label: 'Other',          description: 'Custom / generic. Basic saves + notes only.',                  color: 'from-slate-600 to-slate-800',  implemented: true },
];

export function getGameType(id: string | null | undefined): GameType {
  return GAME_TYPES.find((g) => g.id === id) ?? GAME_TYPES[0];
}
