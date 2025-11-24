/**
 * Extended script to build a comprehensive symbol cache
 * Uses two-letter combinations to get more symbols (AA, AB, AC, etc.)
 */
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const API_KEY = process.env.VITE_FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/stable';

async function buildExtendedSymbolCache() {
  console.log('🔨 Building EXTENDED symbol cache from FMP API...\n');
  console.log('⚠️  This will make ~700 API calls (26 letters + 26×26 two-letter combos)\n');
  console.log('Press Ctrl+C within 5 seconds to cancel...\n');

  // Wait 5 seconds
  await new Promise(resolve => setTimeout(resolve, 5000));

  const allSymbols = new Map();
  let apiCalls = 0;

  // Single letters (A-Z)
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  console.log('📡 Phase 1: Single letters (A-Z)...');
  for (const letter of letters) {
    try {
      const response = await fetch(`${BASE_URL}/search-symbol?query=${letter}&apikey=${API_KEY}`);
      const data = await response.json();
      apiCalls++;

      if (Array.isArray(data)) {
        data.forEach(item => {
          allSymbols.set(item.symbol, {
            symbol: item.symbol,
            name: item.name,
            exchange: item.exchange,
            exchangeFullName: item.exchangeFullName,
            currency: item.currency
          });
        });
      }
      console.log(`   ${letter}: ${data.length} symbols (Total: ${allSymbols.size})`);
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`   ❌ Error fetching "${letter}":`, error.message);
    }
  }

  console.log('\n📡 Phase 2: Two-letter combinations (AA-ZZ)...');
  let count = 0;
  for (const first of letters) {
    for (const second of letters) {
      const combo = first + second;
      count++;

      try {
        const response = await fetch(`${BASE_URL}/search-symbol?query=${combo}&apikey=${API_KEY}`);
        const data = await response.json();
        apiCalls++;

        if (Array.isArray(data)) {
          data.forEach(item => {
            allSymbols.set(item.symbol, {
              symbol: item.symbol,
              name: item.name,
              exchange: item.exchange,
              exchangeFullName: item.exchangeFullName,
              currency: item.currency
            });
          });
        }

        if (count % 26 === 0) {
          console.log(`   Progress: ${count}/676 (${Math.round(count/676*100)}%) - Total symbols: ${allSymbols.size}`);
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`   ❌ Error fetching "${combo}":`, error.message);
      }
    }
  }

  // Convert Map to Array
  const symbolArray = Array.from(allSymbols.values());

  // Save to file
  const outputPath = './src/data/symbols-cache.json';
  fs.writeFileSync(outputPath, JSON.stringify(symbolArray, null, 2));

  console.log(`\n✅ Extended symbol cache built successfully!`);
  console.log(`📊 Total unique symbols: ${symbolArray.length}`);
  console.log(`📞 API calls used: ${apiCalls}`);
  console.log(`💾 Saved to: ${outputPath}`);
  console.log(`\n💡 Run this once a week to keep cache updated`);
}

buildExtendedSymbolCache();
