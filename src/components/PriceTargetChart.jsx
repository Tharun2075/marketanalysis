import React from 'react';
import { TrendingUp, TrendingDown, Target, ArrowRight } from 'lucide-react';
import { calculateUpside } from '../utils/formatters';

/**
 * PriceTargetChart Component
 * Compact display of analyst price targets with clear upside/downside indication
 */
const PriceTargetChart = ({ targets }) => {
  const { low, average, high, current } = targets;

  // Handle missing data gracefully
  if (!current || (!low && !average && !high)) {
    return (
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center text-slate-500 text-sm">
        Price target data not available
      </div>
    );
  }

  const upside = calculateUpside(current, average);
  const isPositive = upside >= 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header with main insight */}
      <div className={`px-5 py-4 ${isPositive ? 'bg-green-50' : 'bg-red-50'} border-b border-slate-100`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
              {isPositive ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div>
              <div className="text-sm text-slate-600">Analyst Consensus Target</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900">${average?.toFixed(2) || '—'}</span>
                <span className={`text-lg font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  ({isPositive ? '+' : ''}{upside.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 uppercase tracking-wide">Current</div>
            <div className="text-lg font-medium text-slate-700">${current?.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Price Range */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between text-sm">
          {/* Low */}
          <div className="text-center">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Low</div>
            <div className="font-semibold text-slate-600">${low?.toFixed(2) || '—'}</div>
            {low && current && (
              <div className={`text-xs mt-0.5 ${low < current ? 'text-red-500' : 'text-green-500'}`}>
                {((low - current) / current * 100).toFixed(0)}%
              </div>
            )}
          </div>

          {/* Arrow */}
          <div className="flex-1 mx-4">
            <div className="h-1.5 bg-gradient-to-r from-red-200 via-slate-200 to-green-200 rounded-full relative">
              {/* Current price marker */}
              {current && low && high && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-800 rounded-full border-2 border-white shadow"
                  style={{
                    left: `${Math.min(Math.max(((current - low) / (high - low)) * 100, 0), 100)}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  title={`Current: $${current.toFixed(2)}`}
                />
              )}
            </div>
          </div>

          {/* High */}
          <div className="text-center">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">High</div>
            <div className="font-semibold text-slate-600">${high?.toFixed(2) || '—'}</div>
            {high && current && (
              <div className={`text-xs mt-0.5 ${high > current ? 'text-green-500' : 'text-red-500'}`}>
                +{((high - current) / current * 100).toFixed(0)}%
              </div>
            )}
          </div>
        </div>

        {/* 12-month note */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-center gap-1 text-xs text-slate-400">
          <Target className="w-3 h-3" />
          <span>12-month price targets from analyst reports</span>
        </div>
      </div>
    </div>
  );
};

export default PriceTargetChart;
