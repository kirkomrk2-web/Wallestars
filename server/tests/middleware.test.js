import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authMiddleware } from '../middleware/auth.js';
import { getPermissions } from '../services/permissions.js';

// Mock dependencies
vi.mock('../services/permissions.js', () => ({
  getPermissions: vi.fn(() => ({
    validateApiKey: vi.fn()
  }))
}));

describe('Auth Middleware', () => {
  let req, res, next;
  let permissionsMock;

  beforeEach(() => {
    req = {
      headers: {},
      connection: { remoteAddress: '192.168.1.100' }, // Default external IP
      ip: '192.168.1.100'
    };
    res = {};
    next = vi.fn();
    permissionsMock = {
      validateApiKey: vi.fn()
    };
    getPermissions.mockReturnValue(permissionsMock);
    process.env.ANTHROPIC_API_KEY = 'sk-ant-valid';
    process.env.WALLESTARS_API_KEY = 'ws-valid';
  });

  it('should allow access with valid Anthropic API key as Admin', () => {
    req.headers.authorization = 'Bearer sk-ant-valid';
    permissionsMock.validateApiKey.mockReturnValue({ valid: true, type: 'anthropic' });

    authMiddleware(req, res, next);

    expect(permissionsMock.validateApiKey).toHaveBeenCalledWith('sk-ant-valid');
    expect(req.user).toEqual({ role: 'admin', type: 'anthropic' });
    expect(next).toHaveBeenCalled();
  });

  it('should allow access with valid Wallestars API key as Admin', () => {
    req.headers.authorization = 'Bearer ws-valid';
    permissionsMock.validateApiKey.mockReturnValue({ valid: true, type: 'wallestars' });

    authMiddleware(req, res, next);

    expect(req.user).toEqual({ role: 'admin', type: 'wallestars' });
    expect(next).toHaveBeenCalled();
  });

  it('should grant Operator role for Localhost (IPv4)', () => {
    req.ip = '127.0.0.1';

    authMiddleware(req, res, next);

    expect(req.user).toEqual({ role: 'operator', source: 'localhost' });
    expect(next).toHaveBeenCalled();
  });

  it('should grant Operator role for Localhost (IPv6)', () => {
    req.ip = '::1';

    authMiddleware(req, res, next);

    expect(req.user).toEqual({ role: 'operator', source: 'localhost' });
    expect(next).toHaveBeenCalled();
  });

  it('should grant Operator role for Tailscale IP (IPv4)', () => {
    req.ip = '100.64.0.5'; // Valid Tailscale IP

    authMiddleware(req, res, next);

    expect(req.user).toEqual({ role: 'operator', source: 'tailscale' });
    expect(next).toHaveBeenCalled();
  });

  it('should grant Operator role for Tailscale IP (IPv6-mapped IPv4)', () => {
    req.ip = '::ffff:100.64.0.5';

    authMiddleware(req, res, next);

    expect(req.user).toEqual({ role: 'operator', source: 'tailscale' });
    expect(next).toHaveBeenCalled();
  });

  it('should NOT grant Operator role for non-Tailscale 100.x.x.x IP', () => {
    req.ip = '100.1.2.3'; // Carrier-grade NAT, not Tailscale CGNAT range

    authMiddleware(req, res, next);

    expect(req.user).toEqual({ role: 'viewer', source: 'external' });
    expect(next).toHaveBeenCalled();
  });

  it('should default to Viewer role for external IP without token', () => {
    req.ip = '192.168.1.50';

    authMiddleware(req, res, next);

    expect(req.user).toEqual({ role: 'viewer', source: 'external' });
    expect(next).toHaveBeenCalled();
  });
});
