import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../context/ThemeContext';

vi.mock('framer-motion', () => ({
    motion: new Proxy({}, {
        get: (_, tag) => ({ children, whileHover, whileTap, animate, initial, transition, exit, ...props }) =>
            React.createElement(tag, props, children),
    }),
}));

import Settings from '../pages/Settings';

describe('Settings Page', () => {
    it('renders in the browser without relying on a Node process global', () => {
        const originalProcess = globalThis.process;

        try {
            Object.defineProperty(globalThis, 'process', {
                configurable: true,
                value: { env: {} },
            });

            render(
                <ThemeProvider>
                    <Settings />
                </ThemeProvider>
            );

            expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
            expect(screen.getByText('Configure your Wallestars Control Center')).toBeInTheDocument();
            expect(screen.getByText('Node.js')).toBeInTheDocument();
            expect(screen.getByText('N/A')).toBeInTheDocument();
        } finally {
            Object.defineProperty(globalThis, 'process', {
                configurable: true,
                value: originalProcess,
            });
        }
    });
});
