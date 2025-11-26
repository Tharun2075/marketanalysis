/**
 * Real-Time Price Component
 * Displays live stock price via WebSocket with connection indicator
 */

import React, { useEffect, useState } from 'react';
import { Activity, WifiOff, Zap } from 'lucide-react';
import { useRealTimePrice } from '../hooks/useRealTimePrice';

export default function RealTimePrice({ symbol, exchange, initialPrice, currency = 'USD' }) {
  const { price, change, changePercent, isConnected, provider } = useRealTimePrice(symbol, exchange);
  const [displayPrice, setDisplayPrice] = useState(initialPrice);
  const [displayChange, setDisplayChange] = useState(0);
  const [displayChangePercent, setDisplayChangePercent] = useState(0);

  // Update display values when WebSocket data arrives
  useEffect(() => {
    if (price && price > 0) {
      setDisplayPrice(price);
      if (change !== null) setDisplayChange(change);
      if (changePercent !== null) setDisplayChangePercent(changePercent);
    }
  }, [price, change, changePercent]);

  // Determine color based on change
  const priceColor = displayChange >= 0 ? 'text-green-600' : 'text-red-600';
  const bgColor = displayChange >= 0 ? 'bg-green-50' : 'bg-red-50';

  return (
    <div className="space-y-2">
      {/* Price Display */}
      <div className="flex items-baseline space-x-4">
        <span className="text-4xl font-light text-slate-900">
          ${displayPrice ? displayPrice.toFixed(2) : '---'}
        </span>

        {/* Change Indicator */}
        {displayChange !== 0 && (
          <div className={`flex items-center ${priceColor} font-medium`}>
            <span className="text-lg">
              {displayChange >= 0 ? '+' : ''}
              ${Math.abs(displayChange).toFixed(2)}
            </span>
            <span className="text-sm ml-2">
              ({displayChangePercent >= 0 ? '+' : ''}
              {displayChangePercent.toFixed(2)}%)
            </span>
          </div>
        )}
      </div>

      {/* Connection Status */}
      <div className="flex items-center space-x-3">
        {/* Live Indicator */}
        {isConnected ? (
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center space-x-1.5 px-2 py-1 bg-green-50 text-green-700 rounded-full">
              <Activity size={12} className="animate-pulse" />
              <span className="font-medium">Live</span>
            </div>
            <span className="text-slate-400">
              via {provider || 'WebSocket'}
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 px-2 py-1 bg-slate-100 text-slate-500 rounded-full text-xs">
            <WifiOff size={12} />
            <span className="font-medium">Delayed</span>
          </div>
        )}

        {/* Currency */}
        <span className="text-xs text-slate-400">
          {currency}
        </span>

        {/* Real-time Badge */}
        {isConnected && (
          <div className="flex items-center space-x-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
            <Zap size={10} />
            <span className="font-semibold">Real-Time</span>
          </div>
        )}
      </div>

      {/* Provider Info (Debug - can remove later) */}
      {isConnected && provider && (
        <div className="text-xs text-slate-400">
          Provider: {provider.toUpperCase()}
        </div>
      )}
    </div>
  );
}
