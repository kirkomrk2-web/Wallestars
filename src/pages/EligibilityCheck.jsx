import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCheck,
  ShieldCheck,
  FileCheck,
  Ban
} from 'lucide-react';

export default function EligibilityCheck() {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const eligibilityCriteria = [
    { text: 'Фирмата да е ООД или ЕООД', icon: Building2 },
    { text: 'Собственикът да притежава поне 50% дял', icon: UserCheck },
    { text: 'Фирмата да няма съществуващ Wallester акаунт', icon: ShieldCheck },
    { text: 'Фирмата да не е в черен списък', icon: Ban }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/wallester/check-eligibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error checking eligibility:', err);
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-8 border border-white/10"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Проверка за Eligibility</h1>
                <p className="text-dark-400 mt-1">
                  Въведете 3 имена за да проверите eligible ООД фирми за Wallester
                </p>
              </div>
            </div>
          </div>
          <div className="px-4 py-2 bg-primary-500/20 border border-primary-500/30 rounded-lg">
            <span className="text-primary-400 font-semibold text-sm">Задача 18</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-effect rounded-2xl p-8 border border-white/10"
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-primary-400" />
            Данни за проверка
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Име
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-dark-800/50 border border-white/10 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Въведете име..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Презиме
                </label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-dark-800/50 border border-white/10 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Въведете презиме..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Фамилия
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-dark-800/50 border border-white/10 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Въведете фамилия..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Проверяване...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Провери Eligibility
                </>
              )}
            </button>
          </form>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-400 font-semibold">Грешка при проверка</h3>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Result Display */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-6 rounded-lg border ${
                result.eligible
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-orange-500/10 border-orange-500/30'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                {result.eligible ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-orange-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold text-lg ${
                    result.eligible ? 'text-green-400' : 'text-orange-400'
                  }`}>
                    {result.eligible ? 'Eligible!' : 'Не е Eligible'}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    result.eligible ? 'text-green-300' : 'text-orange-300'
                  }`}>
                    {result.reason}
                  </p>
                </div>
              </div>

              {result.companyName && (
                <div className="mt-4 p-4 bg-dark-800/50 rounded-lg">
                  <p className="text-sm text-dark-400 mb-1">Фирма:</p>
                  <p className="text-white font-semibold">{result.companyName}</p>
                </div>
              )}

              {result.details && Object.keys(result.details).length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-dark-400 font-semibold">Детайли:</p>
                  <div className="space-y-1">
                    {Object.entries(result.details).map(([key, value]) => (
                      <div key={key} className="text-sm text-dark-300 flex gap-2">
                        <span className="text-dark-500">•</span>
                        <span className="capitalize">{key}:</span>
                        <span className="text-white">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Criteria Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-2xl p-6 border border-white/10 h-fit"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary-400" />
            Критерии за Eligibility
          </h3>

          <div className="space-y-3">
            {eligibilityCriteria.map((criterion, index) => {
              const Icon = criterion.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-dark-800/30 rounded-lg border border-white/5 hover:border-primary-500/30 transition-all"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <Icon className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-dark-300 leading-relaxed">
                        {criterion.text}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg">
            <p className="text-xs text-primary-400">
              <strong>Забележка:</strong> Проверката използва данни от Търговския регистър на България.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
