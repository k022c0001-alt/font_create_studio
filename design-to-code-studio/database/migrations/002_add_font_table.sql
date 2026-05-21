-- Migration 002: Add fonts table

CREATE TABLE IF NOT EXISTS fonts (
  id          TEXT PRIMARY KEY,
  project_id  TEXT NOT NULL,
  family      TEXT NOT NULL,
  file_path   TEXT NOT NULL,
  format      TEXT NOT NULL CHECK (format IN ('ttf', 'otf', 'woff2')),
  is_variable INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
