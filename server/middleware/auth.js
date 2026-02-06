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

    // 2. Check for Localhost (Loopback)
    // This allows the local frontend to work without explicit auth headers
    const ip = req.ip || req.connection.remoteAddress;
    const isLocalhost = ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1';

    if (isLocalhost) {
        // Grant Operator access to localhost (Frontend running on same machine)
        // Operator can control mouse/keyboard but maybe not system config
        req.user = { role: 'operator', source: 'localhost' };
        return next();
    }

    // 3. Default to Viewer (Read-only) for external unauthenticated requests
    // This prevents external IPs from controlling the computer by default
    req.user = { role: 'viewer', source: 'external' };
    next();
};
