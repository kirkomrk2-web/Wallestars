// OTP Watchdog - alerts when registrations stuck in otp_pending > 15 minutes
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const STUCK_THRESHOLD_MINUTES = 15;

if (!SUPABASE_URL && SUPABASE_KEY) {
  console.warn('⚠️ SUPABASE_URL is not set — OTP watchdog disabled');
}

const supabase = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Tracks IDs that have already triggered a Telegram alert to prevent duplicates
const alertedIds = new Set();

// Clears the alerted-IDs set (used in tests and can be called on service restart)
export function clearAlertedIds() {
  alertedIds.clear();
}

export async function checkStuckOtpRegistrations() {
  if (!supabase) return;

  const cutoff = new Date(Date.now() - STUCK_THRESHOLD_MINUTES * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('registration_progress')
    .select('id, phone, created_at, current_step')
    .eq('current_step', 'otp_pending')
    .lt('updated_at', cutoff)
    .limit(10);

  if (error || !data) return;

  // Remove resolved IDs (no longer in the current stuck list)
  const currentIds = new Set(data.map(r => r.id));
  for (const id of alertedIds) {
    if (!currentIds.has(id)) alertedIds.delete(id);
  }

  if (data.length === 0) return;

  // Only alert on registrations that haven't been alerted yet
  const newlyStuck = data.filter(r => !alertedIds.has(r.id));
  if (newlyStuck.length === 0) return;

  newlyStuck.forEach(r => alertedIds.add(r.id));

  const message = `⚠️ OTP Watchdog Alert\n${newlyStuck.length} registration(s) stuck in otp_pending > ${STUCK_THRESHOLD_MINUTES}min\nIDs: ${newlyStuck.map(r => r.id).join(', ')}`;

  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
    }).catch(console.error);
  }

  console.log('[OTP Watchdog]', message);
}

export function startOtpWatchdog() {
  console.log('[OTP Watchdog] Started, checking every 5 minutes');
  checkStuckOtpRegistrations();
  setInterval(checkStuckOtpRegistrations, CHECK_INTERVAL_MS);
}
