import React from 'react';

/**
 * ConsensusMeter Component
 * Visual breakdown of analyst consensus ratings
 */
const ConsensusMeter = ({ breakdown, consensus, total }) => {
  const getWidth = (count) => (total > 0 ? (count / total) * 100 : 0);

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 h-full">
      <h3 className="text-lg font-bold text-slate-800 mb-1">Analyst Consensus</h3>
      <p className="text-slate-500 text-sm mb-6">Based on {total} analysts</p>

      {/* Horizontal Bar Chart */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 flex h-6 rounded-full overflow-hidden bg-slate-100">
          <div
            style={{ width: `${getWidth(breakdown.strongBuy)}%` }}
            className="bg-green-600 hover:bg-green-500 transition-colors"
            title={`Strong Buy: ${breakdown.strongBuy}`}
          />
          <div
            style={{ width: `${getWidth(breakdown.buy)}%` }}
            className="bg-green-400 hover:bg-green-300 transition-colors"
            title={`Buy: ${breakdown.buy}`}
          />
          <div
            style={{ width: `${getWidth(breakdown.hold)}%` }}
            className="bg-yellow-400 hover:bg-yellow-300 transition-colors"
            title={`Hold: ${breakdown.hold}`}
          />
          <div
            style={{ width: `${getWidth(breakdown.sell)}%` }}
            className="bg-red-400 hover:bg-red-300 transition-colors"
            title={`Sell: ${breakdown.sell}`}
          />
          <div
            style={{ width: `${getWidth(breakdown.strongSell)}%` }}
            className="bg-red-600 hover:bg-red-500 transition-colors"
            title={`Strong Sell: ${breakdown.strongSell}`}
          />
        </div>
      </div>

      {/* Consensus Label */}
      <div className="text-center mb-8">
        <span className="text-3xl font-black text-slate-800">{consensus}</span>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-600 mr-2" />
            Strong Buy
          </div>
          <span className="font-medium">{breakdown.strongBuy}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-400 mr-2" />
            Buy
          </div>
          <span className="font-medium">{breakdown.buy}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2" />
            Hold
          </div>
          <span className="font-medium">{breakdown.hold}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-400 mr-2" />
            Sell
          </div>
          <span className="font-medium">{breakdown.sell}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-600 mr-2" />
            Strong Sell
          </div>
          <span className="font-medium">{breakdown.strongSell}</span>
        </div>
      </div>
    </div>
  );
};

export default ConsensusMeter;
