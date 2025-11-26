/**
 * Financial Data API Service
 * Handles all API calls to Financial Modeling Prep with usage tracking
 */

import { getMockData } from './mockData';

// Get API key from environment variable (IMPORTANT: Never hardcode API keys!)
const API_KEY = import.meta.env.VITE_FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/stable';

// API Call Counter (persists in sessionStorage)
class APICallTracker {
  constructor() {
    this.storageKey = 'fmp_api_call_count';
    this.storageDate = 'fmp_api_call_date';
  }

  getCount() {
    const today = new Date().toDateString();
    const storedDate = sessionStorage.getItem(this.storageDate);

    // Reset counter if it's a new day
    if (storedDate !== today) {
      this.reset();
      return 0;
    }

    return parseInt(sessionStorage.getItem(this.storageKey) || '0');
  }

  increment() {
    const today = new Date().toDateString();
    sessionStorage.setItem(this.storageDate, today);
    const newCount = this.getCount() + 1;
    sessionStorage.setItem(this.storageKey, newCount.toString());
    return newCount;
  }

  reset() {
    sessionStorage.setItem(this.storageKey, '0');
    sessionStorage.setItem(this.storageDate, new Date().toDateString());
  }

  getRemaining(limit = 250) {
    return Math.max(0, limit - this.getCount());
  }
}

const apiTracker = new APICallTracker();

/**
 * Safe fetch wrapper that handles errors gracefully and tracks API calls
 * @param {string} url - API endpoint URL
 * @param {boolean} trackCall - Whether to count this as an API call (default: true)
 * @returns {Promise<Object|null>} JSON response or null on error
 */
const safeFetch = async (url, trackCall = true) => {
  try {
    // Track API call
    if (trackCall) {
      const count = apiTracker.increment();
      const remaining = apiTracker.getRemaining();
      console.log(`[API] 📊 Call #${count} today | ${remaining} remaining`);
    }

    const res = await fetch(url);

    // Log response details
    const contentType = res.headers.get('content-type');
    console.log(`[API] 📡 ${res.status} ${res.statusText} | Type: ${contentType}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.warn(`[API] ⚠️ Request failed:`, errorText.substring(0, 200));

      // Check if it's an "Access denied" error
      if (errorText.includes('Access denied') || errorText.includes('Invalid API KEY')) {
        console.error('[API] ❌ API Key is invalid or expired!');
        console.log('[API] 💡 Update your key in .env file. See UPDATE_API_KEY.md');
      }

      // Check if it's a premium/paid endpoint error (402 Payment Required)
      if (res.status === 402 || errorText.includes('Premium Query Parameter') || errorText.includes('not available under your current subscription')) {
        console.warn('[API] 💰 Premium endpoint - not available on free tier');
        return { isPremiumOnly: true }; // Special marker for premium-only data
      }

      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.warn(`[API] ⚠️ Network error:`, error.message);
    return null;
  }
};

/**
 * Check if API response contains an error
 * @param {any} data - API response data
 * @returns {boolean} True if data is invalid/error
 */
const isError = (data) => {
  // Don't treat premium-only marker as error
  if (isPremiumOnly(data)) return false;

  return !data ||
         data["Error Message"] ||
         (Array.isArray(data) && data.length === 0);
};

/**
 * Check if response is premium-only (requires paid subscription)
 */
const isPremiumOnly = (data) => {
  return data && typeof data === 'object' && data.isPremiumOnly === true;
};

/**
 * Calculate consensus rating from analyst breakdown
 * @param {Object} counts - Breakdown of analyst ratings
 * @returns {string} Consensus rating label
 */
const calculateConsensus = (counts) => {
  const total = Object.values(counts).reduce((sum, val) => sum + val, 0);

  if (total === 0) return 'N/A';

  const ratingLabels = ['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell'];
  const maxRating = ratingLabels.reduce((max, rating) =>
    (counts[rating] || 0) > (counts[max] || 0) ? rating : max
  );

  return maxRating;
};

/**
 * Fetch comprehensive stock data from multiple API endpoints
 * @param {string} ticker - Stock ticker symbol
 * @returns {Promise<Object>} Aggregated stock data with analyst ratings
 */
export const fetchStockData = async (ticker) => {
  const cleanTicker = ticker.toUpperCase().trim();

  console.log(`%c[API] 📡 Fetching data for ${cleanTicker}...`,
    "color: #2563eb; font-weight: bold;");

  // Check cache first (avoid repeated API calls within 5 minutes)
  const cacheKey = `stock_${cleanTicker}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    try {
      const { data, timestamp } = JSON.parse(cachedData);
      const age = Date.now() - timestamp;
      const fiveMinutes = 5 * 60 * 1000;

      if (age < fiveMinutes) {
        const secondsAgo = Math.floor(age / 1000);
        console.log(`[API] 💾 Using cached data (${secondsAgo}s old) - 0 API calls!`);
        return { ...data, fromCache: true, cacheAge: secondsAgo };
      } else {
        console.log('[API] ⏰ Cache expired, fetching fresh data...');
      }
    } catch (e) {
      console.warn('[API] ⚠️ Invalid cache data, fetching fresh...');
    }
  }

  // Validate API key
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    console.error('[API] ❌ Invalid API key. Please set VITE_FMP_API_KEY in .env file');
    return {
      ...getMockData(cleanTicker),
      isDemo: true,
      error: 'API Key Not Configured'
    };
  }

  try {
    // STEP 1: Validation call - check if symbol exists (1 API call)
    console.log('[API] 🔍 Step 1/2: Validating symbol...');
    const profileData = await safeFetch(`${BASE_URL}/profile?symbol=${cleanTicker}&apikey=${API_KEY}`);

    // If profile doesn't exist or is empty, don't waste 3 more API calls
    if (isError(profileData)) {
      console.warn(`[API] ❌ Symbol ${cleanTicker} not found or invalid - saved 3 API calls!`);
      return {
        ...getMockData(cleanTicker),
        isDemo: true,
        error: `Symbol ${cleanTicker} not found`
      };
    }

    // STEP 2: Fetch remaining data (3 API calls)
    console.log('[API] ✅ Symbol valid, fetching analyst data... (3 more calls)');
    const [
      consensusData,
      targetsData,
      ratingsData
    ] = await Promise.all([
      safeFetch(`${BASE_URL}/grades-consensus?symbol=${cleanTicker}&apikey=${API_KEY}`),
      safeFetch(`${BASE_URL}/price-target-consensus?symbol=${cleanTicker}&apikey=${API_KEY}`),
      safeFetch(`${BASE_URL}/grades?symbol=${cleanTicker}&apikey=${API_KEY}`)
    ]);

    // Check if we got critical data (profile and consensus)
    if (isError(profileData) && isError(consensusData)) {
      console.warn('[API] ⚠️ No valid data received. Using demo mode.');
      return {
        ...getMockData(cleanTicker),
        isDemo: true,
        error: 'API Data Unavailable - Check API Limits'
      };
    }

    // --- PARSE PRICE DATA ---
    // Get initial price from profile endpoint only
    // WebSocket will provide real-time updates immediately after page load
    let currentPrice = 0;
    let priceChange = 0;
    let priceChangePercent = 0;

    if (Array.isArray(profileData) && profileData.length > 0 && profileData[0].price) {
      currentPrice = profileData[0].price;
      priceChange = profileData[0].change || 0;
      priceChangePercent = profileData[0].changePercentage || 0;
      console.log('[API] ✓ Initial price from profile (WebSocket will update in real-time)');
    } else {
      console.warn('[API] ⚠️ No price data in profile, WebSocket will provide price');
    }

    // --- PARSE COMPANY INFO ---
    const profileObj = Array.isArray(profileData) && profileData.length > 0
      ? profileData[0]
      : { companyName: cleanTicker, currency: 'USD' };

    // --- PARSE CONSENSUS DATA ---
    const recentConsensus = Array.isArray(consensusData) && consensusData.length > 0
      ? consensusData[0]
      : {
          strongBuy: 0,
          buy: 0,
          hold: 0,
          sell: 0,
          strongSell: 0
        };

    // Handle both stable API (strongBuy, buy, etc.) and legacy API (analystStrongBuy, etc.) field names
    const breakdown = {
      strongBuy: recentConsensus.strongBuy || recentConsensus.analystStrongBuy || 0,
      buy: recentConsensus.buy || recentConsensus.analystBuy || 0,
      hold: recentConsensus.hold || recentConsensus.analystHold || 0,
      sell: recentConsensus.sell || recentConsensus.analystSell || 0,
      strongSell: recentConsensus.strongSell || recentConsensus.analystStrongSell || 0
    };

    const totalAnalysts = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

    const counts = {
      'Strong Buy': breakdown.strongBuy,
      'Buy': breakdown.buy,
      'Hold': breakdown.hold,
      'Sell': breakdown.sell,
      'Strong Sell': breakdown.strongSell
    };

    const consensusText = calculateConsensus(counts);

    // --- PARSE PRICE TARGETS ---
    const safeTargetsData = Array.isArray(targetsData) ? targetsData : [];
    const chartBasePrice = currentPrice || (safeTargetsData[0]?.targetConsensus || 0);
    const targets = safeTargetsData[0] || {
      targetHigh: chartBasePrice * 1.15,
      targetLow: chartBasePrice * 0.85,
      targetConsensus: chartBasePrice
    };

    // --- PARSE RATINGS HISTORY ---
    const safeRatingsData = Array.isArray(ratingsData) ? ratingsData : [];
    const parsedRatings = safeRatingsData.slice(0, 15).map((r, index) => {
      // Stable API uses: date, gradingCompany, previousGrade, newGrade, action
      // Note: Stable API doesn't include priceTarget in grades endpoint
      const action = r.action || (r.newGrade === r.previousGrade ? 'maintain' : 'update');

      return {
        id: index,
        date: r.date || 'N/A',
        firm: r.gradingCompany || r.company || 'Unknown Firm',
        analyst: 'Analyst', // FMP doesn't provide individual analyst names
        action: action.charAt(0).toUpperCase() + action.slice(1), // Capitalize first letter
        rating: r.newGrade || r.grade || '-',
        target: r.priceTarget || '-' // May not be available in stable grades endpoint
      };
    });

    console.log(`[API] ✅ Successfully loaded data for ${cleanTicker}`);
    console.log(`[API] 📊 Price: $${currentPrice} | Analysts: ${totalAnalysts} | Consensus: ${consensusText}`);
    console.log(`[API] 💰 API Calls Used: 4 (validation + 3 analyst calls)`);

    // Cache analyst coverage status
    const hasCoverage = totalAnalysts > 0;
    analystCoverageCache.set(cleanTicker, hasCoverage);
    saveAnalystCoverageCache();

    if (hasCoverage) {
      console.log(`[API] ✅ ${cleanTicker} has analyst coverage (${totalAnalysts} analysts)`);
    } else {
      console.log(`[API] ⚠️ ${cleanTicker} has NO analyst coverage`);
    }

    const result = {
      isDemo: false,
      symbol: cleanTicker,
      name: profileObj.companyName || cleanTicker,
      exchange: profileObj.exchange || profileObj.exchangeShortName || 'NASDAQ',
      price: currentPrice,
      currency: profileObj.currency || 'USD',
      change: priceChange,
      changePercent: priceChangePercent,
      consensus: consensusText,
      analystsCount: totalAnalysts,
      breakdown,
      targets: {
        high: targets.targetHigh || chartBasePrice * 1.15,
        average: targets.targetConsensus || chartBasePrice,
        low: targets.targetLow || chartBasePrice * 0.85,
        current: chartBasePrice
      },
      ratings: parsedRatings,
      hasAnalystCoverage: hasCoverage
    };

    // Cache the result for 5 minutes
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        data: result,
        timestamp: Date.now()
      }));
      console.log('[API] 💾 Data cached for 5 minutes');
    } catch (e) {
      console.warn('[API] ⚠️ Failed to cache data:', e.message);
    }

    return result;

  } catch (error) {
    console.error('[API] ❌ Error processing data:', error);
    return {
      ...getMockData(cleanTicker),
      isDemo: true,
      error: 'Data Processing Error'
    };
  }
};

/**
 * Validate if API key is properly configured
 * @returns {boolean} True if API key is valid
 */
export const validateApiKey = () => {
  return API_KEY && API_KEY !== 'your_api_key_here' && API_KEY.length > 0;
};

/**
 * Get API usage statistics
 * @returns {Object} API usage stats
 */
export const getAPIUsage = () => {
  const count = apiTracker.getCount();
  const remaining = apiTracker.getRemaining();
  const limit = 250;
  const percentage = Math.round((count / limit) * 100);

  return {
    count,
    remaining,
    limit,
    percentage,
    resetTime: 'Daily (midnight UTC)'
  };
};

/**
 * Reset API call counter (useful for testing)
 */
export const resetAPICounter = () => {
  apiTracker.reset();
  console.log('[API] ✅ API call counter has been reset');
};

/**
 * Log current API usage to console
 */
export const logAPIUsage = () => {
  const stats = getAPIUsage();
  console.log('\n' + '='.repeat(50));
  console.log('📊 API USAGE STATISTICS');
  console.log('='.repeat(50));
  console.log(`📞 Calls made today: ${stats.count}`);
  console.log(`✅ Calls remaining: ${stats.remaining}`);
  console.log(`📈 Usage: ${stats.percentage}% of daily limit`);
  console.log(`🔄 Resets: ${stats.resetTime}`);
  console.log('='.repeat(50) + '\n');
};

/**
 * Determine asset categories based on exchange and symbol patterns
 * @param {Object} result - Search result with symbol, exchange, name, country
 * @returns {Array<string>} Array of category tags
 */
const categorizeAsset = (result) => {
  const categories = [];
  const { symbol, exchange, name, country } = result;

  // Primary exchange-based categorization
  const exchangeCategories = {
    // US Exchanges
    'NYSE': 'NYSE',
    'NASDAQ': 'NASDAQ',
    'AMEX': 'AMEX',

    // International Exchanges
    'ASX': 'ASX',           // Australia
    'LSE': 'LSE',           // London
    'HKEX': 'HKEX',         // Hong Kong
    'TSE': 'TSE',           // Tokyo
    'NSE': 'NSE',           // India (National)
    'BSE': 'BSE',           // India (Bombay)
    'TSX': 'TSX',           // Toronto

    // Special
    'INDEX': 'Index',
    'OTC': 'OTC',
    'CRYPTO': 'Crypto'
  };

  if (exchangeCategories[exchange]) {
    categories.push(exchangeCategories[exchange]);
  }

  // Detect by symbol patterns
  if (symbol.startsWith('^')) categories.push('Index');
  if (symbol.includes('USD') || symbol.includes('BTC') || symbol.includes('ETH')) categories.push('Crypto');
  if (symbol.endsWith('.L')) categories.push('LSE');
  if (symbol.endsWith('.HK')) categories.push('HKEX');
  if (symbol.endsWith('.TO')) categories.push('TSX');
  if (symbol.endsWith('.AX')) categories.push('ASX');
  if (symbol.includes('-')) categories.push('Warrant');

  // Detect ETFs by name (works across all exchanges)
  if (name && (name.includes('ETF') || name.includes('Fund') || name.includes('Trust'))) {
    categories.push('ETF');
  }

  // Detect common instrument types by name
  if (name) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('bond') || nameLower.includes('note')) categories.push('Bond');
    if (nameLower.includes('reit')) categories.push('REIT');
    if (nameLower.includes('index') || nameLower.includes('spdr') || nameLower.includes('ishares')) {
      categories.push('Index Fund');
    }
  }

  // Add country tag for international exchanges
  if (country && country !== 'United States') {
    categories.push(country);
  }

  // If no categories, default to Stock
  if (categories.length === 0) {
    categories.push('Stock');
  }

  return [...new Set(categories)]; // Remove duplicates
};

// Import cached symbol data
let symbolsCache = null;

// Cache for analyst coverage (symbol -> boolean)
let analystCoverageCache = new Map();

// Load prebuilt analyst coverage database (517 stocks: S&P 500 + popular stocks)
const loadAnalystCoverageDatabase = async () => {
  try {
    const response = await fetch('/src/data/analyst-coverage.json');
    const prebuiltCoverage = await response.json();
    Object.entries(prebuiltCoverage).forEach(([symbol, hasCoverage]) => {
      analystCoverageCache.set(symbol, hasCoverage);
    });
    console.log(`[API] 📊 Preloaded ${analystCoverageCache.size} stocks with analyst coverage (S&P 500 + popular)`);

    // Load additional coverage from localStorage (user's browsing history)
    try {
      const saved = localStorage.getItem('analystCoverageCache');
      if (saved) {
        const parsed = JSON.parse(saved);
        let addedCount = 0;
        Object.entries(parsed).forEach(([symbol, hasCoverage]) => {
          if (!analystCoverageCache.has(symbol)) {
            analystCoverageCache.set(symbol, hasCoverage);
            addedCount++;
          }
        });
        if (addedCount > 0) {
          console.log(`[API] 💾 + ${addedCount} more from browsing history (total: ${analystCoverageCache.size})`);
        }
      }
    } catch (e) {
      console.warn('[API] Failed to load localStorage coverage cache:', e);
    }
  } catch (e) {
    console.warn('[API] ⚠️  Analyst coverage database not found, will build dynamically as you browse');
  }
};

// Initialize coverage database
loadAnalystCoverageDatabase();

/**
 * Save analyst coverage cache to localStorage
 */
const saveAnalystCoverageCache = () => {
  try {
    const obj = Object.fromEntries(analystCoverageCache);
    localStorage.setItem('analystCoverageCache', JSON.stringify(obj));
  } catch (e) {
    console.warn('[API] Failed to save analyst coverage cache:', e);
  }
};

/**
 * Check if a stock has analyst coverage
 * @param {string} symbol - Stock symbol
 * @returns {boolean|null} True if covered, false if not, null if unknown
 */
export const hasAnalystCoverage = (symbol) => {
  return analystCoverageCache.get(symbol) ?? null;
};

/**
 * Load symbols cache (lazy loaded)
 * @returns {Promise<Array>} Cached symbols array
 */
const loadSymbolsCache = async () => {
  if (symbolsCache) return symbolsCache;

  try {
    const response = await fetch('/src/data/symbols-cache.json');
    symbolsCache = await response.json();
    console.log(`[API] ✅ Loaded ${symbolsCache.length} symbols from cache`);
    return symbolsCache;
  } catch (error) {
    console.error('[API] ❌ Failed to load symbols cache:', error);
    return [];
  }
};

/**
 * 🚀 INGENIOUS WEBSOCKET + LOCAL HYBRID SEARCH (YOUR IDEA!)
 * Search WebSocket cache first (real-time prices), then merge with local symbols
 * @param {string} query - Search query (partial ticker or company name)
 * @param {number} limit - Max results to return (default: 5)
 * @returns {Promise<Array>} Array of search results with categories (and live prices!)
 */
export const searchTickers = async (query, limit = 5) => {
  if (!query || query.length < 1) return [];

  const queryUpper = query.toUpperCase();
  console.log(`%c[API] 🔍 Hybrid WebSocket + Local search for: "${query}"`,
    "color: #059669; font-weight: bold;");

  // STEP 1: Check WebSocket cache for real-time data (YOUR INGENIOUS IDEA!)
  let wsResults = [];
  try {
    const { wsManager } = await import('./websocketManager.js');
    wsResults = wsManager.searchCache(query, limit);

    if (wsResults.length > 0) {
      console.log(`[API] 💎 Found ${wsResults.length} symbols in WebSocket cache (live prices!)`);
    }
  } catch (error) {
    console.warn('[API] WebSocket cache unavailable:', error);
  }

  // STEP 2: Search local symbol cache
  const symbols = await loadSymbolsCache();
  if (symbols.length === 0) {
    // If no local cache, return WebSocket results only
    return wsResults.map(ws => ({
      symbol: ws.symbol,
      name: ws.symbol,
      exchange: ws.exchange || 'NASDAQ',
      exchangeFullName: ws.exchange || 'NASDAQ',
      currency: 'USD',
      categories: ['Stock'],
      livePrice: ws.price,
      priceAge: ws.age
    }));
  }

  // Search algorithm: prioritize exact matches, then prefix matches, then analyst coverage
  const localResults = symbols
    .filter(s => s.name && s.name !== s.symbol)
    .map(symbol => {
      const symbolMatch = symbol.symbol.toUpperCase();
      const nameMatch = (symbol.name || '').toUpperCase();

      let score = 0;

      // Symbol matching
      if (symbolMatch === queryUpper) {
        score = 10000; // Exact symbol match
      } else if (symbolMatch.startsWith(queryUpper)) {
        score = 5000 - symbolMatch.length; // Prefer shorter symbols
      }
      // Company name matching
      else if (nameMatch.startsWith(queryUpper)) {
        score = 1000;
      } else if (nameMatch.includes(' ' + queryUpper)) {
        score = 500;
      } else if (nameMatch.includes(queryUpper)) {
        score = 100;
      }

      // Boost score if stock has analyst coverage (add 50 points)
      const coverage = analystCoverageCache.get(symbol.symbol);
      if (coverage === true) {
        score += 50;
      }

      return { ...symbol, score, hasAnalystCoverage: coverage };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => {
      // First sort by score
      if (b.score !== a.score) return b.score - a.score;
      // If scores equal, prioritize stocks with known analyst coverage
      if (a.hasAnalystCoverage === true && b.hasAnalystCoverage !== true) return -1;
      if (b.hasAnalystCoverage === true && a.hasAnalystCoverage !== true) return 1;
      return 0;
    })
    .slice(0, limit);

  // STEP 3: Merge WebSocket results with local results
  const merged = new Map();

  // Add WebSocket results first (they have real-time prices!)
  wsResults.forEach(ws => {
    const localMatch = symbols.find(s => s.symbol === ws.symbol);
    merged.set(ws.symbol, {
      symbol: ws.symbol,
      name: localMatch?.name || ws.symbol,
      exchange: ws.exchange || localMatch?.exchange || 'NASDAQ',
      exchangeFullName: localMatch?.exchangeFullName || ws.exchange || 'NASDAQ',
      currency: localMatch?.currency || 'USD',
      categories: categorizeAsset(localMatch || { symbol: ws.symbol }),
      livePrice: ws.price, // 🚀 Real-time price from WebSocket!
      priceAge: ws.age // How old the price is (in seconds)
    });
  });

  // Add local results that aren't in WebSocket cache
  localResults.forEach(local => {
    if (!merged.has(local.symbol)) {
      merged.set(local.symbol, {
        symbol: local.symbol,
        name: local.name,
        exchange: local.exchange,
        exchangeFullName: local.exchangeFullName,
        currency: local.currency,
        categories: categorizeAsset(local),
        hasAnalystCoverage: local.hasAnalystCoverage
      });
    } else {
      // If already in merged (from WebSocket), add analyst coverage info
      const existing = merged.get(local.symbol);
      existing.hasAnalystCoverage = local.hasAnalystCoverage;
    }
  });

  const finalResults = Array.from(merged.values()).slice(0, limit);

  const wsCount = finalResults.filter(r => r.livePrice).length;
  const coverageCount = finalResults.filter(r => r.hasAnalystCoverage === true).length;
  console.log(`[API] ✅ Found ${finalResults.length} results (${wsCount} with live prices, ${coverageCount} with analyst coverage, 0 API calls!)`);

  return finalResults;
};
