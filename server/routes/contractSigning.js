const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://ansiaiuaygcfztabtknl.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST /api/registration/:id/sign-contract
router.post('/:id/sign-contract', async (req, res) => {
  const { id } = req.params;
  const { agreed, signed_at } = req.body;

  if (!agreed) {
    return res.status(400).json({ error: 'Must agree to terms' });
  }

  try {
    // Update registration status: awaiting_contract → contract_signed
    const { data, error } = await supabase
      .from('registration_progress')
      .update({
        current_step: 'contract_signed',
        contract_signed_at: signed_at || new Date().toISOString(),
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
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
