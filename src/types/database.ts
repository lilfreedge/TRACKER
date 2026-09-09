// Types matching the SQL schema (001_initial_schema.sql)

export type SquadRole = 'starting' | 'bench' | 'reserve' | 'loaned';

export interface CareerSave {
  id: string;
  owner_email: string;
  name: string;
  notes: string | null;
  is_active: boolean;
  game_edition: string;
  created_at: string;
}

export interface Season {
  id: string;
  save_id: string;
  label: string;
  team_id: string | null;
  team_name_snapshot: string | null;
  team_color: string | null;
  team_text_color: string | null;
  formation: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  notes: string | null;
  created_at: string;
}

export interface SquadPlayer {
  id: string;
  season_id: string;
  player_id: string | null;
  name_snapshot: string;
  jersey: number | null;
  position: string | null;
  age: number | null;
  ovr: number | null;
  nationality_snapshot: string | null;
  since_year: number | null;
  role: SquadRole;
  formation_slot: number | null;
  canterano_status: string | null;
  photo_url: string | null;
  notes: string | null;
  salary_amount: number | null;
  salary_currency: string | null;
  salary_period: 'week' | 'year' | null;
  contract_ends: number | null;
  salary_notes: string | null;
  created_at: string;
}

export interface PlayerSalaryHistoryRow {
  player_name: string;
  save_id: string;
  season_label: string;
  team: string | null;
  role: string;
  ovr: number | null;
  amount: number;
  currency: string;
  period: string;
  contract_ends: number | null;
  notes: string | null;
  source: 'squad' | 'ex_players';
  created_at: string;
}

export interface SeasonResult {
  id: string;
  season_id: string;
  competition_id: string | null;
  competition_name_snapshot: string;
  result: string | null;
  opponent: string | null;
  score: string | null;
  notes: string | null;
  created_at: string;
}

export interface NationalSquadEntry {
  id: string;
  season_id: string;
  country: string;
  intl_label: string | null;
  player_name: string;
  club: string | null;
  jersey: number | null;
  position: string | null;
  age: number | null;
  ovr: number | null;
  called_since: number | null;
  club_since: number | null;
  note: string | null;
  role: SquadRole;
  created_at: string;
}

export interface Transfer {
  id: string;
  season_id: string;
  player_name: string;
  direction: 'in' | 'out';
  from_team: string | null;
  to_team: string | null;
  amount: string | null;
  transfer_type: string | null;
  note: string | null;
  created_at: string;
}

export interface Injury {
  id: string;
  season_id: string;
  player_name: string;
  injury_type: string | null;
  duration: string | null;
  replaced_by: string | null;
  note: string | null;
  date: string | null;
  created_at: string;
}

export interface ExPlayer {
  id: string;
  season_id: string;
  player_name: string;
  position: string | null;
  ovr: number | null;
  current_team: string | null;
  value: string | null;
  seasons_played: number | null;
  year_gone: number | null;
  created_at: string;
}

export interface CompetitionChampion {
  id: string;
  save_id: string;
  competition_name: string;
  team_name: string;
  team_country: string | null;
  wins: number;
  runners_up: number;
  years_won: string | null;
  years_runner_up: string | null;
  created_at: string;
}
