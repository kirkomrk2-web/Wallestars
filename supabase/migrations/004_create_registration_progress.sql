-- ============================================
-- Registration Progress Tracking Table
-- For Wallester Automation Recovery & Monitoring
-- ============================================

-- Table: registration_progress
-- Purpose: Track step-by-step progress of each business registration
-- Enables recovery from failures and monitoring of automation status
CREATE TABLE IF NOT EXISTS registration_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Business Identification
    owner_id UUID REFERENCES verified_business_profiles(id) ON DELETE CASCADE,
    business_eik TEXT NOT NULL,
    business_name TEXT,
    
    -- Progress Tracking
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
    
    -- Resource Allocation
    resources JSONB DEFAULT '{}',
    -- Format: {
    --   "phoneNumber": "+1234567890",
    --   "phoneOrderId": "duo-123",
    --   "email": "business123@33mail.com",
    --   "sessionId": "airtop-session-456",
    --   "windowId": "window-789"
    -- }
    
    -- Error Tracking
    error_log JSONB DEFAULT '[]',
    -- Format: [
    --   {
    --     "timestamp": "2026-01-16T19:00:00Z",
    --     "step": "SMS_OTP_REQUESTED",
    --     "error_type": "TIMEOUT",
    --     "error_message": "SMS not received after 120s",
    --     "retryable": true,
    --     "retry_count": 1
    --   }
    -- ]
    
    last_error JSONB,
    -- Format: {
    --   "type": "SMS_TIMEOUT",
    --   "message": "Failed to receive SMS OTP",
    --   "timestamp": "2026-01-16T19:00:00Z",
    --   "retryable": true
    -- }
    
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Performance Metrics
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    
    -- Additional Metadata
    metadata JSONB DEFAULT '{}',
    -- Format: {
    --   "automation_version": "2.0",
    --   "triggered_by": "webhook",
    --   "country": "BG",
    --   "notes": "Manual intervention needed for captcha"
    -- }
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_registration_progress_eik 
    ON registration_progress(business_eik);

CREATE INDEX IF NOT EXISTS idx_registration_progress_status 
    ON registration_progress(status);

CREATE INDEX IF NOT EXISTS idx_registration_progress_current_step 
    ON registration_progress(current_step);

CREATE INDEX IF NOT EXISTS idx_registration_progress_owner_id 
    ON registration_progress(owner_id);

CREATE INDEX IF NOT EXISTS idx_registration_progress_started_at 
    ON registration_progress(started_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_registration_progress_status_step 
    ON registration_progress(status, current_step);

-- ============================================
-- Helper Functions
-- ============================================

-- Function: Update progress step
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

-- Function: Log error
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
    -- Get current state
    SELECT current_step, retry_count, error_log
    INTO v_current_step, v_retry_count, v_error_log
    FROM registration_progress
    WHERE business_eik = p_business_eik;
    
    -- Create new error entry
    v_new_error := jsonb_build_object(
        'timestamp', NOW(),
        'step', v_current_step,
        'error_type', p_error_type,
        'error_message', p_error_message,
        'retryable', p_retryable,
        'retry_count', v_retry_count + 1
    );
    
    -- Update record
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

-- Function: Mark as completed
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

-- Function: Get stuck registrations (older than threshold)
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

-- ============================================
-- Trigger: Auto-update updated_at
-- ============================================
DROP TRIGGER IF EXISTS update_registration_progress_updated_at ON registration_progress;
CREATE TRIGGER update_registration_progress_updated_at
    BEFORE UPDATE ON registration_progress
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE registration_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on registration_progress"
    ON registration_progress FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- Sample Usage Examples (commented out)
-- ============================================

-- Initialize new registration
-- INSERT INTO registration_progress (business_eik, business_name, current_step, status)
-- VALUES ('123456789', 'Test Company EOOD', 'INITIATED', 'IN_PROGRESS');

-- Update step
-- SELECT update_registration_step('123456789', 'SMS_OTP_REQUESTED', 'WAITING_SMS');

-- Log error
-- SELECT log_registration_error('123456789', 'SMS_TIMEOUT', 'Failed to receive SMS after 120s', true);

-- Mark completed
-- SELECT complete_registration('123456789');

-- Find stuck registrations
-- SELECT * FROM get_stuck_registrations(30);

-- Query progress with business details
-- SELECT 
--     rp.business_eik,
--     rp.business_name,
--     rp.current_step,
--     rp.status,
--     rp.retry_count,
--     EXTRACT(EPOCH FROM (NOW() - rp.started_at))::INTEGER AS elapsed_seconds,
--     rp.last_error->>'message' AS last_error_message
-- FROM registration_progress rp
-- WHERE rp.status IN ('IN_PROGRESS', 'RETRYING')
-- ORDER BY rp.started_at DESC;