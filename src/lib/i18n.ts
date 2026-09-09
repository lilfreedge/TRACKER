import { useSyncExternalStore } from 'react';

export type Lang = 'es' | 'en';

const STORAGE_KEY = 'lang';

const dict = {
  en: {
    // header
    app_title: 'Career Tracker',
    tagline: 'EA Sports FC',
    // games page
    games: 'Games',
    games_subtitle: 'Pick the game edition you want to work on.',
    new_game: 'New game (e.g. EAFC 27)',
    add: 'Add',
    saves_count: (n: number) => `${n} save${n === 1 ? '' : 's'}`,
    empty_games: 'No games yet. Create one above.',
    // saves page
    back_games: '← Games',
    your_saves: 'Your saves',
    saves_subtitle: 'Each save is an independent career.',
    new_save: 'New save name',
    empty_saves: 'No saves yet in this game. Create one above.',
    delete: 'Delete',
    confirm_delete_save: 'Delete this save and all its data?',
    // save page
    back_saves: '← Saves',
    seasons: 'seasons',
    new_season: 'New season',
    empty_seasons: 'No seasons yet. Add one.',
    label_placeholder: 'e.g. 2038-2039',
    team_placeholder: 'Team (e.g. MANCHESTER UNITED)',
    formation_placeholder: 'Formation (4-3-3)',
    color_placeholder: 'Team color hex (#DA291C)',
    save_btn: 'Save',
    cancel: 'Cancel',
    current: 'Current',
    // season page
    back_save: '← Save',
    starting: 'Starting XI',
    bench: 'Bench',
    reserve: 'Reserve',
    loaned: 'Loaned',
    no_players: 'No players.',
    from: 'from',
    // table headers
    th_num: '#',
    th_pos: 'Pos',
    th_name: 'Name',
    th_age: 'Age',
    th_ovr: 'OVR',
    th_nat: 'Nationality',
    th_since: 'Since',
    loading: 'Loading...',
  },
  es: {
    app_title: 'Career Tracker',
    tagline: 'EA Sports FC',
    games: 'Juegos',
    games_subtitle: 'Elige el juego con el que quieres trabajar.',
    new_game: 'Nuevo juego (ej: EAFC 27)',
    add: 'Añadir',
    saves_count: (n: number) => `${n} partida${n === 1 ? '' : 's'}`,
    empty_games: 'No hay juegos aún. Crea uno arriba.',
    back_games: '← Juegos',
    your_saves: 'Tus partidas',
    saves_subtitle: 'Cada partida es una carrera independiente.',
    new_save: 'Nombre nueva partida',
    empty_saves: 'No hay partidas aún en este juego. Crea una arriba.',
    delete: 'Borrar',
    confirm_delete_save: '¿Borrar esta partida y toda su data?',
    back_saves: '← Partidas',
    seasons: 'temporadas',
    new_season: 'Nueva temporada',
    empty_seasons: 'No hay temporadas aún. Agrega una.',
    label_placeholder: 'ej: 2038-2039',
    team_placeholder: 'Equipo (ej: MANCHESTER UNITED)',
    formation_placeholder: 'Formación (4-3-3)',
    color_placeholder: 'Color equipo hex (#DA291C)',
    save_btn: 'Guardar',
    cancel: 'Cancelar',
    current: 'Actual',
    back_save: '← Partida',
    starting: '11 Titular',
    bench: 'Bench',
    reserve: 'Reserva',
    loaned: 'Cedidos',
    no_players: 'Sin jugadores.',
    from: 'desde',
    th_num: '#',
    th_pos: 'Pos',
    th_name: 'Nombre',
    th_age: 'Edad',
    th_ovr: 'OVR',
    th_nat: 'Nacionalidad',
    th_since: 'Desde',
    loading: 'Cargando...',
  },
};

type DictKey = keyof typeof dict.en;

// simple store
let current: Lang = ((typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) as Lang) || 'en';
const listeners = new Set<() => void>();

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
function getSnapshot(): Lang { return current; }

export function setLang(l: Lang) {
  current = l;
  try { localStorage.setItem(STORAGE_KEY, l); } catch {}
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
