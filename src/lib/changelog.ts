export interface ChangelogEntry {
  version: string;
  date: string;      // ISO-ish
  changes: string[]; // bullet points
}

// Add newest version on TOP. Keep it in sync with the app version.
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.1.0',
    date: '2026-09-09',
    changes: [
      'New home: Games (EAFC 26, EAFC 27, ...). Saves live under a game.',
      'Light theme + dark theme toggle.',
      'Language toggle EN / ES (default EN).',
      'Settings modal (gear icon, top right).',
      'Add-new-season button inside each save.',
      'Season page tabs: Club Squad / International Squad.',
      'Loading screen with avatar.',
      'Salary + contract fields on players. Salary history view.',
    ],
  },
  // v2 planned: multi-user login (username + password) with per-user data isolation.
  {
    version: '1.0.0',
    date: '2026-09-09',
    changes: [
      'First deploy on Vercel.',
      'Save ARSEN-LEVER-DEPOR imported with Manchester United 2037-2038 (11 titular + 8 bench).',
      'Supabase schema: saves, seasons, squad, results, injuries, transfers, ex-players, championships.',
    ],
  },
];

export const APP_VERSION = CHANGELOG[0].version;
