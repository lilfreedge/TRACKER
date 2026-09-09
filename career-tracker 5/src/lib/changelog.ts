export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.3.0',
    date: '2026-09-09',
    changes: [
      'Logo cropped to a square and made larger + emerald ring in header.',
      'Hero tiles: new Lucide-style SVG icons, muted color palette (blue/emerald/amber/rose), no more emojis.',
      'Reorder mode: reorder hero tiles + seasons with up/down chevrons. Order persists.',
      'Season cards more compact (3 per row on desktop) with team name to the left.',
      'New Season form: auto-fills the next label from the previous season, removed team/color/since fields, only asks for national team + since date.',
      'Contracts (new page + button): team, color, crest, signed month/year, monthly salary. Team autocomplete brings color + logo.',
      'Team catalog: 45+ pre-seeded clubs (Premier / La Liga / Serie A / Bundesliga / Ligue 1 / +) with crest and primary color.',
      'Rivals logos now proxied via images.weserv.nl so they always render.',
      'Player profile: "🔄 Buscar foto" button calls /api/fetch-photo (FUTBIN + Wikipedia).',
      'Defensive fix: Add buttons in Games / Saves show explicit error alerts and console logs instead of silently failing.',
      'Migration 009 restores open RLS on core tables (in case auth migration was applied by accident).',
      'Historical seasons seeded: Depor 25-30, Arsenal 33-36, Brighton Aug-Dec 36, Napoli Feb-Jun 37.',
      'Compare Seasons page (side-by-side squad, avg OVR, stayed/left/new).',
      'Global Search (top-right 🔍) across players, seasons, saves, and rivals.',
      'Dashboard: real stats — trophies, runners-up, top 8 OVR, avg OVR, career length.',
      'Rivals: team autocomplete from catalog (color + logo auto-filled).',
      'Save page: More links row (Dashboard · Compare · Contracts · Manager).',
    ],
  },
  {
    version: '1.2.1',
    date: '2026-09-09',
    changes: [
      'Loading screen: giant avatar (up to 560px), no circular frame, pulse + shimmer animation.',
      'Season page: three new tabs — Injuries, Transfers (IN / OUT), Ex-players. Fully editable in-app.',
      'Serverless endpoint /api/fetch-photo prepared for future auto-photo lookup (FUTBIN + Wikipedia).',
    ],
  },
  {
    version: '1.2.0',
    date: '2026-09-09',
    changes: [
      'Rebrand: "Video juegos y más" with new logo throughout.',
      'SavePage redesign: hero tiles Career / Current Season / Competition / Rivals.',
      'Player profile page (EAFC card style): photo, position, name, age, flag, value, wage.',
      'Season header: club "since YYYY", international tab disabled when no national team.',
      'Registration date behind an ⓘ icon in the season card.',
      'Loading avatar bigger (240px) and vertically centered.',
      'Rivals: create rivals with logo, log matches, see W-D-L record + goals for/against.',
      'Manager profile: editable in-app (photo, name, career start year, nationality, bio).',
      'Injuries, transfers and ex-players sections in season.',
      'Salary + contract editable per player + salary history view.',
      'Season summary carry-over (previous season results auto-populate).',
      '"Reason why benched" badge (LACK OF MINUTES / BAD PERF).',
      'Nationality flags 🇫🇷 🇪🇸 🇧🇷 everywhere.',
      'Player seed for Manchester United 2037-2038 now has jerseys, ages, nationalities filled.',
    ],
  },
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
export const APP_NAME = 'Video juegos y más';
