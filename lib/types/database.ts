export type Database = {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string;
          name: string;
          short_name: string;
          logo_url: string | null;
          primary_color: string;
          secondary_color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          short_name: string;
          logo_url?: string | null;
          primary_color?: string;
          secondary_color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          short_name?: string;
          logo_url?: string | null;
          primary_color?: string;
          secondary_color?: string;
        };
        Relationships: [];
      };
      seasons: {
        Row: {
          id: string;
          name: string;
          year: number;
          is_active: boolean;
          start_date: string;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          year: number;
          is_active?: boolean;
          start_date: string;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          year?: number;
          is_active?: boolean;
          start_date?: string;
          end_date?: string | null;
        };
        Relationships: [];
      };
      players: {
        Row: {
          id: string;
          team_id: string;
          first_name: string;
          last_name: string;
          jersey_number: number;
          photo_url: string | null;
          positions: string[];
          bats: "R" | "L" | "S";
          throws: "R" | "L";
          date_of_birth: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          first_name: string;
          last_name: string;
          jersey_number: number;
          photo_url?: string | null;
          positions?: string[];
          bats?: "R" | "L" | "S";
          throws?: "R" | "L";
          date_of_birth?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          first_name?: string;
          last_name?: string;
          jersey_number?: number;
          photo_url?: string | null;
          positions?: string[];
          bats?: "R" | "L" | "S";
          throws?: "R" | "L";
          date_of_birth?: string | null;
          is_active?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      games: {
        Row: {
          id: string;
          season_id: string;
          home_team_id: string;
          away_team_id: string;
          game_date: string;
          location: string | null;
          home_score: number | null;
          away_score: number | null;
          innings: number;
          status: "scheduled" | "in_progress" | "final" | "postponed" | "cancelled";
          notes: string | null;
          umpire: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          season_id: string;
          home_team_id: string;
          away_team_id: string;
          game_date: string;
          location?: string | null;
          home_score?: number | null;
          away_score?: number | null;
          innings?: number;
          status?: "scheduled" | "in_progress" | "final" | "postponed" | "cancelled";
          notes?: string | null;
          umpire?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          season_id?: string;
          home_team_id?: string;
          away_team_id?: string;
          game_date?: string;
          location?: string | null;
          home_score?: number | null;
          away_score?: number | null;
          innings?: number;
          status?: "scheduled" | "in_progress" | "final" | "postponed" | "cancelled";
          notes?: string | null;
          umpire?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "games_season_id_fkey";
            columns: ["season_id"];
            isOneToOne: false;
            referencedRelation: "seasons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "games_home_team_id_fkey";
            columns: ["home_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "games_away_team_id_fkey";
            columns: ["away_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      game_innings: {
        Row: {
          id: string;
          game_id: string;
          team_id: string;
          inning: number;
          runs: number;
          hits: number;
          errors: number;
        };
        Insert: {
          id?: string;
          game_id: string;
          team_id: string;
          inning: number;
          runs?: number;
          hits?: number;
          errors?: number;
        };
        Update: {
          id?: string;
          game_id?: string;
          team_id?: string;
          inning?: number;
          runs?: number;
          hits?: number;
          errors?: number;
        };
        Relationships: [
          {
            foreignKeyName: "game_innings_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "game_innings_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      player_game_stats: {
        Row: {
          id: string;
          player_id: string;
          game_id: string;
          team_id: string;
          // Batting
          plate_appearances: number;
          at_bats: number;
          runs: number;
          hits: number;
          doubles: number;
          triples: number;
          home_runs: number;
          rbi: number;
          walks: number;
          strikeouts: number;
          stolen_bases: number;
          caught_stealing: number;
          hit_by_pitch: number;
          sacrifice_flies: number;
          sacrifice_bunts: number;
          ground_into_dp: number;
          left_on_base: number;
          // Fielding
          putouts: number;
          assists: number;
          errors: number;
          double_plays: number;
          passed_balls: number;
          fielding_position: string | null;
          // Pitching
          innings_pitched: number;
          hits_allowed: number;
          runs_allowed: number;
          earned_runs: number;
          walks_allowed: number;
          strikeouts_pitched: number;
          home_runs_allowed: number;
          hit_batters: number;
          wild_pitches: number;
          balks: number;
          batters_faced: number;
          pitch_count: number;
          decision: "W" | "L" | "S" | null;
          // Meta
          batting_order: number | null;
          is_starter: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          game_id: string;
          team_id: string;
          plate_appearances?: number;
          at_bats?: number;
          runs?: number;
          hits?: number;
          doubles?: number;
          triples?: number;
          home_runs?: number;
          rbi?: number;
          walks?: number;
          strikeouts?: number;
          stolen_bases?: number;
          caught_stealing?: number;
          hit_by_pitch?: number;
          sacrifice_flies?: number;
          sacrifice_bunts?: number;
          ground_into_dp?: number;
          left_on_base?: number;
          putouts?: number;
          assists?: number;
          errors?: number;
          double_plays?: number;
          passed_balls?: number;
          fielding_position?: string | null;
          innings_pitched?: number;
          hits_allowed?: number;
          runs_allowed?: number;
          earned_runs?: number;
          walks_allowed?: number;
          strikeouts_pitched?: number;
          home_runs_allowed?: number;
          hit_batters?: number;
          wild_pitches?: number;
          balks?: number;
          batters_faced?: number;
          pitch_count?: number;
          decision?: "W" | "L" | "S" | null;
          batting_order?: number | null;
          is_starter?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          game_id?: string;
          team_id?: string;
          plate_appearances?: number;
          at_bats?: number;
          runs?: number;
          hits?: number;
          doubles?: number;
          triples?: number;
          home_runs?: number;
          rbi?: number;
          walks?: number;
          strikeouts?: number;
          stolen_bases?: number;
          caught_stealing?: number;
          hit_by_pitch?: number;
          sacrifice_flies?: number;
          sacrifice_bunts?: number;
          ground_into_dp?: number;
          left_on_base?: number;
          putouts?: number;
          assists?: number;
          errors?: number;
          double_plays?: number;
          passed_balls?: number;
          fielding_position?: string | null;
          innings_pitched?: number;
          hits_allowed?: number;
          runs_allowed?: number;
          earned_runs?: number;
          walks_allowed?: number;
          strikeouts_pitched?: number;
          home_runs_allowed?: number;
          hit_batters?: number;
          wild_pitches?: number;
          balks?: number;
          batters_faced?: number;
          pitch_count?: number;
          decision?: "W" | "L" | "S" | null;
          batting_order?: number | null;
          is_starter?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "player_game_stats_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_game_stats_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_game_stats_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      player_career_batting: {
        Row: {
          player_id: string;
          first_name: string;
          last_name: string;
          jersey_number: number;
          photo_url: string | null;
          positions: string[];
          team_id: string;
          team_name: string;
          team_short_name: string;
          team_color: string;
          games_played: number;
          pa: number;
          ab: number;
          r: number;
          h: number;
          doubles: number;
          triples: number;
          hr: number;
          rbi: number;
          bb: number;
          so: number;
          sb: number;
          cs: number;
          hbp: number;
          sf: number;
          sac: number;
          gdp: number;
          lob: number;
          singles: number;
          tb: number;
          avg: number;
          obp: number;
          slg: number;
          ops: number;
          babip: number;
          iso: number;
          ab_per_hr: number;
          bb_per_k: number;
          sb_pct: number;
        };
        Relationships: [];
      };
      player_career_pitching: {
        Row: {
          player_id: string;
          first_name: string;
          last_name: string;
          jersey_number: number;
          photo_url: string | null;
          team_id: string;
          team_name: string;
          team_short_name: string;
          team_color: string;
          games_pitched: number;
          games_started: number;
          ip: number;
          h: number;
          r: number;
          er: number;
          bb: number;
          k: number;
          hr_allowed: number;
          hb: number;
          wp: number;
          bk: number;
          bf: number;
          wins: number;
          losses: number;
          saves: number;
          era: number;
          whip: number;
          k_per_7: number;
          bb_per_7: number;
          h_per_7: number;
          k_per_bb: number;
          win_pct: number;
          baa: number;
        };
        Relationships: [];
      };
      player_career_fielding: {
        Row: {
          player_id: string;
          first_name: string;
          last_name: string;
          jersey_number: number;
          team_id: string;
          team_name: string;
          team_short_name: string;
          games_played: number;
          po: number;
          a: number;
          e: number;
          dp: number;
          pb: number;
          tc: number;
          fpct: number;
        };
        Relationships: [];
      };
      team_standings: {
        Row: {
          team_id: string;
          team_name: string;
          short_name: string;
          logo_url: string | null;
          primary_color: string;
          secondary_color: string;
          games_played: number;
          wins: number;
          losses: number;
          home_wins: number;
          home_losses: number;
          away_wins: number;
          away_losses: number;
          runs_scored: number;
          runs_allowed: number;
          run_diff: number;
          win_pct: number;
          games_behind: number;
          pythag_pct: number;
        };
        Relationships: [];
      };
      season_batting_leaders: {
        Row: {
          player_id: string;
          first_name: string;
          last_name: string;
          jersey_number: number;
          photo_url: string | null;
          team_id: string;
          team_name: string;
          team_short_name: string;
          team_color: string;
          season_id: string;
          games_played: number;
          ab: number;
          h: number;
          hr: number;
          rbi: number;
          r: number;
          sb: number;
          bb: number;
          so: number;
          avg: number;
          obp: number;
          slg: number;
        };
        Relationships: [];
      };
      season_pitching_leaders: {
        Row: {
          player_id: string;
          first_name: string;
          last_name: string;
          jersey_number: number;
          photo_url: string | null;
          team_id: string;
          team_name: string;
          team_short_name: string;
          team_color: string;
          season_id: string;
          games_pitched: number;
          ip: number;
          wins: number;
          losses: number;
          saves: number;
          k: number;
          bb: number;
          er: number;
          era: number;
          whip: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
