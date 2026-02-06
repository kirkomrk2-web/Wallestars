import { getPermissions } from '../services/permissions.js';

/**
 * Authentication Middleware
 * Determines the user role based on API key or request source.
 */
export const authMiddleware = (req, res, next) => {
    const permissions = getPermissions();
    const authHeader = req.headers.authorization;

    // 1. Check for API Key in Authorization header
    if (authHeader) {
        const token = authHeader.replace('Bearer ', '').trim();
        const validation = permissions.validateApiKey(token);

        if (validation.valid) {
            // Map token type to role
            let role = 'viewer';

            if (validation.type === 'wallestars') {
                // ws- tokens are treated as admin keys for agents
                role = 'admin';
            } else if (validation.type === 'anthropic') {
                // If they possess the Anthropic Key, they are the owner
                role = 'admin';
            }

            req.user = { role, type: validation.type };
            return next();
        }
    }

    // 2. Check for Localhost or Tailscale
    // This allows the local frontend and Tailscale trusted network to work without explicit auth headers
    const ip = req.ip || req.connection.remoteAddress;
    const isLocalhost = ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1';

    // Check if IP is in Tailscale range (100.64.0.0/10)
    // 100.64.0.0 = 1681915904
    // 100.127.255.255 = 1686110207
    const isTailscale = (ipStr) => {
        // Handle IPv6-mapped IPv4 addresses (e.g. ::ffff:100.64.0.1)
        const normalizedIp = ipStr.startsWith('::ffff:') ? ipStr.substring(7) : ipStr;

        const parts = normalizedIp.split('.');
        if (parts.length !== 4) return false;
        const num = (parseInt(parts[0]) << 24) | (parseInt(parts[1]) << 16) | (parseInt(parts[2]) << 8) | parseInt(parts[3]);
        // Handle unsigned integer conversion
        const unsignedNum = num >>> 0;
        return unsignedNum >= 1681915904 && unsignedNum <= 1686110207;
    };

    if (isLocalhost || isTailscale(ip)) {
        // Grant Operator access to localhost and Tailscale
        // Operator can control mouse/keyboard but maybe not system config
        req.user = { role: 'operator', source: isLocalhost ? 'localhost' : 'tailscale' };
        return next();
    }

    // 3. Default to Viewer (Read-only) for external unauthenticated requests
    // This prevents external IPs from controlling the computer by default
    req.user = { role: 'viewer', source: 'external' };
    next();
};
