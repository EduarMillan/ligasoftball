-- ============================================================================
-- LIGA SOFTBALL - Schema Completo
-- ============================================================================
-- Ejecutar en Supabase SQL Editor en orden.
-- Este script crea TODA la base de datos desde cero.
-- ============================================================================

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 0. EXTENSIONES
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 1. TABLAS PRINCIPALES
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- -------------------------------------------------------
-- TEAMS (Equipos)
-- -------------------------------------------------------
CREATE TABLE public.teams (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  short_name  TEXT NOT NULL UNIQUE,          -- Abreviatura (3-5 chars): "AGU", "TORO"
  logo_url    TEXT,
  primary_color   TEXT NOT NULL DEFAULT '#f59e0b',  -- Hex color
  secondary_color TEXT NOT NULL DEFAULT '#18181b',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.teams IS 'Equipos de la liga de softball';

-- -------------------------------------------------------
-- SEASONS (Temporadas)
-- -------------------------------------------------------
CREATE TABLE public.seasons (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,                   -- "Temporada 2026", "Torneo de Verano 2026"
  year        INT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT false,  -- Solo 1 temporada activa a la vez
  start_date  DATE NOT NULL,
  end_date    DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.seasons IS 'Temporadas de la liga';

-- Índice parcial: máximo 1 temporada activa
CREATE UNIQUE INDEX idx_seasons_single_active
  ON public.seasons (is_active)
  WHERE is_active = true;

-- -------------------------------------------------------
-- PLAYERS (Jugadores)
-- -------------------------------------------------------
CREATE TABLE public.players (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id        UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  first_name     TEXT NOT NULL,
  last_name      TEXT NOT NULL,
  jersey_number  INT NOT NULL CHECK (jersey_number BETWEEN 0 AND 99),
  photo_url      TEXT,
  positions      TEXT[] NOT NULL DEFAULT '{}',  -- Array: {"SS","2B"}
  bats           TEXT NOT NULL DEFAULT 'R' CHECK (bats IN ('R','L','S')),      -- Right/Left/Switch
  throws         TEXT NOT NULL DEFAULT 'R' CHECK (throws IN ('R','L')),
  date_of_birth  DATE,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Un equipo no puede tener 2 jugadores con el mismo número
  UNIQUE (team_id, jersey_number)
);

COMMENT ON TABLE public.players IS 'Jugadores registrados en la liga';

CREATE INDEX idx_players_team    ON public.players(team_id);
CREATE INDEX idx_players_active  ON public.players(is_active) WHERE is_active = true;
CREATE INDEX idx_players_name    ON public.players(last_name, first_name);

-- -------------------------------------------------------
-- GAMES (Juegos / Partidos)
-- -------------------------------------------------------
CREATE TABLE public.games (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id      UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  home_team_id   UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  away_team_id   UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  game_date      TIMESTAMPTZ NOT NULL,
  location       TEXT,                        -- Nombre del campo / parque
  home_score     INT DEFAULT 0,
  away_score     INT DEFAULT 0,
  innings        INT NOT NULL DEFAULT 7,      -- Softball = 7 innings standard
  status         TEXT NOT NULL DEFAULT 'scheduled'
                   CHECK (status IN ('scheduled','in_progress','final','postponed','cancelled')),
  notes          TEXT,                        -- Notas del juego (lluvia, protesta, etc.)
  umpire         TEXT,                        -- Nombre del árbitro
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Un equipo no puede jugar contra sí mismo
  CHECK (home_team_id != away_team_id)
);

COMMENT ON TABLE public.games IS 'Juegos programados y finalizados';

CREATE INDEX idx_games_season     ON public.games(season_id);
CREATE INDEX idx_games_date       ON public.games(game_date DESC);
CREATE INDEX idx_games_status     ON public.games(status);
CREATE INDEX idx_games_home_team  ON public.games(home_team_id);
CREATE INDEX idx_games_away_team  ON public.games(away_team_id);

-- -------------------------------------------------------
-- GAME_INNINGS (Línea de anotación por inning)
-- -------------------------------------------------------
CREATE TABLE public.game_innings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id     UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  team_id     UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  inning      INT NOT NULL CHECK (inning >= 1),
  runs        INT NOT NULL DEFAULT 0 CHECK (runs >= 0),
  hits        INT NOT NULL DEFAULT 0 CHECK (hits >= 0),
  errors      INT NOT NULL DEFAULT 0 CHECK (errors >= 0),

  -- Solo una entrada por equipo por inning por juego
  UNIQUE (game_id, team_id, inning)
);

COMMENT ON TABLE public.game_innings IS 'Anotación inning por inning para el linescore';

CREATE INDEX idx_game_innings_game ON public.game_innings(game_id);

-- -------------------------------------------------------
-- PLAYER_GAME_STATS (Estadísticas por jugador por juego)
-- La tabla más importante — contiene TODAS las stats
-- -------------------------------------------------------
CREATE TABLE public.player_game_stats (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id       UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  game_id         UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  team_id         UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,

  -- ===================== BATEO / OFFENSE =====================
  plate_appearances   INT NOT NULL DEFAULT 0 CHECK (plate_appearances >= 0),   -- PA (incluye BB, HBP, SF, SAC)
  at_bats             INT NOT NULL DEFAULT 0 CHECK (at_bats >= 0),             -- AB
  runs                INT NOT NULL DEFAULT 0 CHECK (runs >= 0),                -- R  (carreras anotadas)
  hits                INT NOT NULL DEFAULT 0 CHECK (hits >= 0),                -- H
  doubles             INT NOT NULL DEFAULT 0 CHECK (doubles >= 0),             -- 2B
  triples             INT NOT NULL DEFAULT 0 CHECK (triples >= 0),             -- 3B
  home_runs           INT NOT NULL DEFAULT 0 CHECK (home_runs >= 0),           -- HR
  rbi                 INT NOT NULL DEFAULT 0 CHECK (rbi >= 0),                 -- RBI (carreras impulsadas)
  walks               INT NOT NULL DEFAULT 0 CHECK (walks >= 0),               -- BB (bases por bolas)
  strikeouts          INT NOT NULL DEFAULT 0 CHECK (strikeouts >= 0),          -- SO / K
  stolen_bases        INT NOT NULL DEFAULT 0 CHECK (stolen_bases >= 0),        -- SB (bases robadas)
  caught_stealing     INT NOT NULL DEFAULT 0 CHECK (caught_stealing >= 0),     -- CS
  hit_by_pitch        INT NOT NULL DEFAULT 0 CHECK (hit_by_pitch >= 0),        -- HBP (golpeado por lanzamiento)
  sacrifice_flies     INT NOT NULL DEFAULT 0 CHECK (sacrifice_flies >= 0),     -- SF
  sacrifice_bunts     INT NOT NULL DEFAULT 0 CHECK (sacrifice_bunts >= 0),     -- SAC / SH
  ground_into_dp      INT NOT NULL DEFAULT 0 CHECK (ground_into_dp >= 0),      -- GDP / GIDP (doble play)
  left_on_base        INT NOT NULL DEFAULT 0 CHECK (left_on_base >= 0),        -- LOB (dejados en base)

  -- ===================== FILDEO / DEFENSE =====================
  putouts             INT NOT NULL DEFAULT 0 CHECK (putouts >= 0),             -- PO
  assists             INT NOT NULL DEFAULT 0 CHECK (assists >= 0),             -- A
  errors              INT NOT NULL DEFAULT 0 CHECK (errors >= 0),              -- E
  double_plays        INT NOT NULL DEFAULT 0 CHECK (double_plays >= 0),        -- DP (participación en DP)
  passed_balls        INT NOT NULL DEFAULT 0 CHECK (passed_balls >= 0),        -- PB (solo catchers)
  fielding_position   TEXT,                                                     -- Posición jugada en este juego

  -- ===================== PITCHEO / PITCHING =====================
  innings_pitched     NUMERIC(4,1) NOT NULL DEFAULT 0 CHECK (innings_pitched >= 0),  -- IP (ej: 6.2 = 6 innings + 2 outs)
  hits_allowed        INT NOT NULL DEFAULT 0 CHECK (hits_allowed >= 0),              -- H (hits permitidos)
  runs_allowed        INT NOT NULL DEFAULT 0 CHECK (runs_allowed >= 0),              -- R (carreras permitidas)
  earned_runs         INT NOT NULL DEFAULT 0 CHECK (earned_runs >= 0),               -- ER (carreras limpias)
  walks_allowed       INT NOT NULL DEFAULT 0 CHECK (walks_allowed >= 0),             -- BB (bases por bolas dadas)
  strikeouts_pitched  INT NOT NULL DEFAULT 0 CHECK (strikeouts_pitched >= 0),        -- K (ponches lanzados)
  home_runs_allowed   INT NOT NULL DEFAULT 0 CHECK (home_runs_allowed >= 0),         -- HR permitidos
  hit_batters         INT NOT NULL DEFAULT 0 CHECK (hit_batters >= 0),               -- HB (bateadores golpeados)
  wild_pitches        INT NOT NULL DEFAULT 0 CHECK (wild_pitches >= 0),              -- WP (lanzamientos salvajes)
  balks               INT NOT NULL DEFAULT 0 CHECK (balks >= 0),                     -- BK
  batters_faced       INT NOT NULL DEFAULT 0 CHECK (batters_faced >= 0),             -- BF (bateadores enfrentados)
  pitch_count         INT NOT NULL DEFAULT 0 CHECK (pitch_count >= 0),               -- Número total de lanzamientos
  decision            TEXT CHECK (decision IN ('W','L','S',NULL)),                    -- W=Win, L=Loss, S=Save

  -- ===================== META =====================
  batting_order       INT CHECK (batting_order BETWEEN 1 AND 15),   -- Posición en el lineup
  is_starter          BOOLEAN NOT NULL DEFAULT true,                -- Titular vs sustituto
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Un jugador solo tiene 1 registro de stats por juego
  UNIQUE (player_id, game_id)
);

COMMENT ON TABLE public.player_game_stats IS 'Estadísticas completas por jugador por juego (bateo + fildeo + pitcheo)';

CREATE INDEX idx_pgs_player   ON public.player_game_stats(player_id);
CREATE INDEX idx_pgs_game     ON public.player_game_stats(game_id);
CREATE INDEX idx_pgs_team     ON public.player_game_stats(team_id);
CREATE INDEX idx_pgs_decision ON public.player_game_stats(decision) WHERE decision IS NOT NULL;


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 2. FUNCIÓN Y TRIGGER: updated_at automático
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a todas las tablas con updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.seasons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.player_game_stats
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 3. FUNCIÓN Y TRIGGER: Calcular score del juego automáticamente
--    Cuando se insertan/actualizan stats, sumar las carreras por equipo
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
CREATE OR REPLACE FUNCTION public.update_game_score()
RETURNS TRIGGER AS $$
DECLARE
  v_game   public.games%ROWTYPE;
  v_home_r INT;
  v_away_r INT;
BEGIN
  -- Obtener info del juego
  SELECT * INTO v_game FROM public.games WHERE id = COALESCE(NEW.game_id, OLD.game_id);

  -- Sumar carreras del equipo local
  SELECT COALESCE(SUM(runs), 0) INTO v_home_r
    FROM public.player_game_stats
    WHERE game_id = v_game.id AND team_id = v_game.home_team_id;

  -- Sumar carreras del equipo visitante
  SELECT COALESCE(SUM(runs), 0) INTO v_away_r
    FROM public.player_game_stats
    WHERE game_id = v_game.id AND team_id = v_game.away_team_id;

  -- Actualizar el marcador
  UPDATE public.games
    SET home_score = v_home_r,
        away_score = v_away_r
    WHERE id = v_game.id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_game_score
  AFTER INSERT OR UPDATE OR DELETE ON public.player_game_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_game_score();


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 4. VIEWS — Estadísticas Calculadas
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- -------------------------------------------------------
-- VIEW: player_career_batting — Stats de bateo acumuladas por carrera
-- Calcula AVG, OBP, SLG, OPS, TB, etc.
-- -------------------------------------------------------
CREATE OR REPLACE VIEW public.player_career_batting AS
SELECT
  p.id                AS player_id,
  p.first_name,
  p.last_name,
  p.jersey_number,
  p.photo_url,
  p.positions,
  p.team_id,
  t.name              AS team_name,
  t.short_name        AS team_short_name,
  t.primary_color     AS team_color,

  -- Conteos acumulados
  COUNT(pgs.id)                         AS games_played,       -- G
  COALESCE(SUM(pgs.plate_appearances), 0) AS pa,              -- PA
  COALESCE(SUM(pgs.at_bats), 0)        AS ab,                 -- AB
  COALESCE(SUM(pgs.runs), 0)           AS r,                  -- R
  COALESCE(SUM(pgs.hits), 0)           AS h,                  -- H
  COALESCE(SUM(pgs.doubles), 0)        AS doubles,            -- 2B
  COALESCE(SUM(pgs.triples), 0)        AS triples,            -- 3B
  COALESCE(SUM(pgs.home_runs), 0)      AS hr,                 -- HR
  COALESCE(SUM(pgs.rbi), 0)            AS rbi,                -- RBI
  COALESCE(SUM(pgs.walks), 0)          AS bb,                 -- BB
  COALESCE(SUM(pgs.strikeouts), 0)     AS so,                 -- SO
  COALESCE(SUM(pgs.stolen_bases), 0)   AS sb,                 -- SB
  COALESCE(SUM(pgs.caught_stealing), 0) AS cs,                -- CS
  COALESCE(SUM(pgs.hit_by_pitch), 0)   AS hbp,               -- HBP
  COALESCE(SUM(pgs.sacrifice_flies), 0) AS sf,                -- SF
  COALESCE(SUM(pgs.sacrifice_bunts), 0) AS sac,               -- SAC
  COALESCE(SUM(pgs.ground_into_dp), 0) AS gdp,               -- GDP
  COALESCE(SUM(pgs.left_on_base), 0)   AS lob,               -- LOB

  -- Singles (calculado: H - 2B - 3B - HR)
  COALESCE(SUM(pgs.hits) - SUM(pgs.doubles) - SUM(pgs.triples) - SUM(pgs.home_runs), 0)
    AS singles,

  -- Total Bases (TB = 1B + 2*2B + 3*3B + 4*HR)
  COALESCE(
    SUM(pgs.hits) - SUM(pgs.doubles) - SUM(pgs.triples) - SUM(pgs.home_runs)  -- singles
    + SUM(pgs.doubles) * 2
    + SUM(pgs.triples) * 3
    + SUM(pgs.home_runs) * 4
  , 0) AS tb,

  -- AVG = H / AB
  CASE WHEN SUM(pgs.at_bats) > 0
    THEN ROUND(SUM(pgs.hits)::NUMERIC / SUM(pgs.at_bats), 3)
    ELSE 0.000
  END AS avg,

  -- OBP = (H + BB + HBP) / (AB + BB + HBP + SF)
  CASE WHEN (SUM(pgs.at_bats) + SUM(pgs.walks) + SUM(pgs.hit_by_pitch) + SUM(pgs.sacrifice_flies)) > 0
    THEN ROUND(
      (SUM(pgs.hits) + SUM(pgs.walks) + SUM(pgs.hit_by_pitch))::NUMERIC /
      (SUM(pgs.at_bats) + SUM(pgs.walks) + SUM(pgs.hit_by_pitch) + SUM(pgs.sacrifice_flies)),
    3)
    ELSE 0.000
  END AS obp,

  -- SLG = TB / AB
  CASE WHEN SUM(pgs.at_bats) > 0
    THEN ROUND(
      (
        SUM(pgs.hits) - SUM(pgs.doubles) - SUM(pgs.triples) - SUM(pgs.home_runs)
        + SUM(pgs.doubles) * 2
        + SUM(pgs.triples) * 3
        + SUM(pgs.home_runs) * 4
      )::NUMERIC / SUM(pgs.at_bats),
    3)
    ELSE 0.000
  END AS slg,

  -- OPS = OBP + SLG
  CASE WHEN SUM(pgs.at_bats) > 0
    THEN ROUND(
      -- OBP part
      CASE WHEN (SUM(pgs.at_bats) + SUM(pgs.walks) + SUM(pgs.hit_by_pitch) + SUM(pgs.sacrifice_flies)) > 0
        THEN (SUM(pgs.hits) + SUM(pgs.walks) + SUM(pgs.hit_by_pitch))::NUMERIC /
             (SUM(pgs.at_bats) + SUM(pgs.walks) + SUM(pgs.hit_by_pitch) + SUM(pgs.sacrifice_flies))
        ELSE 0
      END
      +
      -- SLG part
      (
        SUM(pgs.hits) - SUM(pgs.doubles) - SUM(pgs.triples) - SUM(pgs.home_runs)
        + SUM(pgs.doubles) * 2
        + SUM(pgs.triples) * 3
        + SUM(pgs.home_runs) * 4
      )::NUMERIC / SUM(pgs.at_bats),
    3)
    ELSE 0.000
  END AS ops,

  -- BABIP = (H - HR) / (AB - SO - HR + SF) — Batting Average on Balls In Play
  CASE WHEN (SUM(pgs.at_bats) - SUM(pgs.strikeouts) - SUM(pgs.home_runs) + SUM(pgs.sacrifice_flies)) > 0
    THEN ROUND(
      (SUM(pgs.hits) - SUM(pgs.home_runs))::NUMERIC /
      (SUM(pgs.at_bats) - SUM(pgs.strikeouts) - SUM(pgs.home_runs) + SUM(pgs.sacrifice_flies)),
    3)
    ELSE 0.000
  END AS babip,

  -- ISO = SLG - AVG (Isolated Power)
  CASE WHEN SUM(pgs.at_bats) > 0
    THEN ROUND(
      (
        SUM(pgs.doubles) + SUM(pgs.triples) * 2 + SUM(pgs.home_runs) * 3
      )::NUMERIC / SUM(pgs.at_bats),
    3)
    ELSE 0.000
  END AS iso,

  -- AB/HR ratio
  CASE WHEN SUM(pgs.home_runs) > 0
    THEN ROUND(SUM(pgs.at_bats)::NUMERIC / SUM(pgs.home_runs), 1)
    ELSE 0.0
  END AS ab_per_hr,

  -- BB/K ratio
  CASE WHEN SUM(pgs.strikeouts) > 0
    THEN ROUND(SUM(pgs.walks)::NUMERIC / SUM(pgs.strikeouts), 2)
    ELSE 0.00
  END AS bb_per_k,

  -- SB% = SB / (SB + CS)
  CASE WHEN (SUM(pgs.stolen_bases) + SUM(pgs.caught_stealing)) > 0
    THEN ROUND(
      SUM(pgs.stolen_bases)::NUMERIC / (SUM(pgs.stolen_bases) + SUM(pgs.caught_stealing)),
    3)
    ELSE 0.000
  END AS sb_pct

FROM public.players p
JOIN public.teams t ON t.id = p.team_id
LEFT JOIN public.player_game_stats pgs ON pgs.player_id = p.id
  -- Solo juegos finalizados
  AND pgs.game_id IN (SELECT id FROM public.games WHERE status = 'final')
WHERE p.is_active = true
GROUP BY p.id, p.first_name, p.last_name, p.jersey_number, p.photo_url,
         p.positions, p.team_id, t.name, t.short_name, t.primary_color;


-- -------------------------------------------------------
-- VIEW: player_career_pitching — Stats de pitcheo acumuladas
-- Calcula ERA, WHIP, K/9, BB/9, H/9, K/BB, etc.
-- -------------------------------------------------------
CREATE OR REPLACE VIEW public.player_career_pitching AS
SELECT
  p.id                AS player_id,
  p.first_name,
  p.last_name,
  p.jersey_number,
  p.photo_url,
  p.team_id,
  t.name              AS team_name,
  t.short_name        AS team_short_name,
  t.primary_color     AS team_color,

  -- Conteos
  COUNT(pgs.id) FILTER (WHERE pgs.innings_pitched > 0)   AS games_pitched,     -- GP
  COUNT(pgs.id) FILTER (WHERE pgs.is_starter AND pgs.innings_pitched > 0) AS games_started, -- GS
  COALESCE(SUM(pgs.innings_pitched), 0)      AS ip,              -- IP
  COALESCE(SUM(pgs.hits_allowed), 0)         AS h,               -- H
  COALESCE(SUM(pgs.runs_allowed), 0)         AS r,               -- R
  COALESCE(SUM(pgs.earned_runs), 0)          AS er,              -- ER
  COALESCE(SUM(pgs.walks_allowed), 0)        AS bb,              -- BB
  COALESCE(SUM(pgs.strikeouts_pitched), 0)   AS k,               -- K
  COALESCE(SUM(pgs.home_runs_allowed), 0)    AS hr_allowed,      -- HR
  COALESCE(SUM(pgs.hit_batters), 0)          AS hb,              -- HB
  COALESCE(SUM(pgs.wild_pitches), 0)         AS wp,              -- WP
  COALESCE(SUM(pgs.balks), 0)               AS bk,               -- BK
  COALESCE(SUM(pgs.batters_faced), 0)        AS bf,              -- BF
  COUNT(pgs.id) FILTER (WHERE pgs.decision = 'W') AS wins,       -- W
  COUNT(pgs.id) FILTER (WHERE pgs.decision = 'L') AS losses,     -- L
  COUNT(pgs.id) FILTER (WHERE pgs.decision = 'S') AS saves,      -- S

  -- ERA = (ER / IP) * 7  (7 innings en softball)
  CASE WHEN SUM(pgs.innings_pitched) > 0
    THEN ROUND((SUM(pgs.earned_runs)::NUMERIC / SUM(pgs.innings_pitched)) * 7, 2)
    ELSE 0.00
  END AS era,

  -- WHIP = (BB + H) / IP
  CASE WHEN SUM(pgs.innings_pitched) > 0
    THEN ROUND(
      (SUM(pgs.walks_allowed) + SUM(pgs.hits_allowed))::NUMERIC / SUM(pgs.innings_pitched),
    2)
    ELSE 0.00
  END AS whip,

  -- K/7 = (K / IP) * 7  (strikeouts per 7 innings)
  CASE WHEN SUM(pgs.innings_pitched) > 0
    THEN ROUND((SUM(pgs.strikeouts_pitched)::NUMERIC / SUM(pgs.innings_pitched)) * 7, 1)
    ELSE 0.0
  END AS k_per_7,

  -- BB/7 = (BB / IP) * 7
  CASE WHEN SUM(pgs.innings_pitched) > 0
    THEN ROUND((SUM(pgs.walks_allowed)::NUMERIC / SUM(pgs.innings_pitched)) * 7, 1)
    ELSE 0.0
  END AS bb_per_7,

  -- H/7 = (H / IP) * 7
  CASE WHEN SUM(pgs.innings_pitched) > 0
    THEN ROUND((SUM(pgs.hits_allowed)::NUMERIC / SUM(pgs.innings_pitched)) * 7, 1)
    ELSE 0.0
  END AS h_per_7,

  -- K/BB ratio
  CASE WHEN SUM(pgs.walks_allowed) > 0
    THEN ROUND(SUM(pgs.strikeouts_pitched)::NUMERIC / SUM(pgs.walks_allowed), 2)
    ELSE 0.00
  END AS k_per_bb,

  -- WIN% = W / (W + L)
  CASE WHEN (COUNT(pgs.id) FILTER (WHERE pgs.decision = 'W') +
             COUNT(pgs.id) FILTER (WHERE pgs.decision = 'L')) > 0
    THEN ROUND(
      COUNT(pgs.id) FILTER (WHERE pgs.decision = 'W')::NUMERIC /
      (COUNT(pgs.id) FILTER (WHERE pgs.decision = 'W') +
       COUNT(pgs.id) FILTER (WHERE pgs.decision = 'L')),
    3)
    ELSE 0.000
  END AS win_pct,

  -- BAA = H / BF (Batting Average Against)
  CASE WHEN SUM(pgs.batters_faced) > 0
    THEN ROUND(SUM(pgs.hits_allowed)::NUMERIC / SUM(pgs.batters_faced), 3)
    ELSE 0.000
  END AS baa

FROM public.players p
JOIN public.teams t ON t.id = p.team_id
LEFT JOIN public.player_game_stats pgs ON pgs.player_id = p.id
  AND pgs.game_id IN (SELECT id FROM public.games WHERE status = 'final')
WHERE p.is_active = true
GROUP BY p.id, p.first_name, p.last_name, p.jersey_number, p.photo_url,
         p.team_id, t.name, t.short_name, t.primary_color
HAVING SUM(pgs.innings_pitched) > 0;


-- -------------------------------------------------------
-- VIEW: player_career_fielding — Stats de fildeo acumuladas
-- Calcula FPCT, TC, etc.
-- -------------------------------------------------------
CREATE OR REPLACE VIEW public.player_career_fielding AS
SELECT
  p.id                AS player_id,
  p.first_name,
  p.last_name,
  p.jersey_number,
  p.team_id,
  t.name              AS team_name,
  t.short_name        AS team_short_name,

  COUNT(pgs.id)                            AS games_played,
  COALESCE(SUM(pgs.putouts), 0)            AS po,
  COALESCE(SUM(pgs.assists), 0)            AS a,
  COALESCE(SUM(pgs.errors), 0)             AS e,
  COALESCE(SUM(pgs.double_plays), 0)       AS dp,
  COALESCE(SUM(pgs.passed_balls), 0)       AS pb,

  -- TC = PO + A + E (Total Chances)
  COALESCE(SUM(pgs.putouts) + SUM(pgs.assists) + SUM(pgs.errors), 0) AS tc,

  -- FPCT = (PO + A) / (PO + A + E) — Fielding Percentage
  CASE WHEN (SUM(pgs.putouts) + SUM(pgs.assists) + SUM(pgs.errors)) > 0
    THEN ROUND(
      (SUM(pgs.putouts) + SUM(pgs.assists))::NUMERIC /
      (SUM(pgs.putouts) + SUM(pgs.assists) + SUM(pgs.errors)),
    3)
    ELSE 1.000
  END AS fpct

FROM public.players p
JOIN public.teams t ON t.id = p.team_id
LEFT JOIN public.player_game_stats pgs ON pgs.player_id = p.id
  AND pgs.game_id IN (SELECT id FROM public.games WHERE status = 'final')
WHERE p.is_active = true
GROUP BY p.id, p.first_name, p.last_name, p.jersey_number,
         p.team_id, t.name, t.short_name;


-- -------------------------------------------------------
-- VIEW: team_standings — Clasificación de equipos
-- W, L, PCT, RS, RA, DIFF, racha, juegos de diferencia (GB)
-- -------------------------------------------------------
CREATE OR REPLACE VIEW public.team_standings AS
WITH team_records AS (
  SELECT
    t.id              AS team_id,
    t.name            AS team_name,
    t.short_name,
    t.logo_url,
    t.primary_color,
    t.secondary_color,

    -- Victorias como local
    COUNT(g.id) FILTER (
      WHERE g.status = 'final' AND g.home_team_id = t.id AND g.home_score > g.away_score
    ) AS home_wins,

    -- Victorias como visitante
    COUNT(g.id) FILTER (
      WHERE g.status = 'final' AND g.away_team_id = t.id AND g.away_score > g.home_score
    ) AS away_wins,

    -- Derrotas como local
    COUNT(g.id) FILTER (
      WHERE g.status = 'final' AND g.home_team_id = t.id AND g.home_score < g.away_score
    ) AS home_losses,

    -- Derrotas como visitante
    COUNT(g.id) FILTER (
      WHERE g.status = 'final' AND g.away_team_id = t.id AND g.away_score < g.home_score
    ) AS away_losses,

    -- Carreras anotadas (como local)
    COALESCE(SUM(g.home_score) FILTER (WHERE g.status = 'final' AND g.home_team_id = t.id), 0)
    +
    COALESCE(SUM(g.away_score) FILTER (WHERE g.status = 'final' AND g.away_team_id = t.id), 0)
      AS runs_scored,

    -- Carreras recibidas
    COALESCE(SUM(g.away_score) FILTER (WHERE g.status = 'final' AND g.home_team_id = t.id), 0)
    +
    COALESCE(SUM(g.home_score) FILTER (WHERE g.status = 'final' AND g.away_team_id = t.id), 0)
      AS runs_allowed,

    -- Juegos jugados
    COUNT(g.id) FILTER (
      WHERE g.status = 'final' AND (g.home_team_id = t.id OR g.away_team_id = t.id)
    ) AS games_played

  FROM public.teams t
  LEFT JOIN public.games g
    ON g.home_team_id = t.id OR g.away_team_id = t.id
  GROUP BY t.id, t.name, t.short_name, t.logo_url, t.primary_color, t.secondary_color
)
SELECT
  team_id,
  team_name,
  short_name,
  logo_url,
  primary_color,
  secondary_color,
  games_played,
  (home_wins + away_wins)     AS wins,
  (home_losses + away_losses) AS losses,
  home_wins,
  home_losses,
  away_wins,
  away_losses,
  runs_scored,
  runs_allowed,
  (runs_scored - runs_allowed) AS run_diff,

  -- WIN PCT
  CASE WHEN (home_wins + away_wins + home_losses + away_losses) > 0
    THEN ROUND(
      (home_wins + away_wins)::NUMERIC /
      (home_wins + away_wins + home_losses + away_losses),
    3)
    ELSE 0.000
  END AS win_pct,

  -- Games Behind (respecto al primer lugar) — calculado con window function
  CASE WHEN (home_wins + away_wins + home_losses + away_losses) > 0
    THEN ROUND(
      (
        MAX(home_wins + away_wins) OVER () - (home_wins + away_wins)
        + (home_losses + away_losses) - MIN(home_losses + away_losses) OVER ()
      )::NUMERIC / 2,
    1)
    ELSE 0.0
  END AS games_behind,

  -- Pythagorean Win% = RS^2 / (RS^2 + RA^2)  — expectativa basada en carreras
  CASE WHEN (runs_scored * runs_scored + runs_allowed * runs_allowed) > 0
    THEN ROUND(
      (runs_scored * runs_scored)::NUMERIC /
      (runs_scored * runs_scored + runs_allowed * runs_allowed),
    3)
    ELSE 0.000
  END AS pythag_pct

FROM team_records
ORDER BY win_pct DESC, run_diff DESC;


-- -------------------------------------------------------
-- VIEW: season_batting_leaders — Para mostrar líderes rápidamente
-- -------------------------------------------------------
CREATE OR REPLACE VIEW public.season_batting_leaders AS
SELECT
  p.id              AS player_id,
  p.first_name,
  p.last_name,
  p.jersey_number,
  p.photo_url,
  p.team_id,
  t.name            AS team_name,
  t.short_name      AS team_short_name,
  t.primary_color   AS team_color,
  g.season_id,

  COUNT(pgs.id)                          AS games_played,
  COALESCE(SUM(pgs.at_bats), 0)         AS ab,
  COALESCE(SUM(pgs.hits), 0)            AS h,
  COALESCE(SUM(pgs.home_runs), 0)       AS hr,
  COALESCE(SUM(pgs.rbi), 0)             AS rbi,
  COALESCE(SUM(pgs.runs), 0)            AS r,
  COALESCE(SUM(pgs.stolen_bases), 0)    AS sb,
  COALESCE(SUM(pgs.walks), 0)           AS bb,
  COALESCE(SUM(pgs.strikeouts), 0)      AS so,

  CASE WHEN SUM(pgs.at_bats) > 0
    THEN ROUND(SUM(pgs.hits)::NUMERIC / SUM(pgs.at_bats), 3)
    ELSE 0.000
  END AS avg,

  CASE WHEN (SUM(pgs.at_bats) + SUM(pgs.walks) + SUM(pgs.hit_by_pitch) + SUM(pgs.sacrifice_flies)) > 0
    THEN ROUND(
      (SUM(pgs.hits) + SUM(pgs.walks) + SUM(pgs.hit_by_pitch))::NUMERIC /
      (SUM(pgs.at_bats) + SUM(pgs.walks) + SUM(pgs.hit_by_pitch) + SUM(pgs.sacrifice_flies)),
    3)
    ELSE 0.000
  END AS obp,

  CASE WHEN SUM(pgs.at_bats) > 0
    THEN ROUND(
      (
        SUM(pgs.hits) - SUM(pgs.doubles) - SUM(pgs.triples) - SUM(pgs.home_runs)
        + SUM(pgs.doubles) * 2
        + SUM(pgs.triples) * 3
        + SUM(pgs.home_runs) * 4
      )::NUMERIC / SUM(pgs.at_bats),
    3)
    ELSE 0.000
  END AS slg

FROM public.player_game_stats pgs
JOIN public.players p ON p.id = pgs.player_id
JOIN public.teams t ON t.id = pgs.team_id
JOIN public.games g ON g.id = pgs.game_id AND g.status = 'final'
GROUP BY p.id, p.first_name, p.last_name, p.jersey_number, p.photo_url,
         p.team_id, t.name, t.short_name, t.primary_color, g.season_id;


-- -------------------------------------------------------
-- VIEW: season_pitching_leaders
-- -------------------------------------------------------
CREATE OR REPLACE VIEW public.season_pitching_leaders AS
SELECT
  p.id              AS player_id,
  p.first_name,
  p.last_name,
  p.jersey_number,
  p.photo_url,
  p.team_id,
  t.name            AS team_name,
  t.short_name      AS team_short_name,
  t.primary_color   AS team_color,
  g.season_id,

  COUNT(pgs.id) FILTER (WHERE pgs.innings_pitched > 0) AS games_pitched,
  COALESCE(SUM(pgs.innings_pitched), 0)      AS ip,
  COUNT(pgs.id) FILTER (WHERE pgs.decision = 'W') AS wins,
  COUNT(pgs.id) FILTER (WHERE pgs.decision = 'L') AS losses,
  COUNT(pgs.id) FILTER (WHERE pgs.decision = 'S') AS saves,
  COALESCE(SUM(pgs.strikeouts_pitched), 0)   AS k,
  COALESCE(SUM(pgs.walks_allowed), 0)        AS bb,
  COALESCE(SUM(pgs.earned_runs), 0)          AS er,

  CASE WHEN SUM(pgs.innings_pitched) > 0
    THEN ROUND((SUM(pgs.earned_runs)::NUMERIC / SUM(pgs.innings_pitched)) * 7, 2)
    ELSE 0.00
  END AS era,

  CASE WHEN SUM(pgs.innings_pitched) > 0
    THEN ROUND(
      (SUM(pgs.walks_allowed) + SUM(pgs.hits_allowed))::NUMERIC / SUM(pgs.innings_pitched),
    2)
    ELSE 0.00
  END AS whip

FROM public.player_game_stats pgs
JOIN public.players p ON p.id = pgs.player_id
JOIN public.teams t ON t.id = pgs.team_id
JOIN public.games g ON g.id = pgs.game_id AND g.status = 'final'
WHERE pgs.innings_pitched > 0
GROUP BY p.id, p.first_name, p.last_name, p.jersey_number, p.photo_url,
         p.team_id, t.name, t.short_name, t.primary_color, g.season_id;


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 5. ROW LEVEL SECURITY (RLS)
--    Lectura pública, escritura sin restricción (no hay auth por ahora)
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

ALTER TABLE public.teams              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_innings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_game_stats  ENABLE ROW LEVEL SECURITY;

-- Lectura pública para todos
CREATE POLICY "Lectura pública" ON public.teams             FOR SELECT USING (true);
CREATE POLICY "Lectura pública" ON public.seasons           FOR SELECT USING (true);
CREATE POLICY "Lectura pública" ON public.players           FOR SELECT USING (true);
CREATE POLICY "Lectura pública" ON public.games             FOR SELECT USING (true);
CREATE POLICY "Lectura pública" ON public.game_innings      FOR SELECT USING (true);
CREATE POLICY "Lectura pública" ON public.player_game_stats FOR SELECT USING (true);

-- Escritura pública (ajustar cuando se agregue auth)
CREATE POLICY "Escritura pública" ON public.teams             FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Escritura pública" ON public.seasons           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Escritura pública" ON public.players           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Escritura pública" ON public.games             FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Escritura pública" ON public.game_innings      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Escritura pública" ON public.player_game_stats FOR ALL USING (true) WITH CHECK (true);


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 6. STORAGE BUCKETS (para fotos)
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-- Bucket para logos de equipos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'team-logos',
  'team-logos',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg','image/png','image/webp','image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para fotos de jugadores
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'player-photos',
  'player-photos',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg','image/png','image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage: lectura pública
CREATE POLICY "Logos públicos" ON storage.objects
  FOR SELECT USING (bucket_id = 'team-logos');

CREATE POLICY "Fotos públicas" ON storage.objects
  FOR SELECT USING (bucket_id = 'player-photos');

-- Políticas de storage: subida pública (ajustar con auth después)
CREATE POLICY "Subir logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'team-logos');

CREATE POLICY "Subir fotos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'player-photos');

-- Políticas de storage: actualizar/eliminar
CREATE POLICY "Actualizar logos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'team-logos');

CREATE POLICY "Actualizar fotos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'player-photos');

CREATE POLICY "Eliminar logos" ON storage.objects
  FOR DELETE USING (bucket_id = 'team-logos');

CREATE POLICY "Eliminar fotos" ON storage.objects
  FOR DELETE USING (bucket_id = 'player-photos');


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- 7. DATOS SEMILLA (4 equipos iniciales)
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

INSERT INTO public.teams (name, short_name, primary_color, secondary_color) VALUES
  ('Águilas Doradas',  'AGU', '#f59e0b', '#78350f'),
  ('Toros Rojos',      'TOR', '#ef4444', '#7f1d1d'),
  ('Tiburones Azules', 'TIB', '#3b82f6', '#1e3a5f'),
  ('Leones Verdes',    'LEO', '#10b981', '#064e3b');

-- Temporada inicial
INSERT INTO public.seasons (name, year, is_active, start_date, end_date) VALUES
  ('Temporada 2026', 2026, true, '2026-03-01', '2026-08-31');


-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- FIN DEL SCHEMA
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Total: 6 tablas, 6 views, 5 triggers, índices, RLS, 2 storage buckets
--
-- Resumen de estadísticas cubiertas:
-- BATEO:   PA, AB, R, H, 1B, 2B, 3B, HR, RBI, BB, SO, SB, CS, HBP, SF, SAC, GDP, LOB
--          → AVG, OBP, SLG, OPS, TB, BABIP, ISO, AB/HR, BB/K, SB%
-- PITCHEO: IP, H, R, ER, BB, K, HR, HB, WP, BK, BF, W, L, S
--          → ERA, WHIP, K/7, BB/7, H/7, K/BB, WIN%, BAA
-- FILDEO:  PO, A, E, DP, PB
--          → TC, FPCT
-- EQUIPO:  W, L, PCT, RS, RA, DIFF, GB, Home/Away record, Pythagorean%
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
