-- ============================================================
-- Copa Palpite — Schema Neon (PostgreSQL)
-- Execute este arquivo no SQL Editor do Neon para criar o banco
-- ============================================================

-- Usuários / participantes
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,  -- armazenado em texto simples por ora (bcrypt recomendado em produção)
  avatar      TEXT,
  is_admin    BOOLEAN NOT NULL DEFAULT FALSE,
  points      INTEGER NOT NULL DEFAULT 0,
  exact_hits  INTEGER NOT NULL DEFAULT 0,
  result_hits INTEGER NOT NULL DEFAULT 0,
  pool_group  TEXT NOT NULL DEFAULT 'Geral',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin padrão (senha: admin)
INSERT INTO users (id, name, email, password, is_admin)
VALUES ('admin', 'Administrador', 'admin@copapalpite.com', 'admin', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Jogos
CREATE TABLE IF NOT EXISTS matches (
  id          TEXT PRIMARY KEY,
  home_id     TEXT NOT NULL,
  home_name   TEXT NOT NULL,
  home_code   TEXT NOT NULL,
  home_flag   TEXT NOT NULL,
  away_id     TEXT NOT NULL,
  away_name   TEXT NOT NULL,
  away_code   TEXT NOT NULL,
  away_flag   TEXT NOT NULL,
  kickoff     TIMESTAMPTZ NOT NULL,
  group_name  TEXT NOT NULL,
  stage       TEXT NOT NULL,
  round       INTEGER NOT NULL DEFAULT 1,
  status      TEXT NOT NULL DEFAULT 'scheduled',
  home_score  INTEGER,
  away_score  INTEGER,
  minute      INTEGER,
  venue       TEXT NOT NULL DEFAULT '',
  youtube_id  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Palpites
CREATE TABLE IF NOT EXISTS predictions (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id    TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  home        INTEGER NOT NULL,
  away        INTEGER NOT NULL,
  saved_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_predictions_user  ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match ON predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_matches_status    ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_kickoff   ON matches(kickoff);
