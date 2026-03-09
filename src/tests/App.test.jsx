import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock socket.io-client before importing components
vi.mock('socket.io-client', () => ({
    io: vi.fn(() => ({
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
        connected: false,
        disconnect: vi.fn(),
    })),
}));

// Mock the SocketContext with full implementation
vi.mock('../context/SocketContext', () => ({
    useSocket: () => ({
        socket: {
            on: vi.fn(),
            off: vi.fn(),
            emit: vi.fn(),
            connected: false,
        },
        isConnected: false,
        systemInfo: {
            hostname: 'test-host',
            uptime: '1d',
            memory: { used: 1, total: 4 },
            cpu: 25,
        },
        activityLog: [],
        streamingEnabled: false,
        screenshot: null,
        requestScreenshot: vi.fn(),
        toggleScreenStream: vi.fn(),
    }),
    SocketProvider: ({ children }) => children,
}));

vi.mock('../components/Sidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('../components/Header', () => ({
    default: () => <div data-testid="header">Header</div>,
}));

vi.mock('../pages/Dashboard', () => ({
    default: () => <div>Dashboard Page</div>,
}));

vi.mock('../pages/Settings', () => ({
    default: () => <div>Settings Page</div>,
}));

vi.mock('../pages/SystemLogs', () => ({
    default: () => <div>System Logs Page</div>,
}));

import App from '../App';

describe('App Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the matching client-side route after the React Router migration', async () => {
        render(
            <MemoryRouter initialEntries={['/settings']}>
                <App />
            </MemoryRouter>
        );

        expect(await screen.findByText('Settings Page')).toBeInTheDocument();
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('redirects unknown client-side routes back to the dashboard', async () => {
        render(
            <MemoryRouter initialEntries={['/not-a-real-route']}>
                <App />
            </MemoryRouter>
        );

        expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
    });
});

describe('Utility Functions', () => {
    it('can perform basic operations', () => {
        const arr = [1, 2, 3];
        expect(arr.length).toBe(3);
        expect(arr.includes(2)).toBe(true);
    });

    it('handles objects correctly', () => {
        const obj = { name: 'Wallestars', version: '1.0.0' };
        expect(obj.name).toBe('Wallestars');
        expect(obj).toHaveProperty('version');
    });
});
