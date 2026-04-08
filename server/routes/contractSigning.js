import express from 'express';
import { createClient } from '@supabase/supabase-js';

let _supabase;
function getSupabase() {
  if (!_supabase) {
    if (!process.env.SUPABASE_URL) {
      throw new Error('SUPABASE_URL environment variable is required');
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    }
    _supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return _supabase;
}

const router = express.Router();

// UUID v4 validation regex
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST /api/registration/:id/sign-contract
router.post('/:id/sign-contract', async (req, res) => {
  const { id } = req.params;
  const { agreed } = req.body;

  // Validate UUID param
  if (!UUID_RE.test(id)) {
    return res.status(400).json({ error: 'Invalid registration ID format' });
  }

  if (!agreed) {
    return res.status(400).json({ error: 'Must agree to terms' });
  }

  // Authorization: only admin and operator roles can sign contracts
  const role = req.user?.role;
  if (!role || role === 'viewer') {
    return res.status(403).json({ error: 'Permission denied' });
  }

  try {
    // Verify the registration belongs to the requesting user
    // First fetch the record to check ownership
    const supabase = getSupabase();
    const { data: existing, error: fetchError } = await supabase
      .from('registration_progress')
      .select('id, user_id, current_step')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // If the request has a user ID (from auth token), verify ownership
    if (req.user?.userId && existing.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    if (existing.current_step !== 'awaiting_contract') {
      return res.status(409).json({ error: 'Registration is not in awaiting_contract status' });
    }

    // Update registration status: awaiting_contract → contract_signed
    // Always use server-side timestamp, never client-provided
    const { data, error } = await supabase
      .from('registration_progress')
      .update({
        current_step: 'contract_signed',
        contract_signed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('current_step', 'awaiting_contract')
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Registration not found or wrong status' });

    res.json({ success: true, registration: data });
  } catch (err) {
    console.error('[ContractSigning]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as contractSigningRouter };
