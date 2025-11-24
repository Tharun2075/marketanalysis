import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { getAPIUsage } from '../services/api';

/**
 * APIUsageIndicator Component
 * Displays current API usage stats in the UI
 */
const APIUsageIndicator = () => {
  const [usage, setUsage] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    updateUsage();
  }, []);

  const updateUsage = () => {
    const stats = getAPIUsage();
    setUsage(stats);
  };

  if (!usage) return null;

  // Color coding based on usage
  const getColor = () => {
    if (usage.percentage < 50) return 'text-green-600';
    if (usage.percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBarColor = () => {
    if (usage.percentage < 50) return 'bg-green-500';
    if (usage.percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setShow(!show)}
        className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm"
        title="View API Usage"
      >
        <Activity size={16} className={getColor()} />
        <span className="hidden md:inline font-medium text-slate-700">
          API: {usage.remaining}/{usage.limit}
        </span>
        <span className="md:hidden font-medium text-slate-700">
          {usage.remaining}
        </span>
      </button>

      {/* Dropdown Panel */}
      {show && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-slate-200 p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 flex items-center">
              <Activity size={16} className="mr-2" />
              API Usage
            </h3>
            <button
              onClick={updateUsage}
              className="text-slate-500 hover:text-slate-700"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">Today</span>
              <span className={`font-bold ${getColor()}`}>
                {usage.percentage}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${getBarColor()} transition-all duration-300`}
                style={{ width: `${usage.percentage}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Calls made:</span>
              <span className="font-semibold text-slate-800">{usage.count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Remaining:</span>
              <span className="font-semibold text-green-600">{usage.remaining}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Daily limit:</span>
              <span className="font-semibold text-slate-800">{usage.limit}</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
            Resets daily at midnight UTC
          </div>
        </div>
      )}
    </div>
  );
};

export default APIUsageIndicator;
