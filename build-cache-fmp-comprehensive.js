/**
 * Build comprehensive symbol cache using FMP Search API
 * Uses smart query strategy to discover ALL symbols across ALL exchanges
 *
 * Strategy:
 * 1. Query all single letters (A-Z) - 26 calls
 * 2. Query all numbers (0-9) - 10 calls
 * 3. Query common two-letter combos (AA-ZZ) - 676 calls (optional, thorough)
 * 4. Query exchange-specific prefixes (for international stocks)
 *
 * Total: ~36 calls (basic) or ~712 calls (comprehensive)
 */
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const API_KEY = process.env.VITE_FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/stable';

// Search query sets
const QUERIES = {
  // Phase 1: Single characters (26 letters + 10 numbers = 36 calls)
  basic: [
    ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    ...'0123456789'.split('')
  ],

  // Phase 2: Two-letter combinations (676 calls - most comprehensive)
  twoLetter: (() => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const combos = [];
    for (const first of letters) {
      for (const second of letters) {
        combos.push(first + second);
      }
    }
    return combos;
  })(),

  // Phase 3: Common prefixes for international exchanges
  international: [
    // London Stock Exchange (LSE)
    '.L', 'LON:', 'LSE:',
    // Hong Kong (HKEX)
    '.HK', 'HK:', 'HKEX:',
    // Tokyo (TSE)
    '.T', 'TYO:', 'TSE:',
    // Toronto (TSX)
    '.TO', 'TSX:',
    // India (NSE/BSE)
    '.NS', '.BO', 'NSE:', 'BSE:',
    // Germany (FSE)
    '.F', '.DE', 'FRA:',
    // France (EPA)
    '.PA', 'EPA:',
    // Australia (ASX)
    '.AX', 'ASX:'
  ]
};

async function buildComprehensiveCache(mode = 'basic') {
  console.log('🔨 Building comprehensive symbol cache from FMP API...\n');

  let queryList = [];
  let estimatedCalls = 0;

  // Select query strategy
  switch(mode) {
    case 'basic':
      queryList = QUERIES.basic;
      estimatedCalls = queryList.length;
      console.log('📋 Mode: BASIC (letters + numbers)');
      break;

    case 'comprehensive':
      queryList = [...QUERIES.basic, ...QUERIES.twoLetter];
      estimatedCalls = queryList.length;
      console.log('📋 Mode: COMPREHENSIVE (all two-letter combos)');
      break;

    case 'international':
      queryList = [...QUERIES.basic, ...QUERIES.international];
      estimatedCalls = queryList.length;
      console.log('📋 Mode: INTERNATIONAL (basic + exchange prefixes)');
      break;

    case 'full':
      queryList = [...QUERIES.basic, ...QUERIES.twoLetter, ...QUERIES.international];
      estimatedCalls = queryList.length;
      console.log('📋 Mode: FULL (everything!)');
      break;
  }

  console.log(`⚠️  This will make approximately ${estimatedCalls} API calls`);
  console.log(`⏱️  Estimated time: ${Math.ceil(estimatedCalls * 0.15)} seconds (with 150ms delay)\n`);
  console.log('Press Ctrl+C within 5 seconds to cancel...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  const allSymbols = new Map(); // Deduplicate by symbol
  let apiCalls = 0;
  let errors = 0;

  console.log('📡 Starting symbol discovery...\n');

  for (let i = 0; i < queryList.length; i++) {
    const query = queryList[i];

    try {
      const response = await fetch(
        `${BASE_URL}/search-symbol?query=${encodeURIComponent(query)}&apikey=${API_KEY}`
      );

      apiCalls++;

      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.includes('Restricted Endpoint')) {
          console.error('❌ This endpoint requires a premium subscription');
          console.log('💡 Consider using the GitHub-based download instead: npm run update-symbols-global');
          process.exit(1);
        }
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        data.forEach(item => {
          // Create unique key
          const key = `${item.symbol}-${item.exchange || 'UNKNOWN'}`;

          if (!allSymbols.has(key)) {
            allSymbols.set(key, {
              symbol: item.symbol,
              name: item.name || item.symbol,
              exchange: item.exchange || 'UNKNOWN',
              exchangeFullName: item.exchangeFullName || item.exchange || 'Unknown',
              currency: item.currency || 'USD',
              // Additional FMP fields if available
              type: item.type || 'stock',
              stockExchange: item.stockExchange,
              exchangeShortName: item.exchangeShortName
            });
          }
        });
      }

      // Progress update every 10 queries or at the end
      if ((i + 1) % 10 === 0 || i === queryList.length - 1) {
        const progress = ((i + 1) / queryList.length * 100).toFixed(1);
        console.log(`   [${progress}%] Query "${query}": ${data.length} results | Total unique: ${allSymbols.size}`);
      }

      // Rate limiting: 150ms delay between requests (6-7 requests/sec)
      await new Promise(resolve => setTimeout(resolve, 150));

    } catch (error) {
      errors++;
      if (errors <= 5) {
        console.error(`   ❌ Error querying "${query}":`, error.message);
      }
    }
  }

  // Convert Map to Array
  const symbolArray = Array.from(allSymbols.values());

  // Group by exchange for statistics
  const byExchange = {};
  symbolArray.forEach(s => {
    byExchange[s.exchange] = (byExchange[s.exchange] || 0) + 1;
  });

  // Sort exchanges by count
  const sortedExchanges = Object.entries(byExchange)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20); // Top 20 exchanges

  // Save to file
  const outputPath = './src/data/symbols-cache.json';
  fs.writeFileSync(outputPath, JSON.stringify(symbolArray, null, 2));

  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ Symbol cache built successfully!');
  console.log(`${'='.repeat(60)}`);
  console.log(`\n📊 Top 20 Exchanges by Symbol Count:`);
  sortedExchanges.forEach(([exchange, count], index) => {
    console.log(`   ${(index + 1).toString().padStart(2)}. ${exchange.padEnd(25)} ${count.toLocaleString()} symbols`);
  });
  console.log(`\n📈 Total Unique Symbols: ${symbolArray.length.toLocaleString()}`);
  console.log(`📞 API Calls Used: ${apiCalls} (${errors} errors)`);
  console.log(`💾 File Size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`💾 Saved to: ${outputPath}`);
  console.log(`\n💡 Recommended: Run this ${mode === 'basic' ? 'daily' : 'weekly'} to stay updated`);
  console.log(`💡 To update: npm run build-cache-fmp${mode !== 'basic' ? ':' + mode : ''}\n`);
}

// Parse command line arguments
const mode = process.argv[2] || 'basic';
const validModes = ['basic', 'comprehensive', 'international', 'full'];

if (!validModes.includes(mode)) {
  console.error(`❌ Invalid mode: "${mode}"`);
  console.log(`\n📚 Usage:`);
  console.log(`   node build-cache-fmp-comprehensive.js [mode]\n`);
  console.log(`🎯 Available modes:`);
  console.log(`   basic           36 API calls   - Letters + numbers (recommended for daily updates)`);
  console.log(`   international   46 API calls   - Basic + exchange prefixes`);
  console.log(`   comprehensive   712 API calls  - All two-letter combinations`);
  console.log(`   full            758 API calls  - Everything (most complete)\n`);
  process.exit(1);
}

buildComprehensiveCache(mode);
