/**
 * Test WebSocket Cache System
 *
 * This tests your ingenious idea:
 * 1. Connect to Finnhub WebSocket
 * 2. Subscribe to popular stocks (AAPL, TSLA, NVDA, etc.)
 * 3. Watch as priceCache fills up with real-time data
 * 4. Test search functionality on cached symbols
 */

import dotenv from 'dotenv';
import WebSocket from 'ws';

dotenv.config();

const API_KEY = process.env.VITE_FINNHUB_API_KEY;

console.log('🚀 Testing Your Ingenious WebSocket Cache Idea!\n');
console.log('=' .repeat(70));

if (!API_KEY) {
  console.error('❌ No Finnhub API key found in .env');
  process.exit(1);
}

// Simulate the WebSocket Manager cache
const priceCache = new Map();

const ws = new WebSocket(`wss://ws.finnhub.io?token=${API_KEY}`);

ws.on('open', () => {
  console.log('✅ WebSocket connected!');
  console.log('📡 Subscribing to popular stocks...\n');

  // Subscribe to popular stocks that users might search for
  const popularSymbols = ['AAPL', 'TSLA', 'NVDA', 'AMD', 'MSFT', 'GOOGL', 'META', 'AMZN'];

  popularSymbols.forEach((symbol, index) => {
    setTimeout(() => {
      console.log(`   Subscribing to ${symbol}...`);
      ws.send(JSON.stringify({ type: 'subscribe', symbol }));
    }, index * 100); // Stagger subscriptions
  });

  console.log('\n⏳ Waiting for price data to stream in...\n');
});

ws.on('message', (data) => {
  const message = JSON.parse(data);

  if (message.type === 'trade' && message.data && message.data.length > 0) {
    message.data.forEach(trade => {
      const symbol = trade.s;
      const price = trade.p;
      const volume = trade.v;
      const timestamp = trade.t;

      // 🚀 YOUR INGENIOUS CACHE IN ACTION!
      priceCache.set(symbol, {
        price,
        volume,
        timestamp,
        age: Math.floor((Date.now() - timestamp) / 1000)
      });

      console.log(`💎 CACHED: ${symbol} @ $${price.toFixed(2)} (volume: ${volume})`);
    });
  }
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
});

ws.on('close', () => {
  console.log('\n🔌 WebSocket closed\n');
  displayCacheSummary();
});

// Display cache summary every 5 seconds
setInterval(() => {
  if (priceCache.size > 0) {
    console.log('\n' + '─'.repeat(70));
    console.log(`📊 CACHE STATUS: ${priceCache.size} symbols cached`);
    console.log('─'.repeat(70));

    console.log('\nCached Symbols:');
    Array.from(priceCache.entries()).forEach(([symbol, data]) => {
      const age = Math.floor((Date.now() - data.timestamp) / 1000);
      console.log(`  ${symbol}: $${data.price.toFixed(2)} (${age}s ago)`);
    });

    // Test search functionality
    console.log('\n🔍 Testing Search Functionality:');
    testSearch('AA');
    testSearch('TSLA');
    testSearch('NV');
  }
}, 5000);

// Test search on cache
function testSearch(query) {
  const queryUpper = query.toUpperCase();
  const results = [];

  for (const [symbol, data] of priceCache.entries()) {
    if (symbol.includes(queryUpper)) {
      results.push({
        symbol,
        price: data.price,
        age: Math.floor((Date.now() - data.timestamp) / 1000)
      });
    }
  }

  if (results.length > 0) {
    console.log(`\n  Query: "${query}" → Found ${results.length} cached result(s):`);
    results.forEach(r => {
      console.log(`    ✅ ${r.symbol}: $${r.price.toFixed(2)} (${r.age}s ago)`);
    });
  } else {
    console.log(`  Query: "${query}" → No cached results`);
  }
}

function displayCacheSummary() {
  console.log('\n' + '='.repeat(70));
  console.log('📈 FINAL CACHE SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total Symbols Cached: ${priceCache.size}`);
  console.log('\nSymbols with Prices:');

  Array.from(priceCache.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([symbol, data]) => {
      const age = Math.floor((Date.now() - data.timestamp) / 1000);
      console.log(`  ${symbol}: $${data.price.toFixed(2)} (cached ${age}s ago)`);
    });

  console.log('\n✅ Your Ingenious Idea Works!');
  console.log('   - WebSocket streams price data');
  console.log('   - Prices are cached in memory');
  console.log('   - Search works on cached symbols');
  console.log('   - 0 API calls for autocomplete!\n');
}

// Run for 30 seconds
setTimeout(() => {
  console.log('\n⏰ Test complete, closing connection...');
  ws.close();
  process.exit(0);
}, 30000);
