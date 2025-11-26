/**
 * React Hook for Real-Time Stock Prices via WebSocket
 * Usage: const { price, change, isConnected } = useRealTimePrice('AAPL', 'NYSE');
 */

import { useState, useEffect, useRef } from 'react';
import wsManager from '../services/websocketManager';

export function useRealTimePrice(symbol, exchange) {
  const [priceData, setPriceData] = useState({
    price: null,
    change: null,
    changePercent: null,
    timestamp: null,
    isConnected: false,
    provider: null
  });

  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!symbol || !exchange) return;

    console.log(`[useRealTimePrice] Subscribing to ${symbol} on ${exchange}`);

    // Subscribe to WebSocket
    const subscribe = async () => {
      const result = await wsManager.subscribe(
        symbol,
        exchange,
        (data) => {
          // Update price data when new data arrives
          setPriceData(prev => ({
            price: data.price,
            change: data.change || (prev.price ? data.price - prev.price : null),
            changePercent: data.changePercent || (prev.price ? ((data.price - prev.price) / prev.price * 100) : null),
            timestamp: data.timestamp || Date.now(),
            isConnected: true,
            provider: result?.provider || prev.provider
          }));
        }
      );

      subscriptionRef.current = result;

      if (result) {
        setPriceData(prev => ({
          ...prev,
          isConnected: true,
          provider: result.provider
        }));
      } else {
        // No WebSocket available, mark as disconnected
        setPriceData(prev => ({ ...prev, isConnected: false }));
      }
    };

    subscribe();

    // Cleanup on unmount or symbol change
    return () => {
      if (subscriptionRef.current) {
        console.log(`[useRealTimePrice] Unsubscribing from ${symbol}`);
        wsManager.unsubscribe(symbol, exchange);
        subscriptionRef.current = null;
      }
    };
  }, [symbol, exchange]);

  return priceData;
}

/**
 * Hook to subscribe to multiple tickers at once
 */
export function useRealTimePrices(tickers) {
  const [prices, setPrices] = useState({});

  useEffect(() => {
    if (!tickers || tickers.length === 0) return;

    const subscriptions = [];

    const subscribe = async () => {
      for (const { symbol, exchange } of tickers) {
        const result = await wsManager.subscribe(
          symbol,
          exchange,
          (data) => {
            setPrices(prev => ({
              ...prev,
              [symbol]: {
                price: data.price,
                change: data.change,
                changePercent: data.changePercent,
                timestamp: data.timestamp || Date.now()
              }
            }));
          }
        );

        if (result) {
          subscriptions.push({ symbol, exchange });
        }
      }
    };

    subscribe();

    // Cleanup
    return () => {
      subscriptions.forEach(({ symbol, exchange }) => {
        wsManager.unsubscribe(symbol, exchange);
      });
    };
  }, [JSON.stringify(tickers)]); // Re-subscribe if ticker list changes

  return prices;
}

/**
 * Hook to get WebSocket connection status
 */
export function useWebSocketStatus() {
  const [status, setStatus] = useState({});

  useEffect(() => {
    // Update status every 2 seconds
    const interval = setInterval(() => {
      setStatus(wsManager.getStatus());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return status;
}
