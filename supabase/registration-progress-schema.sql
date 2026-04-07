-- ============================================
-- Table: registration_progress
-- Description: Tracks registration workflow steps
--   including contract signing status
-- ============================================

CREATE TABLE IF NOT EXISTS registration_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users_pending(id) ON DELETE CASCADE,

    -- Workflow step tracking
    current_step TEXT NOT NULL DEFAULT 'pending' CHECK (current_step IN (
        'pending',
        'awaiting_contract',
        'contract_signed',
        'completed',
        'failed'
    )),

    -- Contract signing
    contract_signed_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_registration_progress_user_id ON registration_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_registration_progress_current_step ON registration_progress(current_step);

-- Auto-update timestamp trigger
DROP TRIGGER IF EXISTS update_registration_progress_updated_at ON registration_progress;
CREATE TRIGGER update_registration_progress_updated_at
    BEFORE UPDATE ON registration_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE registration_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on registration_progress"
    ON registration_progress FOR ALL
    USING (auth.role() = 'service_role');
