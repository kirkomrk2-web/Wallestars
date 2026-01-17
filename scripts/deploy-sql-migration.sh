#!/bin/bash
# V3 SQL Migration Deployment Script
# Run from VPS after SSH

set -e

echo "=========================================="
echo "V3 SQL Migration Deployment"
echo "=========================================="

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "Installing PostgreSQL client..."
    apt-get update
    apt-get install -y postgresql-client
fi

# Supabase connection details
SUPABASE_HOST="db.ansiaiuaygcfztabtknl.supabase.co"
SUPABASE_PORT="5432"
SUPABASE_DB="postgres"
SUPABASE_USER="postgres"
SUPABASE_PASSWORD="Zdraveibobi12#"

echo ""
echo "Testing Supabase connection..."
PGPASSWORD="$SUPABASE_PASSWORD" psql "postgresql://${SUPABASE_USER}:${SUPABASE_PASSWORD}@${SUPABASE_HOST}:${SUPABASE_PORT}/${SUPABASE_DB}" -c "SELECT version();" || {
    echo "ERROR: Cannot connect to Supabase"
    exit 1
}

echo ""
echo "✅ Connection successful!"
echo ""
echo "Creating migration file..."

# Create migration SQL file
cat > /tmp/004_migration.sql << 'EOFMIGRATION'
-- ============================================
-- Registration Progress Tracking Table
-- For Wallester Automation Recovery & Monitoring
-- ============================================

CREATE TABLE IF NOT EXISTS registration_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID,
    business_eik TEXT NOT NULL,
    business_name TEXT,
    current_step TEXT NOT NULL CHECK (current_step IN (
        'INITIATED',
        'PHONE_NUMBER_ALLOCATED',
        'BROWSER_SESSION_CREATED',
        'FORM_OPENED',
        'PHONE_ENTERED',
        'SMS_OTP_REQUESTED',
        'SMS_OTP_RECEIVED',
        'SMS_OTP_SUBMITTED',
        'EMAIL_ENTERED',
        'EMAIL_OTP_REQUESTED',
        'EMAIL_OTP_RECEIVED',
        'EMAIL_OTP_SUBMITTED',
        'BUSINESS_DETAILS_ENTERED',
        'OWNER_DETAILS_ENTERED',
        'FINAL_SUBMIT',
        'COMPLETED',
        'FAILED',
        'MANUAL_INTERVENTION_REQUIRED'
    )),
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN (
        'IN_PROGRESS',
        'WAITING_SMS',
        'WAITING_EMAIL',
        'RETRYING',
        'COMPLETED',
        'FAILED',
        'PAUSED'
    )),
    resources JSONB DEFAULT '{}',
    error_log JSONB DEFAULT '[]',
    last_error JSONB,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_registration_progress_eik ON registration_progress(business_eik);
CREATE INDEX IF NOT EXISTS idx_registration_progress_status ON registration_progress(status);
CREATE INDEX IF NOT EXISTS idx_registration_progress_current_step ON registration_progress(current_step);
CREATE INDEX IF NOT EXISTS idx_registration_progress_started_at ON registration_progress(started_at DESC);

-- Helper Functions
CREATE OR REPLACE FUNCTION update_registration_step(
    p_business_eik TEXT,
    p_new_step TEXT,
    p_new_status TEXT DEFAULT 'IN_PROGRESS'
)
RETURNS void AS $$
BEGIN
    UPDATE registration_progress
    SET 
        current_step = p_new_step,
        status = p_new_status,
        updated_at = NOW()
    WHERE business_eik = p_business_eik
    AND status NOT IN ('COMPLETED', 'FAILED');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_registration_error(
    p_business_eik TEXT,
    p_error_type TEXT,
    p_error_message TEXT,
    p_retryable BOOLEAN DEFAULT true
)
RETURNS void AS $$
DECLARE
    v_current_step TEXT;
    v_retry_count INTEGER;
    v_error_log JSONB;
    v_new_error JSONB;
BEGIN
    SELECT current_step, retry_count, error_log
    INTO v_current_step, v_retry_count, v_error_log
    FROM registration_progress
    WHERE business_eik = p_business_eik;
    
    v_new_error := jsonb_build_object(
        'timestamp', NOW(),
        'step', v_current_step,
        'error_type', p_error_type,
        'error_message', p_error_message,
        'retryable', p_retryable,
        'retry_count', v_retry_count + 1
    );
    
    UPDATE registration_progress
    SET 
        error_log = COALESCE(error_log, '[]'::jsonb) || v_new_error,
        last_error = jsonb_build_object(
            'type', p_error_type,
            'message', p_error_message,
            'timestamp', NOW(),
            'retryable', p_retryable
        ),
        retry_count = retry_count + 1,
        status = CASE 
            WHEN p_retryable AND retry_count < max_retries THEN 'RETRYING'
            WHEN p_retryable AND retry_count >= max_retries THEN 'MANUAL_INTERVENTION_REQUIRED'
            ELSE 'FAILED'
        END,
        updated_at = NOW()
    WHERE business_eik = p_business_eik;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION complete_registration(
    p_business_eik TEXT
)
RETURNS void AS $$
BEGIN
    UPDATE registration_progress
    SET 
        current_step = 'COMPLETED',
        status = 'COMPLETED',
        completed_at = NOW(),
        duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER,
        updated_at = NOW()
    WHERE business_eik = p_business_eik;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_stuck_registrations(
    p_minutes_threshold INTEGER DEFAULT 30
)
RETURNS TABLE (
    business_eik TEXT,
    current_step TEXT,
    status TEXT,
    minutes_stuck INTEGER,
    retry_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rp.business_eik,
        rp.current_step,
        rp.status,
        EXTRACT(EPOCH FROM (NOW() - rp.updated_at))::INTEGER / 60 AS minutes_stuck,
        rp.retry_count
    FROM registration_progress rp
    WHERE rp.status = 'IN_PROGRESS'
    AND rp.updated_at < NOW() - (p_minutes_threshold || ' minutes')::INTERVAL
    ORDER BY rp.updated_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_registration_progress_updated_at ON registration_progress;
CREATE TRIGGER update_registration_progress_updated_at
    BEFORE UPDATE ON registration_progress
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE registration_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on registration_progress" ON registration_progress;
CREATE POLICY "Service role full access on registration_progress"
    ON registration_progress FOR ALL
    USING (true);

EOFMIGRATION

echo "✅ Migration file created at /tmp/004_migration.sql"
echo ""
echo "Deploying migration..."

PGPASSWORD="$SUPABASE_PASSWORD" psql "postgresql://${SUPABASE_USER}:${SUPABASE_PASSWORD}@${SUPABASE_HOST}:${SUPABASE_PORT}/${SUPABASE_DB}" -f /tmp/004_migration.sql || {
    echo "ERROR: Migration failed"
    exit 1
}

echo ""
echo "✅ Migration deployed successfully!"
echo ""
echo "Verifying tables..."

PGPASSWORD="$SUPABASE_PASSWORD" psql "postgresql://${SUPABASE_USER}:${SUPABASE_PASSWORD}@${SUPABASE_HOST}:${SUPABASE_PORT}/${SUPABASE_DB}" -c "\dt registration_progress"

echo ""
echo "Verifying functions..."

PGPASSWORD="$SUPABASE_PASSWORD" psql "postgresql://${SUPABASE_USER}:${SUPABASE_PASSWORD}@${SUPABASE_HOST}:${SUPABASE_PORT}/${SUPABASE_DB}" -c "SELECT routine_name FROM information_schema.routines WHERE routine_name LIKE '%registration%';"

echo ""
echo "=========================================="
echo "✅ V3 SQL Migration Complete!"
echo "=========================================="
echo ""
echo "Test the setup with:"
echo "  psql ... -c \"SELECT * FROM registration_progress LIMIT 1;\""