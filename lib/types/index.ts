import type { Database } from "./database";

// Row types (what we read from DB)
export type Team = Database["public"]["Tables"]["teams"]["Row"];
export type Player = Database["public"]["Tables"]["players"]["Row"];
export type Season = Database["public"]["Tables"]["seasons"]["Row"];
export type Game = Database["public"]["Tables"]["games"]["Row"];
export type GameInning = Database["public"]["Tables"]["game_innings"]["Row"];
export type PlayerGameStats = Database["public"]["Tables"]["player_game_stats"]["Row"];

// Insert types (what we write to DB)
export type TeamInsert = Database["public"]["Tables"]["teams"]["Insert"];
export type PlayerInsert = Database["public"]["Tables"]["players"]["Insert"];
export type SeasonInsert = Database["public"]["Tables"]["seasons"]["Insert"];
export type GameInsert = Database["public"]["Tables"]["games"]["Insert"];
export type GameInningInsert = Database["public"]["Tables"]["game_innings"]["Insert"];
export type PlayerGameStatsInsert = Database["public"]["Tables"]["player_game_stats"]["Insert"];

// Update types
export type TeamUpdate = Database["public"]["Tables"]["teams"]["Update"];
export type PlayerUpdate = Database["public"]["Tables"]["players"]["Update"];
export type SeasonUpdate = Database["public"]["Tables"]["seasons"]["Update"];
export type GameUpdate = Database["public"]["Tables"]["games"]["Update"];
export type GameInningUpdate = Database["public"]["Tables"]["game_innings"]["Update"];
export type PlayerGameStatsUpdate = Database["public"]["Tables"]["player_game_stats"]["Update"];

// View types
export type PlayerCareerBatting = Database["public"]["Views"]["player_career_batting"]["Row"];
export type PlayerCareerPitching = Database["public"]["Views"]["player_career_pitching"]["Row"];
export type PlayerCareerFielding = Database["public"]["Views"]["player_career_fielding"]["Row"];
export type TeamStanding = Database["public"]["Views"]["team_standings"]["Row"];
export type SeasonBattingLeader = Database["public"]["Views"]["season_batting_leaders"]["Row"];
export type SeasonPitchingLeader = Database["public"]["Views"]["season_pitching_leaders"]["Row"];

// Composite types for queries with joins
export type GameWithTeams = Game & {
  home_team: Team;
  away_team: Team;
};

export type PlayerWithTeam = Player & {
  team: Team;
};

export type PlayerGameStatsWithDetails = PlayerGameStats & {
  player: Player;
  game: Game;
};

export type { Database };
