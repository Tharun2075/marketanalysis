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
  return !data ||
         data["Error Message"] ||
         (Array.isArray(data) && data.length === 0);
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
    // Parallel API calls for optimal performance
    const [
      priceShort,
      priceHist,
      profileData,
      consensusData,
      targetsData,
      ratingsData
    ] = await Promise.all([
      safeFetch(`${BASE_URL}/quote-short?symbol=${cleanTicker}&apikey=${API_KEY}`),
      safeFetch(`${BASE_URL}/historical-price-eod/full?symbol=${cleanTicker}&from=&to=&apikey=${API_KEY}`),
      safeFetch(`${BASE_URL}/profile?symbol=${cleanTicker}&apikey=${API_KEY}`),
      safeFetch(`${BASE_URL}/grades-consensus?symbol=${cleanTicker}&apikey=${API_KEY}`),
      safeFetch(`${BASE_URL}/price-target-consensus?symbol=${cleanTicker}&apikey=${API_KEY}`),
      safeFetch(`${BASE_URL}/grades?symbol=${cleanTicker}&apikey=${API_KEY}`)
    ]);

    // Check if we got critical data (price and consensus)
    if (isError(priceShort) && isError(priceHist) && isError(consensusData)) {
      console.warn('[API] ⚠️ No valid data received. Using demo mode.');
      return {
        ...getMockData(cleanTicker),
        isDemo: true,
        error: 'API Data Unavailable - Check API Limits'
      };
    }

    // --- PARSE PRICE DATA ---
    let currentPrice = 0;
    let priceChange = 0;
    let priceChangePercent = 0;

    // Try profile first (has price + change data)
    if (Array.isArray(profileData) && profileData.length > 0 && profileData[0].price) {
      currentPrice = profileData[0].price;
      priceChange = profileData[0].change || 0;
      priceChangePercent = profileData[0].changePercentage || 0;
      console.log('[API] ✓ Price from profile');
    } else if (Array.isArray(priceShort) && priceShort.length > 0) {
      currentPrice = priceShort[0].price;
      priceChange = priceShort[0].change || 0;
      console.log('[API] ✓ Price from quote-short');
    } else if (Array.isArray(priceHist) && priceHist.length > 0) {
      // Note: Stable API returns array directly, not nested in historical
      currentPrice = priceHist[0].close;
      priceChange = priceHist[0].change || 0;
      priceChangePercent = priceHist[0].changePercent || 0;
      console.log('[API] ✓ Price from historical');
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

    return {
      isDemo: false,
      symbol: cleanTicker,
      name: profileObj.companyName || cleanTicker,
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
      ratings: parsedRatings
    };

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
 * Search for ticker symbols with autocomplete (LOCAL SEARCH - NO API CALLS!)
 * @param {string} query - Search query (partial ticker or company name)
 * @param {number} limit - Max results to return (default: 5)
 * @returns {Promise<Array>} Array of search results with categories
 */
export const searchTickers = async (query, limit = 5) => {
  if (!query || query.length < 1) return [];

  const symbols = await loadSymbolsCache();
  if (symbols.length === 0) return [];

  const queryUpper = query.toUpperCase();
  console.log(`[API] 🔍 Local search for: "${query}" (${symbols.length} symbols)`);

  // Search algorithm:
  // 1. Exact symbol matches first
  // 2. Symbol starts with query
  // 3. Company name contains query
  const results = symbols
    .map(symbol => {
      const symbolMatch = symbol.symbol.toUpperCase();
      const nameMatch = (symbol.name || '').toUpperCase();

      let score = 0;
      if (symbolMatch === queryUpper) score = 1000; // Exact match
      else if (symbolMatch.startsWith(queryUpper)) score = 500; // Starts with
      else if (nameMatch.includes(queryUpper)) score = 100; // Name contains

      return { ...symbol, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(result => ({
      symbol: result.symbol,
      name: result.name,
      exchange: result.exchange,
      exchangeFullName: result.exchangeFullName,
      currency: result.currency,
      categories: categorizeAsset(result)
    }));

  console.log(`[API] ✅ Found ${results.length} local results (0 API calls used!)`);
  return results;
};
