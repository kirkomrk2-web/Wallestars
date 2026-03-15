import React, { useState, useEffect } from 'react';

const ContractSigning = ({ registrationId, onSigned }) => {
  const [loading, setLoading] = useState(false);
  const [signed, setSigned] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState(null);

  const handleSign = async () => {
    if (!agreed) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/registration/${registrationId}/sign-contract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agreed: true, signed_at: new Date().toISOString() })
      });
      if (!response.ok) throw new Error('Failed to sign contract');
      setSigned(true);
      onSigned?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (signed) return (
    <div className="text-center p-8">
      <div className="text-green-500 text-5xl mb-4">✓</div>
      <h2 className="text-2xl font-bold text-green-700">Contract Signed!</h2>
      <p className="text-gray-600 mt-2">Your registration is now complete.</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Sign Your Contract</h2>
      <div className="bg-gray-50 border rounded p-4 h-64 overflow-y-auto mb-4 text-sm text-gray-700">
        <h3 className="font-bold mb-2">Wallestars Service Agreement</h3>
        <p>By signing this agreement, you confirm that:</p>
        <ul className="list-disc ml-4 mt-2 space-y-1">
          <li>All information provided is accurate and complete</li>
          <li>You are authorized to represent your business</li>
          <li>You agree to Wallestars Terms of Service</li>
          <li>You understand the platform fees and policies</li>
        </ul>
      </div>
      <label className="flex items-center gap-2 mb-4 cursor-pointer">
        <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="w-4 h-4" />
        <span className="text-sm">I have read and agree to the terms above</span>
      </label>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <button
        onClick={handleSign}
        disabled={!agreed || loading}
        className="w-full bg-blue-600 text-white py-3 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
      >
        {loading ? 'Signing...' : 'Sign Contract'}
      </button>
    </div>
  );
};

export default ContractSigning;
