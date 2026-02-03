import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, RefreshCw, AlertTriangle } from 'lucide-react';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/logs');
      if (!response.ok) throw new Error('Failed to fetch logs');
      const data = await response.json();
      setLogs(data.logs);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not load system logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">System Logs</h2>
          <p className="text-dark-300">View system activities and events</p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors text-white"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 text-red-400">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="glass-effect rounded-xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 text-sm font-medium text-dark-300">ID</th>
                <th className="p-4 text-sm font-medium text-dark-300">Timestamp</th>
                <th className="p-4 text-sm font-medium text-dark-300">Type</th>
                <th className="p-4 text-sm font-medium text-dark-300">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-sm text-dark-300">#{log.id}</td>
                  <td className="p-4 text-sm text-white">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      log.type === 'chat' ? 'bg-blue-500/20 text-blue-400' :
                      log.type === 'command' ? 'bg-yellow-500/20 text-yellow-400' :
                      log.type === 'android' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {log.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-white font-mono">{log.details}</td>
                </tr>
              ))}
              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-dark-400">
                    No logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
