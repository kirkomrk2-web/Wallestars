import React from 'react';

// Simple debug version of Settings to test if routing works
export default function SettingsDebug() {
  return (
    <div style={{
      background: 'white',
      color: 'black',
      padding: '20px',
      minHeight: '100vh'
    }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>Settings Page - Debug Mode</h1>
      <p>If you can see this message, the routing is working correctly!</p>
      <p>The issue might be with the Tailwind CSS classes or component styling.</p>

      <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
        <h2 style={{ fontSize: '24px' }}>Quick Test:</h2>
        <button
          onClick={() => alert('Button clicked!')}
          style={{
            padding: '10px 20px',
            background: '#0ea5e9',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Click Me to Test JavaScript
        </button>
      </div>
    </div>
  );
}
