export interface ChangelogEntry { version: string; date: string; changes: string[]; }
export const CHANGELOG: ChangelogEntry[] = [
  { version: '1.3.0', date: '2026-09-09', changes: [
    'Rebrand: "Video juegos y más" with logo throughout.',
    'Logo cropped to 512x512 (centered on face) with emerald ring in header.',
    'Hero tiles: SVG icons + muted palette (blue/emerald/amber/rose), no emojis.',
    'Reorder mode: reorder hero tiles and seasons with up/down arrows.',
    'Compact season cards (3 per row) with team name to the left.',
    'New Season form: auto-fills next season label, only asks national team + since date.',
    'Contracts (new page): team autocomplete → auto-fills color and logo.',
    'Team catalog: 40+ pre-seeded top European clubs with color and crest.',
    'Rivals: autocomplete for team + logos via images.weserv.nl proxy.',
    'Player profile: EAFC-style card + "🔄 Buscar foto" button (FUTBIN + Wikipedia).',
    'Historical seasons seeded: Depor 25-30, Arsenal 33-36, Brighton, Napoli.',
    'Compare Seasons page (side-by-side squad diff).',
    'Global Search (top-right 🔍) across players, seasons, saves, rivals.',
    'Dashboard: real stats — trophies, runners-up, top 8 OVR, avg OVR.',
    'Language toggle EN / ES, dark / light theme toggle.',
    'Settings modal with Manager Profile link + changelog.',
    'Season tabs: Club Squad, International Squad, Injuries, Transfers, Ex-players.',
    'Salary + contract fields on players + salary history view.',
    'Defensive Add button: explicit error alerts and console logs.',
  ] },
];
export const APP_VERSION = CHANGELOG[0].version;
export const APP_NAME = 'Video juegos y más';
