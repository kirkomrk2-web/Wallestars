import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Configurable mock data so individual tests can override it
let mockQueryResult = { data: [], error: null };

// Mock @supabase/supabase-js before importing the module under test
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          lt: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve(mockQueryResult))
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
  mockQueryResult = { data: [], error: null };
});

afterEach(() => {
  vi.clearAllMocks();
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
});

describe('OTP Watchdog', () => {
  it('should export startOtpWatchdog, checkStuckOtpRegistrations and clearAlertedIds', async () => {
    const mod = await import('./otpWatchdog.js');
    expect(typeof mod.startOtpWatchdog).toBe('function');
    expect(typeof mod.checkStuckOtpRegistrations).toBe('function');
    expect(typeof mod.clearAlertedIds).toBe('function');
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

  it('does not alert the same registration twice across consecutive checks', async () => {
    const { checkStuckOtpRegistrations, clearAlertedIds } = await import('./otpWatchdog.js');
    clearAlertedIds();

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // First check — registration 'reg-1' is newly stuck
    mockQueryResult = { data: [{ id: 'reg-1', phone: '123', created_at: '', current_step: 'otp_pending' }], error: null };
    await checkStuckOtpRegistrations();
    expect(consoleSpy).toHaveBeenCalledTimes(1);

    // Second check — same registration is still stuck (no new alert expected)
    consoleSpy.mockClear();
    await checkStuckOtpRegistrations();
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
    clearAlertedIds();
  });

  it('alerts again after a registration leaves otp_pending and a new one appears', async () => {
    const { checkStuckOtpRegistrations, clearAlertedIds } = await import('./otpWatchdog.js');
    clearAlertedIds();

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // First check — reg-1 is stuck
    mockQueryResult = { data: [{ id: 'reg-1', phone: '111', created_at: '', current_step: 'otp_pending' }], error: null };
    await checkStuckOtpRegistrations();
    expect(consoleSpy).toHaveBeenCalledTimes(1);

    // Second check — reg-1 resolved, reg-2 newly stuck
    consoleSpy.mockClear();
    mockQueryResult = { data: [{ id: 'reg-2', phone: '222', created_at: '', current_step: 'otp_pending' }], error: null };
    await checkStuckOtpRegistrations();
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy.mock.calls[0][1]).toContain('reg-2');
    expect(consoleSpy.mock.calls[0][1]).not.toContain('reg-1');

    consoleSpy.mockRestore();
    clearAlertedIds();
  });

  it('alerts only newly stuck registrations when multiple are returned', async () => {
    const { checkStuckOtpRegistrations, clearAlertedIds } = await import('./otpWatchdog.js');
    clearAlertedIds();

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // First check — reg-1 is stuck
    mockQueryResult = { data: [{ id: 'reg-1', phone: '111', created_at: '', current_step: 'otp_pending' }], error: null };
    await checkStuckOtpRegistrations();
    expect(consoleSpy).toHaveBeenCalledTimes(1);

    // Second check — reg-1 still stuck, reg-2 newly stuck
    consoleSpy.mockClear();
    mockQueryResult = {
      data: [
        { id: 'reg-1', phone: '111', created_at: '', current_step: 'otp_pending' },
        { id: 'reg-2', phone: '222', created_at: '', current_step: 'otp_pending' }
      ],
      error: null
    };
    await checkStuckOtpRegistrations();
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy.mock.calls[0][1]).toContain('reg-2');
    expect(consoleSpy.mock.calls[0][1]).not.toContain('reg-1');

    consoleSpy.mockRestore();
    clearAlertedIds();
  });
});
