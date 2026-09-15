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
  logo_url?: string; // brand logo (generic, no year)
  implemented: boolean;
}

export const GAME_TYPES: GameType[] = [
  { id: 'eafc',           label: 'EA Sports FC',   description: 'Career mode: seasons, squads, transfers, rivals, contracts.', color: 'from-emerald-600 to-teal-700', logo_url: 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/e/eb/EA_Sports_FC_logo.svg/1200px-EA_Sports_FC_logo.svg.png', implemented: true },
  { id: 'marvel-rivals',  label: 'Marvel Rivals',  description: 'Coming soon — ranked runs, heroes, stats.',                    color: 'from-red-600 to-purple-800',   logo_url: 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/a/a5/Marvel_Rivals_logo.svg/1200px-Marvel_Rivals_logo.svg.png', implemented: false },
  { id: 'other',          label: 'Other',          description: 'Custom / generic. Basic saves + notes only.',                  color: 'from-slate-600 to-slate-800',  implemented: true },
];

export function getGameType(id: string | null | undefined): GameType {
  return GAME_TYPES.find((g) => g.id === id) ?? GAME_TYPES[0];
}
