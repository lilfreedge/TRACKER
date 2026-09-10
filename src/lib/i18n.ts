import { useSyncExternalStore } from 'react';
export type Lang = 'es' | 'en';
const KEY = 'lang';
const dict = {
  en: {
    app_title: 'Video juegos y más', tagline: 'EA Sports FC',
    games: 'Games', games_subtitle: 'Pick the game edition you want to work on.',
    new_game: 'New game (e.g. EAFC 27)', add: 'Add',
    saves_count: (n: number) => `${n} save${n === 1 ? '' : 's'}`,
    empty_games: 'No games yet. Create one above.',
    back_games: '← Games', your_saves: 'Your saves',
    saves_subtitle: 'Each save is an independent career.',
    new_save: 'New save name', empty_saves: 'No saves yet in this game. Create one above.',
    delete: 'Delete', confirm_delete_save: 'Delete this save and all its data?',
    back_saves: '← Saves', seasons: 'seasons', new_season: 'New season',
    empty_seasons: 'No seasons yet. Add one.',
    label_placeholder: 'e.g. 2038-2039', team_placeholder: 'Team',
    formation_placeholder: 'Formation (4-3-3)', color_placeholder: 'Team color hex',
    club_since_placeholder: 'Since year (e.g. 2037)',
    national_team_placeholder: 'National team (optional)',
    national_since_placeholder: 'National since year',
    save_btn: 'Save', cancel: 'Cancel', current: 'Current',
    back_save: '← Save', starting: 'Starting XI', bench: 'Bench',
    reserve: 'Reserve', loaned: 'Loaned', no_players: 'No players.',
    from: 'from', since: 'since',
    th_num: '#', th_pos: 'Pos', th_name: 'Name', th_age: 'Age', th_ovr: 'OVR',
    th_nat: 'Nationality', th_since: 'Since',
    loading: 'Loading…', settings: 'Settings',
    career: 'Career', current_season: 'Current season', competition: 'Competition',
    rivals: 'Rivals', dashboard: 'Dashboard', manager_profile: 'Manager profile',
    club_squad: 'Club Squad', international_squad: 'International Squad',
    no_intl: 'Not managing a national team this season.',
    registered: 'Registered', value: 'Value', wage: 'Wage', per_week: '/wk',
    contract_ends: 'Contract until', salary_history: 'Salary history',
    injuries: 'Injuries', transfers: 'Transfers', ex_players: 'Ex-players',
    objectives: 'Season objectives', awards: 'Awards',
    reason_benched: 'Reason benched',
    reason_lack_minutes: 'Lack of minutes',
    reason_bad_perf: 'Bad performance in club',
    new_rival: 'New rival', rival_placeholder: 'Rival team (e.g. Barcelona)',
    logo_url_placeholder: 'Logo URL (optional)',
    matches: 'Matches', wins: 'Wins', draws: 'Draws', losses: 'Losses',
    goals_for: 'GF', goals_against: 'GA', new_match: 'New match',
    manager_name: 'Manager name', nickname: 'Nickname', started_year: 'Career started',
    nationality: 'Nationality', bio: 'Bio', upload_photo: 'Upload photo',
    remove_photo: 'Remove photo',
  },
  es: {
    app_title: 'Video juegos y más', tagline: 'EA Sports FC',
    games: 'Juegos', games_subtitle: 'Elige el juego con el que quieres trabajar.',
    new_game: 'Nuevo juego (ej: EAFC 27)', add: 'Añadir',
    saves_count: (n: number) => `${n} partida${n === 1 ? '' : 's'}`,
    empty_games: 'No hay juegos aún. Crea uno arriba.',
    back_games: '← Juegos', your_saves: 'Tus partidas',
    saves_subtitle: 'Cada partida es una carrera independiente.',
    new_save: 'Nombre nueva partida',
    empty_saves: 'No hay partidas aún en este juego. Crea una arriba.',
    delete: 'Borrar', confirm_delete_save: '¿Borrar esta partida y toda su data?',
    back_saves: '← Partidas', seasons: 'temporadas', new_season: 'Nueva temporada',
    empty_seasons: 'No hay temporadas aún. Agrega una.',
    label_placeholder: 'ej: 2038-2039', team_placeholder: 'Equipo',
    formation_placeholder: 'Formación (4-3-3)', color_placeholder: 'Color equipo hex',
    club_since_placeholder: 'Año que llegaste',
    national_team_placeholder: 'Selección nacional (opcional)',
    national_since_placeholder: 'Año selección',
    save_btn: 'Guardar', cancel: 'Cancelar', current: 'Actual',
    back_save: '← Partida', starting: '11 Titular', bench: 'Bench',
    reserve: 'Reserva', loaned: 'Cedidos', no_players: 'Sin jugadores.',
    from: 'desde', since: 'desde',
    th_num: '#', th_pos: 'Pos', th_name: 'Nombre', th_age: 'Edad', th_ovr: 'OVR',
    th_nat: 'Nacionalidad', th_since: 'Desde',
    loading: 'Cargando…', settings: 'Ajustes',
    career: 'Carrera', current_season: 'Temporada actual', competition: 'Competición',
    rivals: 'Rivales', dashboard: 'Panel', manager_profile: 'Ficha del DT',
    club_squad: 'Plantilla Club', international_squad: 'Selección Nacional',
    no_intl: 'No estás en ninguna selección esta temporada.',
    registered: 'Registrada', value: 'Valor', wage: 'Sueldo', per_week: '/sem',
    contract_ends: 'Contrato hasta', salary_history: 'Historial de sueldos',
    injuries: 'Lesiones', transfers: 'Transferencias', ex_players: 'Ex-jugadores',
    objectives: 'Objetivos', awards: 'Premios',
    reason_benched: 'Motivo bench',
    reason_lack_minutes: 'Falta de minutos',
    reason_bad_perf: 'Mal rendimiento',
    new_rival: 'Nuevo rival', rival_placeholder: 'Rival (ej: Barcelona)',
    logo_url_placeholder: 'URL logo (opcional)',
    matches: 'Partidos', wins: 'Victorias', draws: 'Empates', losses: 'Derrotas',
    goals_for: 'GF', goals_against: 'GC', new_match: 'Nuevo partido',
    manager_name: 'Nombre del DT', nickname: 'Apodo', started_year: 'Inicio carrera',
    nationality: 'Nacionalidad', bio: 'Bio', upload_photo: 'Subir foto',
    remove_photo: 'Quitar foto',
  },
};
type DictKey = keyof typeof dict.en;
let current: Lang = ((typeof localStorage !== 'undefined' && localStorage.getItem(KEY)) as Lang) || 'en';
const listeners = new Set<() => void>();
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
function getSnapshot(): Lang { return current; }
export function setLang(l: Lang) {
  current = l;
  try { localStorage.setItem(KEY, l); } catch {}
  listeners.forEach((fn) => fn());
}
export function useLang() {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const t = (key: DictKey, ...args: any[]) => {
    const v = (dict[lang] as any)[key];
    if (typeof v === 'function') return v(...args);
    return v ?? key;
  };
  return { lang, setLang, t };
}
