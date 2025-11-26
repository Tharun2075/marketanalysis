/**
 * WebSocket Manager - Pools connections from multiple providers
 * Automatically routes to the best provider based on exchange
 */

class WebSocketManager {
  constructor() {
    this.connections = new Map();
    this.subscribers = new Map();
    this.providers = this.initializeProviders();

    // 🚀 INGENIOUS CACHE: Store all symbols that come through WebSocket
    this.priceCache = new Map(); // symbol -> { price, timestamp, volume, exchange }
    this.cacheExpiry = 60000; // 1 minute expiry for stale data
  }

  /**
   * Initialize WebSocket providers configuration
   */
  initializeProviders() {
    return {
      // Finnhub - Free for US stocks
      finnhub: {
        url: 'wss://ws.finnhub.io',
        exchanges: ['NYSE', 'NASDAQ', 'AMEX'],
        apiKey: import.meta.env.VITE_FINNHUB_API_KEY,
        free: true,
        format: 'finnhub',
        priority: 1 // Higher priority = used first
      },

      // Real-Time Finance - Free for US + EU
      rtf: {
        url: 'wss://ws.financialmodelingprep.com',
        exchanges: ['NYSE', 'NASDAQ', 'LSE', 'EURONEXT'],
        apiKey: null, // No API key needed!
        free: true,
        format: 'rtf',
        priority: 2
      },

      // Twelve Data - Global coverage (paid)
      twelvedata: {
        url: 'wss://ws.twelvedata.com/v1/quotes/price',
        exchanges: ['ALL'], // Supports all exchanges
        apiKey: import.meta.env.VITE_TWELVEDATA_API_KEY,
        free: false,
        format: 'twelvedata',
        priority: 3
      },

      // FMP - Fallback (if user has premium)
      fmp: {
        url: 'wss://websockets.financialmodelingprep.com',
        exchanges: ['ALL'],
        apiKey: import.meta.env.VITE_FMP_API_KEY,
        free: false,
        format: 'fmp',
        priority: 4
      }
    };
  }

  /**
   * Select best provider for given exchange
   * @param {string} exchange - Exchange code (NYSE, LSE, JPX, etc.)
   * @returns {string|null} Provider key
   */
  selectProvider(exchange) {
    const available = Object.entries(this.providers)
      .filter(([_, config]) => {
        // Check if provider supports this exchange
        if (config.exchanges.includes('ALL')) return true;
        return config.exchanges.includes(exchange);
      })
      .filter(([_, config]) => {
        // Check if API key is configured (if required)
        if (config.free) return true;
        return config.apiKey && config.apiKey !== 'your_api_key_here';
      })
      .sort((a, b) => a[1].priority - b[1].priority); // Sort by priority

    return available.length > 0 ? available[0][0] : null;
  }

  /**
   * Connect to WebSocket provider
   * @param {string} provider - Provider key
   * @returns {Promise<WebSocket>}
   */
  async connect(provider) {
    if (this.connections.has(provider)) {
      return this.connections.get(provider);
    }

    const config = this.providers[provider];
    if (!config) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    return new Promise((resolve, reject) => {
      // Build WebSocket URL with API key if Finnhub
      let wsUrl = config.url;
      if (provider === 'finnhub' && config.apiKey) {
        wsUrl = `${config.url}?token=${config.apiKey}`;
      }

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`[WebSocket] ✅ Connected to ${provider}`);

        // Send authentication if required (Finnhub uses token in URL, skip auth message)
        if (config.apiKey && provider !== 'finnhub') {
          this.authenticate(ws, provider, config.apiKey);
        }

        this.connections.set(provider, ws);
        resolve(ws);
      };

      ws.onerror = (error) => {
        console.error(`[WebSocket] ❌ ${provider} connection error:`, error);
        reject(error);
      };

      ws.onclose = () => {
        console.log(`[WebSocket] 🔌 ${provider} disconnected`);
        this.connections.delete(provider);
      };

      ws.onmessage = (event) => {
        this.handleMessage(provider, event.data);
      };
    });
  }

  /**
   * Authenticate with WebSocket provider
   */
  authenticate(ws, provider, apiKey) {
    const config = this.providers[provider];

    switch (config.format) {
      case 'finnhub':
        ws.send(JSON.stringify({ type: 'auth', data: apiKey }));
        break;

      case 'fmp':
        ws.send(JSON.stringify({ event: 'login', data: { apiKey } }));
        break;

      case 'twelvedata':
        // Twelve Data uses API key in URL
        break;

      default:
        // No auth needed (RTF)
        break;
    }
  }

  /**
   * Subscribe to ticker symbol
   * @param {string} symbol - Ticker symbol
   * @param {string} exchange - Exchange code
   * @param {function} callback - Callback for price updates
   */
  async subscribe(symbol, exchange, callback) {
    const provider = this.selectProvider(exchange);

    if (!provider) {
      console.warn(`[WebSocket] No provider available for ${exchange}`);
      return null;
    }

    console.log(`[WebSocket] 📡 Subscribing to ${symbol} on ${exchange} via ${provider}`);

    try {
      const ws = await this.connect(provider);
      const config = this.providers[provider];

      // Send subscription message
      const subMessage = this.formatSubscription(provider, symbol, config.format);
      ws.send(JSON.stringify(subMessage));

      // Store subscriber
      const key = `${symbol}-${exchange}`;
      if (!this.subscribers.has(key)) {
        this.subscribers.set(key, []);
      }
      this.subscribers.get(key).push({ provider, callback });

      return { provider, symbol, exchange };
    } catch (error) {
      console.error(`[WebSocket] Failed to subscribe to ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Format subscription message for provider
   */
  formatSubscription(provider, symbol, format) {
    switch (format) {
      case 'finnhub':
        return { type: 'subscribe', symbol: symbol };

      case 'fmp':
        return { event: 'subscribe', data: { ticker: [symbol.toLowerCase()] } };

      case 'twelvedata':
        return { action: 'subscribe', params: { symbols: symbol } };

      case 'rtf':
        return { type: 'subscribe', symbol: symbol };

      default:
        return { type: 'subscribe', symbol: symbol };
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  handleMessage(provider, data) {
    try {
      const parsed = JSON.parse(data);
      const config = this.providers[provider];

      // Parse price data based on provider format
      const priceData = this.parseMessage(parsed, config.format);

      if (priceData) {
        // 🚀 CACHE THE PRICE DATA (your ingenious idea!)
        this.priceCache.set(priceData.symbol, {
          price: priceData.price,
          timestamp: priceData.timestamp || Date.now(),
          volume: priceData.volume,
          exchange: priceData.exchange,
          provider: provider
        });

        // Notify subscribers
        const key = `${priceData.symbol}-${priceData.exchange || 'UNKNOWN'}`;
        const subscribers = this.subscribers.get(key) || [];

        subscribers.forEach(sub => {
          if (sub.provider === provider) {
            sub.callback(priceData);
          }
        });
      }
    } catch (error) {
      console.error(`[WebSocket] Parse error from ${provider}:`, error);
    }
  }

  /**
   * Parse message based on provider format
   */
  parseMessage(data, format) {
    switch (format) {
      case 'finnhub':
        // Finnhub format: { type: 'trade', data: [{ s: 'AAPL', p: 150.25, ... }] }
        if (data.type === 'trade' && data.data && data.data.length > 0) {
          const trade = data.data[0];
          return {
            symbol: trade.s,
            price: trade.p,
            volume: trade.v,
            timestamp: trade.t
          };
        }
        break;

      case 'fmp':
        // FMP format: { s: 'AAPL', ap: 150.25, t: timestamp }
        if (data.s) {
          return {
            symbol: data.s.toUpperCase(),
            price: data.lp || data.ap,
            bid: data.bp,
            ask: data.ap,
            timestamp: data.t
          };
        }
        break;

      case 'twelvedata':
        // Twelve Data format: { symbol: 'AAPL', price: 150.25, ... }
        if (data.price) {
          return {
            symbol: data.symbol,
            price: data.price,
            timestamp: data.timestamp
          };
        }
        break;

      case 'rtf':
        // Real-Time Finance format
        if (data.price) {
          return {
            symbol: data.symbol,
            price: data.price,
            change: data.change,
            changePercent: data.changePercent,
            timestamp: Date.now()
          };
        }
        break;
    }

    return null;
  }

  /**
   * Unsubscribe from ticker
   */
  unsubscribe(symbol, exchange) {
    const key = `${symbol}-${exchange}`;
    const subscribers = this.subscribers.get(key);

    if (subscribers) {
      subscribers.forEach(sub => {
        const ws = this.connections.get(sub.provider);
        if (ws && ws.readyState === WebSocket.OPEN) {
          const config = this.providers[sub.provider];
          const unsubMsg = this.formatUnsubscription(sub.provider, symbol, config.format);
          ws.send(JSON.stringify(unsubMsg));
        }
      });

      this.subscribers.delete(key);
      console.log(`[WebSocket] Unsubscribed from ${symbol} on ${exchange}`);
    }
  }

  /**
   * Format unsubscription message
   */
  formatUnsubscription(provider, symbol, format) {
    switch (format) {
      case 'finnhub':
        return { type: 'unsubscribe', symbol: symbol };

      case 'fmp':
        return { event: 'unsubscribe', data: { ticker: [symbol.toLowerCase()] } };

      case 'twelvedata':
        return { action: 'unsubscribe', params: { symbols: symbol } };

      default:
        return { type: 'unsubscribe', symbol: symbol };
    }
  }

  /**
   * Disconnect all connections
   */
  disconnectAll() {
    this.connections.forEach((ws, provider) => {
      console.log(`[WebSocket] Closing ${provider}...`);
      ws.close();
    });
    this.connections.clear();
    this.subscribers.clear();
  }

  /**
   * Get connection status
   */
  getStatus() {
    const status = {};
    Object.keys(this.providers).forEach(provider => {
      const ws = this.connections.get(provider);
      status[provider] = {
        connected: ws && ws.readyState === WebSocket.OPEN,
        subscribers: Array.from(this.subscribers.values())
          .flat()
          .filter(s => s.provider === provider).length
      };
    });
    return status;
  }

  /**
   * 🚀 YOUR INGENIOUS IDEA: Get cached price for a symbol
   * @param {string} symbol - Ticker symbol
   * @returns {Object|null} Cached price data or null if not found/expired
   */
  getCachedPrice(symbol) {
    const cached = this.priceCache.get(symbol);
    if (!cached) return null;

    // Check if cache is stale (older than 1 minute)
    const age = Date.now() - cached.timestamp;
    if (age > this.cacheExpiry) {
      this.priceCache.delete(symbol);
      return null;
    }

    return cached;
  }

  /**
   * 🚀 YOUR INGENIOUS IDEA: Search WebSocket cache
   * Returns all symbols in cache that match the query
   * @param {string} query - Search query
   * @param {number} limit - Max results
   * @returns {Array} Array of cached symbols with prices
   */
  searchCache(query, limit = 10) {
    const queryUpper = query.toUpperCase();
    const now = Date.now();
    const results = [];

    for (const [symbol, data] of this.priceCache.entries()) {
      // Skip stale data
      if (now - data.timestamp > this.cacheExpiry) {
        this.priceCache.delete(symbol);
        continue;
      }

      // Match query
      if (symbol.includes(queryUpper)) {
        results.push({
          symbol,
          price: data.price,
          exchange: data.exchange,
          provider: data.provider,
          age: Math.floor((now - data.timestamp) / 1000) // seconds
        });
      }

      if (results.length >= limit) break;
    }

    return results.sort((a, b) => {
      // Exact matches first
      if (a.symbol === queryUpper) return -1;
      if (b.symbol === queryUpper) return 1;
      // Then by symbol length (shorter first)
      return a.symbol.length - b.symbol.length;
    });
  }

  /**
   * Get all cached symbols (for debugging)
   */
  getCachedSymbols() {
    const now = Date.now();
    return Array.from(this.priceCache.entries())
      .filter(([_, data]) => now - data.timestamp <= this.cacheExpiry)
      .map(([symbol, data]) => ({
        symbol,
        price: data.price,
        age: Math.floor((now - data.timestamp) / 1000)
      }));
  }
}

// Export singleton instance
export const wsManager = new WebSocketManager();

// Export for React hooks
export default wsManager;
