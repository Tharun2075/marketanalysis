import React from 'react';
import { calculateUpside } from '../utils/formatters';

/**
 * PriceTargetChart Component
 * Visual representation of analyst price targets
 */
const PriceTargetChart = ({ targets }) => {
  const { low, average, high, current } = targets;

  const safeLow = low || current * 0.9;
  const safeHigh = high || current * 1.1;
  const safeAvg = average || current;

  const minRange = Math.min(safeLow, current) * 0.9;
  const maxRange = Math.max(safeHigh, current) * 1.1;
  const totalRange = maxRange - minRange;

  const getPos = (val) => {
    if (totalRange === 0) return 50;
    return ((val - minRange) / totalRange) * 100;
  };

  const upside = calculateUpside(current, safeAvg);
  const isPositive = upside >= 0;

  return (
    <div className="mt-6 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Analyst Price Targets (12 Month)</h3>
          <p className="text-slate-500 text-sm">Based on recent analyst reports</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500">Average Upside</div>
          <div className={`text-xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{upside.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="relative h-16 w-full mt-4">
        {/* Base Line */}
        <div className="absolute top-1/2 left-0 right-0 h-2 bg-slate-100 rounded-full -translate-y-1/2 overflow-hidden">
          <div
            className="absolute h-full bg-slate-200"
            style={{ left: `${getPos(safeLow)}%`, right: `${100 - getPos(safeHigh)}%` }}
          />
        </div>

        {/* Low Target */}
        <div
          className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
          style={{ left: `${getPos(safeLow)}%` }}
        >
          <div className="w-1 h-4 bg-slate-400 mb-1" />
          <div className="text-xs font-medium text-slate-500 mt-2">${safeLow.toFixed(2)}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Low</div>
        </div>

        {/* High Target */}
        <div
          className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
          style={{ left: `${getPos(safeHigh)}%` }}
        >
          <div className="w-1 h-4 bg-slate-400 mb-1" />
          <div className="text-xs font-medium text-slate-500 mt-2">${safeHigh.toFixed(2)}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">High</div>
        </div>

        {/* Average Target */}
        <div
          className="absolute top-1/2 -translate-y-1/2 z-10 flex flex-col items-center group cursor-pointer"
          style={{ left: `${getPos(safeAvg)}%` }}
        >
          <div className="w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-md" />
          <div className="absolute -top-8 bg-blue-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Average: ${safeAvg.toFixed(2)}
          </div>
          <div className="text-xs font-bold text-blue-700 mt-2">${safeAvg.toFixed(2)}</div>
          <div className="text-[10px] text-blue-600 uppercase tracking-wider">Avg</div>
        </div>

        {/* Current Price Indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
          style={{ left: `${getPos(current)}%` }}
        >
          <div className="relative">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold py-1 px-2 rounded">
              Now
            </div>
            <div className="w-0.5 h-10 bg-slate-800 border-l-2 border-dashed border-slate-800 opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceTargetChart;
