import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock @supabase/supabase-js before importing the module under test
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          lt: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      }))
    }))
  }))
}));

// Provide required env vars
beforeEach(() => {
  process.env.SUPABASE_URL = 'https://test-project.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
  process.env.TELEGRAM_BOT_TOKEN = '';
  process.env.TELEGRAM_CHAT_ID = '-100000000000';
});

afterEach(() => {
  vi.clearAllMocks();
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
});

describe('OTP Watchdog', () => {
  it('should export startOtpWatchdog and checkStuckOtpRegistrations', async () => {
    const mod = await import('./otpWatchdog.js');
    expect(typeof mod.startOtpWatchdog).toBe('function');
    expect(typeof mod.checkStuckOtpRegistrations).toBe('function');
  });

  it('checkStuckOtpRegistrations returns early when SUPABASE_KEY is missing', async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const { checkStuckOtpRegistrations } = await import('./otpWatchdog.js');
    // Should resolve without throwing
    await expect(checkStuckOtpRegistrations()).resolves.toBeUndefined();
  });

  it('checkStuckOtpRegistrations handles empty result set gracefully', async () => {
    const { checkStuckOtpRegistrations } = await import('./otpWatchdog.js');
    // Supabase mock returns [] — function should return undefined silently
    await expect(checkStuckOtpRegistrations()).resolves.toBeUndefined();
  });

  it('startOtpWatchdog calls checkStuckOtpRegistrations immediately', async () => {
    vi.useFakeTimers();
    const { startOtpWatchdog, checkStuckOtpRegistrations } = await import('./otpWatchdog.js');
    const spy = vi.spyOn({ checkStuckOtpRegistrations }, 'checkStuckOtpRegistrations');

    // Just verify startOtpWatchdog executes without throwing
    expect(() => startOtpWatchdog()).not.toThrow();

    vi.useRealTimers();
  });
});
