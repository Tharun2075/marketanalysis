/**
 * Mock Data Service
 * Provides fallback data when API is unavailable
 */

export const MOCK_DB = {
  'AAPL': {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 189.45,
    currency: 'USD',
    change: 1.25,
    changePercent: 0.66,
    consensus: 'Buy',
    analystsCount: 42,
    breakdown: {
      strongBuy: 18,
      buy: 15,
      hold: 8,
      sell: 1,
      strongSell: 0
    },
    targets: {
      high: 250.00,
      average: 205.50,
      low: 160.00,
      current: 189.45
    },
    ratings: [
      {
        id: 1,
        date: '2023-10-25',
        firm: 'Morgan Stanley',
        analyst: 'Erik Woodring',
        action: 'Maintains',
        rating: 'Overweight',
        target: 210
      },
      {
        id: 2,
        date: '2023-10-24',
        firm: 'Wedbush',
        analyst: 'Daniel Ives',
        action: 'Reiterates',
        rating: 'Outperform',
        target: 240
      }
    ]
  },
  'TSLA': {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 215.99,
    currency: 'USD',
    change: -5.30,
    changePercent: -2.4,
    consensus: 'Hold',
    analystsCount: 38,
    breakdown: {
      strongBuy: 8,
      buy: 10,
      hold: 14,
      sell: 4,
      strongSell: 2
    },
    targets: {
      high: 310.00,
      average: 240.00,
      low: 120.00,
      current: 215.99
    },
    ratings: [
      {
        id: 1,
        date: '2023-10-22',
        firm: 'Goldman Sachs',
        analyst: 'Mark Delaney',
        action: 'Maintains',
        rating: 'Neutral',
        target: 235
      }
    ]
  },
  'GOOGL': {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 138.21,
    currency: 'USD',
    change: 2.15,
    changePercent: 1.58,
    consensus: 'Buy',
    analystsCount: 45,
    breakdown: {
      strongBuy: 20,
      buy: 18,
      hold: 6,
      sell: 1,
      strongSell: 0
    },
    targets: {
      high: 180.00,
      average: 155.00,
      low: 120.00,
      current: 138.21
    },
    ratings: [
      {
        id: 1,
        date: '2023-10-20',
        firm: 'JP Morgan',
        analyst: 'Doug Anmuth',
        action: 'Reiterates',
        rating: 'Overweight',
        target: 160
      }
    ]
  },
  'MSFT': {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.91,
    currency: 'USD',
    change: 4.23,
    changePercent: 1.13,
    consensus: 'Strong Buy',
    analystsCount: 48,
    breakdown: {
      strongBuy: 28,
      buy: 16,
      hold: 4,
      sell: 0,
      strongSell: 0
    },
    targets: {
      high: 450.00,
      average: 410.00,
      low: 350.00,
      current: 378.91
    },
    ratings: [
      {
        id: 1,
        date: '2023-10-23',
        firm: 'UBS',
        analyst: 'Karl Keirstead',
        action: 'Maintains',
        rating: 'Buy',
        target: 425
      }
    ]
  }
};

/**
 * Get mock data for a given ticker
 * @param {string} ticker - Stock ticker symbol
 * @returns {Object} Mock stock data
 */
export const getMockData = (ticker) => {
  const t = ticker.toUpperCase();

  if (MOCK_DB[t]) {
    return MOCK_DB[t];
  }

  // Generate generic mock data for unknown tickers
  return {
    symbol: t,
    name: `${t} Corp (Demo)`,
    price: 150.00,
    currency: 'USD',
    change: 2.50,
    changePercent: 1.67,
    consensus: 'Hold',
    analystsCount: 20,
    breakdown: {
      strongBuy: 5,
      buy: 5,
      hold: 7,
      sell: 2,
      strongSell: 1
    },
    targets: {
      high: 200.00,
      average: 160.00,
      low: 100.00,
      current: 150.00
    },
    ratings: [
      {
        id: 1,
        date: new Date().toISOString().split('T')[0],
        firm: 'Demo Capital',
        analyst: 'Sample Analyst',
        action: 'Initiated',
        rating: 'Hold',
        target: 160
      }
    ]
  };
};
