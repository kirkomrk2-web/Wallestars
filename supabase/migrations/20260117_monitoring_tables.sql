-- Migration: Add VPS Health Monitoring and Dashboard Tables
-- Created: 2026-01-17
-- Purpose: Support VPS health monitoring and dashboard data collection workflows

-- Enable required extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- VPS Health Logs Table
-- Purpose: Store health check data from VPS monitoring workflow
-- Frequency: Every 5 minutes
-- =============================================================================

CREATE TABLE IF NOT EXISTS vps_health_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    disk_usage INTEGER CHECK (disk_usage >= 0 AND disk_usage <= 100),
    memory_usage INTEGER CHECK (memory_usage >= 0 AND memory_usage <= 100),
    cpu_load DECIMAL(5,2) CHECK (cpu_load >= 0),
    docker_status VARCHAR(50),
    wallestars_status VARCHAR(50),
    health_status VARCHAR(50) CHECK (health_status IN ('healthy', 'warning', 'critical')),
    alert_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vps_health_timestamp 
    ON vps_health_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_vps_health_status 
    ON vps_health_logs(health_status);
CREATE INDEX IF NOT EXISTS idx_vps_health_created 
    ON vps_health_logs(created_at DESC);

-- Comment
COMMENT ON TABLE vps_health_logs IS 
    'Stores VPS health metrics collected every 5 minutes by n8n workflow';

-- =============================================================================
-- Dashboard Snapshots Table
-- Purpose: Store aggregated dashboard data from multiple sources
-- Frequency: Every 15 minutes
-- Sources: n8n, Linear, GitHub, PM2, Docker, Health Logs
-- =============================================================================

CREATE TABLE IF NOT EXISTS dashboard_snapshots (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_timestamp 
    ON dashboard_snapshots(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_created 
    ON dashboard_snapshots(created_at DESC);

-- JSONB GIN index for fast queries
CREATE INDEX IF NOT EXISTS idx_dashboard_data_gin 
    ON dashboard_snapshots USING gin(data);

-- Comment
COMMENT ON TABLE dashboard_snapshots IS 
    'Stores aggregated dashboard data snapshots collected every 15 minutes';

-- =============================================================================
-- GitHub Linear Sync Log (Optional - for future GitHub-Linear integration)
-- Purpose: Track synchronization events between GitHub and Linear
-- =============================================================================

CREATE TABLE IF NOT EXISTS github_linear_sync_log (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    event VARCHAR(100),
    repository VARCHAR(255),
    linear_issue_id VARCHAR(50),
    action VARCHAR(100),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sync_log_timestamp 
    ON github_linear_sync_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sync_log_event 
    ON github_linear_sync_log(event);
CREATE INDEX IF NOT EXISTS idx_sync_log_linear_issue 
    ON github_linear_sync_log(linear_issue_id);

-- Comment
COMMENT ON TABLE github_linear_sync_log IS 
    'Logs GitHub events synced to Linear (commits, PRs, issues)';

-- =============================================================================
-- Helper View: System Health Summary
-- Purpose: Quick overview of system health
-- =============================================================================

CREATE OR REPLACE VIEW system_health_summary AS
SELECT
    -- Latest health status
    (SELECT health_status FROM vps_health_logs ORDER BY timestamp DESC LIMIT 1) 
        AS current_health_status,
    (SELECT timestamp FROM vps_health_logs ORDER BY timestamp DESC LIMIT 1) 
        AS last_health_check,
    
    -- Health statistics (last 24 hours)
    (SELECT COUNT(*) FROM vps_health_logs 
     WHERE timestamp > NOW() - INTERVAL '24 hours') 
        AS health_checks_24h,
    (SELECT COUNT(*) FROM vps_health_logs 
     WHERE timestamp > NOW() - INTERVAL '24 hours' AND health_status = 'critical') 
        AS critical_alerts_24h,
    (SELECT COUNT(*) FROM vps_health_logs 
     WHERE timestamp > NOW() - INTERVAL '24 hours' AND health_status = 'warning') 
        AS warning_alerts_24h,
    
    -- Average resource usage (last 24 hours)
    (SELECT ROUND(AVG(disk_usage)) FROM vps_health_logs 
     WHERE timestamp > NOW() - INTERVAL '24 hours') 
        AS avg_disk_usage_24h,
    (SELECT ROUND(AVG(memory_usage)) FROM vps_health_logs 
     WHERE timestamp > NOW() - INTERVAL '24 hours') 
        AS avg_memory_usage_24h,
    (SELECT ROUND(AVG(cpu_load)::numeric, 2) FROM vps_health_logs 
     WHERE timestamp > NOW() - INTERVAL '24 hours') 
        AS avg_cpu_load_24h,
    
    -- Dashboard statistics
    (SELECT COUNT(*) FROM dashboard_snapshots) 
        AS total_dashboard_snapshots,
    (SELECT timestamp FROM dashboard_snapshots ORDER BY timestamp DESC LIMIT 1) 
        AS last_dashboard_update,
    
    -- Sync statistics
    (SELECT COUNT(*) FROM github_linear_sync_log 
     WHERE timestamp > NOW() - INTERVAL '24 hours') 
        AS sync_events_24h;

-- Comment
COMMENT ON VIEW system_health_summary IS 
    'Aggregated view of system health metrics for quick monitoring';

-- =============================================================================
-- Data Retention Policy (Optional but Recommended)
-- Purpose: Prevent tables from growing indefinitely
-- =============================================================================

-- Function to cleanup old health logs (keep 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_health_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM vps_health_logs
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old dashboard snapshots (keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_dashboard_snapshots()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM dashboard_snapshots
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comment
COMMENT ON FUNCTION cleanup_old_health_logs() IS 
    'Deletes VPS health logs older than 30 days to manage storage';
COMMENT ON FUNCTION cleanup_old_dashboard_snapshots() IS 
    'Deletes dashboard snapshots older than 90 days to manage storage';

-- =============================================================================
-- Row Level Security (Optional - Recommended for Production)
-- Purpose: Secure access to monitoring data
-- =============================================================================

-- Enable RLS on tables
ALTER TABLE vps_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_linear_sync_log ENABLE ROW LEVEL SECURITY;

-- Create policies for service role (full access)
CREATE POLICY "Service role full access to vps_health_logs"
    ON vps_health_logs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access to dashboard_snapshots"
    ON dashboard_snapshots
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access to github_linear_sync_log"
    ON github_linear_sync_log
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Read-only access for authenticated users (optional)
CREATE POLICY "Authenticated users can read vps_health_logs"
    ON vps_health_logs
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read dashboard_snapshots"
    ON dashboard_snapshots
    FOR SELECT
    TO authenticated
    USING (true);

-- =============================================================================
-- Verification Queries
-- Purpose: Run these after migration to verify everything is set up correctly
-- =============================================================================

-- Check tables exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables 
                   WHERE table_name = 'vps_health_logs') THEN
        RAISE EXCEPTION 'Table vps_health_logs was not created';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables 
                   WHERE table_name = 'dashboard_snapshots') THEN
        RAISE EXCEPTION 'Table dashboard_snapshots was not created';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables 
                   WHERE table_name = 'github_linear_sync_log') THEN
        RAISE EXCEPTION 'Table github_linear_sync_log was not created';
    END IF;
    
    RAISE NOTICE 'All monitoring tables created successfully';
END $$;

-- Insert test data for validation
INSERT INTO vps_health_logs (disk_usage, memory_usage, cpu_load, docker_status, wallestars_status, health_status, alert_count)
VALUES (45, 60, 1.2, 'active', 'online', 'healthy', 0);

INSERT INTO dashboard_snapshots (data)
VALUES ('{"test": true, "timestamp": "2026-01-17T21:00:00Z", "source": "migration_test"}'::jsonb);

-- Verify inserts
SELECT 'vps_health_logs: ' || COUNT(*)::text || ' rows' FROM vps_health_logs;
SELECT 'dashboard_snapshots: ' || COUNT(*)::text || ' rows' FROM dashboard_snapshots;

-- =============================================================================
-- Migration Complete
-- =============================================================================

-- Log migration
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 20260117_monitoring_tables completed successfully';
    RAISE NOTICE 'Tables created: vps_health_logs, dashboard_snapshots, github_linear_sync_log';
    RAISE NOTICE 'View created: system_health_summary';
    RAISE NOTICE 'Functions created: cleanup_old_health_logs, cleanup_old_dashboard_snapshots';
    RAISE NOTICE 'RLS policies: Enabled for service_role and authenticated';
END $$;