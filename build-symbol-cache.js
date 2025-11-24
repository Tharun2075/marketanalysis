/**
 * One-time script to build a symbol cache from FMP search API
 * Run this manually when you want to update the symbol list
 */
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const API_KEY = process.env.VITE_FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/stable';

async function buildSymbolCache() {
  console.log('🔨 Building symbol cache from FMP API...\n');

  const allSymbols = new Map(); // Use Map to avoid duplicates
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  let apiCalls = 0;

  for (const letter of letters) {
    console.log(`📡 Fetching symbols starting with "${letter}"...`);

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
        console.log(`   ✅ Added ${data.length} symbols (Total: ${allSymbols.size})`);
      }

      // Rate limit: wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`   ❌ Error fetching "${letter}":`, error.message);
    }
  }

  // Convert Map to Array
  const symbolArray = Array.from(allSymbols.values());

  // Save to file
  const outputPath = './src/data/symbols-cache.json';
  fs.writeFileSync(outputPath, JSON.stringify(symbolArray, null, 2));

  console.log(`\n✅ Symbol cache built successfully!`);
  console.log(`📊 Total symbols: ${symbolArray.length}`);
  console.log(`📞 API calls used: ${apiCalls}`);
  console.log(`💾 Saved to: ${outputPath}`);
  console.log(`\n💡 This cache will be used for local search (zero API calls!)`);
}

buildSymbolCache();
