-- Portfolio Database Schema
-- Run this script in Vercel Postgres dashboard to initialize tables

-- ============================================
-- Table: metrics
-- Purpose: Store time-series data for charts (Chess.com ratings, GitHub stats, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS metrics (
    id SERIAL PRIMARY KEY,
    source VARCHAR(50) NOT NULL,           -- 'chess.com', 'github', 'leetcode', etc.
    username VARCHAR(100) NOT NULL,        -- platform username
    date TIMESTAMP NOT NULL DEFAULT NOW(), -- when metric was recorded
    metric_type VARCHAR(100) NOT NULL,     -- 'blitz_rating', 'rapid_rating', 'stars', etc.
    value NUMERIC NOT NULL,                -- the actual metric value
    raw_data JSONB,                        -- full API response for debugging
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast queries by source and date
CREATE INDEX IF NOT EXISTS idx_metrics_source_date ON metrics(source, date DESC);

-- Index for finding latest metric by type
CREATE INDEX IF NOT EXISTS idx_metrics_type_date ON metrics(metric_type, date DESC);

-- Unique constraint to prevent duplicate entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_metrics_unique
ON metrics(source, username, metric_type, date_trunc('day', date));

-- ============================================
-- Table: projects
-- Purpose: Store GitHub project data (for future Day 5+ sync)
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    github_url VARCHAR(500),
    homepage_url VARCHAR(500),
    stars INTEGER DEFAULT 0,
    forks INTEGER DEFAULT 0,
    language VARCHAR(50),
    topics TEXT[],                         -- array of topic tags
    is_featured BOOLEAN DEFAULT FALSE,     -- show on portfolio homepage
    last_updated TIMESTAMP,
    raw_data JSONB,                        -- full GitHub API response
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for featured projects
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(is_featured) WHERE is_featured = TRUE;

-- Unique constraint on GitHub URL
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_github_url ON projects(github_url);

-- ============================================
-- Table: failed_syncs
-- Purpose: Log API failures for debugging and monitoring
-- ============================================
CREATE TABLE IF NOT EXISTS failed_syncs (
    id SERIAL PRIMARY KEY,
    source VARCHAR(50) NOT NULL,           -- which API failed
    error_message TEXT NOT NULL,
    error_data JSONB,                      -- full error details
    attempted_at TIMESTAMP DEFAULT NOW()
);

-- Index for recent failures by source
CREATE INDEX IF NOT EXISTS idx_failed_syncs_source ON failed_syncs(source, attempted_at DESC);

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON TABLE metrics IS 'Time-series data for portfolio charts and progress tracking';
COMMENT ON TABLE projects IS 'GitHub repositories to display on portfolio';
COMMENT ON TABLE failed_syncs IS 'Error log for API synchronization failures';

COMMENT ON COLUMN metrics.source IS 'Platform name: chess.com, github, leetcode, etc.';
COMMENT ON COLUMN metrics.metric_type IS 'Type of metric: blitz_rating, stars, commits, etc.';
COMMENT ON COLUMN metrics.raw_data IS 'Full API response stored as JSON for debugging';

COMMENT ON COLUMN projects.is_featured IS 'If true, show this project on portfolio homepage';
COMMENT ON COLUMN projects.topics IS 'Array of GitHub topic tags for filtering';

-- ============================================
-- Verify tables created
-- ============================================
-- Run after migration:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
