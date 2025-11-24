/**
 * Financial Data API Service
 * Handles all API calls to Financial Modeling Prep
 */

import { getMockData } from './mockData';

// Get API key from environment variable (IMPORTANT: Never hardcode API keys!)
const API_KEY = import.meta.env.VITE_FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/api';

/**
 * Safe fetch wrapper that handles errors gracefully
 * @param {string} url - API endpoint URL
 * @returns {Promise<Object|null>} JSON response or null on error
 */
const safeFetch = async (url) => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[API] ⚠️ Request failed: ${url} (${res.status})`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.warn(`[API] ⚠️ Network error for ${url}:`, error.message);
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
      searchData,
      consensusData,
      targetsData,
      ratingsData
    ] = await Promise.all([
      safeFetch(`${BASE_URL}/v3/quote-short/${cleanTicker}?apikey=${API_KEY}`),
      safeFetch(`${BASE_URL}/v3/historical-price-full/${cleanTicker}?serietype=line&timeseries=1&apikey=${API_KEY}`),
      safeFetch(`${BASE_URL}/v3/search?query=${cleanTicker}&limit=1&apikey=${API_KEY}`),
      safeFetch(`${BASE_URL}/v3/analyst-stock-recommendations/${cleanTicker}?apikey=${API_KEY}`),
      safeFetch(`${BASE_URL}/v4/price-target-consensus?symbol=${cleanTicker}&apikey=${API_KEY}`),
      safeFetch(`${BASE_URL}/v4/upgrades-downgrades?symbol=${cleanTicker}&apikey=${API_KEY}`)
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
    if (Array.isArray(priceShort) && priceShort.length > 0) {
      currentPrice = priceShort[0].price;
      console.log('[API] ✓ Price from quote-short');
    } else if (priceHist?.historical?.length > 0) {
      currentPrice = priceHist.historical[0].close;
      console.log('[API] ✓ Price from historical');
    }

    // --- PARSE COMPANY INFO ---
    const searchObj = Array.isArray(searchData) && searchData.length > 0
      ? searchData[0]
      : { name: cleanTicker, currency: 'USD' };

    // --- PARSE CONSENSUS DATA ---
    const recentConsensus = Array.isArray(consensusData) && consensusData.length > 0
      ? consensusData[0]
      : {
          analystStrongBuy: 0,
          analystBuy: 0,
          analystHold: 0,
          analystSell: 0,
          analystStrongSell: 0
        };

    const breakdown = {
      strongBuy: recentConsensus.analystStrongBuy || 0,
      buy: recentConsensus.analystBuy || 0,
      hold: recentConsensus.analystHold || 0,
      sell: recentConsensus.analystSell || 0,
      strongSell: recentConsensus.analystStrongSell || 0
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
    const parsedRatings = safeRatingsData.slice(0, 15).map((r, index) => ({
      id: index,
      date: r.publishedDate ? r.publishedDate.split('T')[0] : 'N/A',
      firm: r.gradingCompany || 'Unknown Firm',
      analyst: 'Analyst', // FMP doesn't provide individual analyst names in this endpoint
      action: r.action || (r.newGrade === r.previousGrade ? 'Reiterates' : 'Update'),
      rating: r.newGrade || '-',
      target: r.priceTarget || '-'
    }));

    console.log(`[API] ✅ Successfully loaded data for ${cleanTicker}`);
    console.log(`[API] 📊 Price: $${currentPrice} | Analysts: ${totalAnalysts} | Consensus: ${consensusText}`);

    return {
      isDemo: false,
      symbol: cleanTicker,
      name: searchObj.name || cleanTicker,
      price: currentPrice,
      currency: searchObj.currency || 'USD',
      change: 0, // Note: Change requires intraday data (premium API)
      changePercent: 0,
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
