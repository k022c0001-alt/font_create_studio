CREATE TABLE IF NOT EXISTS font_analytics_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  font_id TEXT UNIQUE NOT NULL,
  font_bytes_hash TEXT NOT NULL,
  metrics_json TEXT NOT NULL,
  recommendations_json TEXT NOT NULL,
  glyph_stats_json TEXT NOT NULL,
  has_cjk BOOLEAN NOT NULL DEFAULT 0,
  available_weights TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  hit_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_font_analytics_cache_font_id ON font_analytics_cache(font_id);
CREATE INDEX IF NOT EXISTS idx_font_analytics_cache_expires_at ON font_analytics_cache(expires_at);

CREATE TABLE IF NOT EXISTS analytics_cache_hits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  font_id TEXT NOT NULL,
  cache_layer TEXT NOT NULL,
  response_time_ms FLOAT NOT NULL,
  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (font_id) REFERENCES font_analytics_cache(font_id) ON DELETE CASCADE
);
