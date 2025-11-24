/**
 * Download stock symbols from GitHub (FREE - no API calls!)
 * Source: github.com/rreichel3/US-Stock-Symbols
 * Updated nightly, 7000+ symbols
 */
import fs from 'fs';

const GITHUB_URLS = {
  nyse: 'https://raw.githubusercontent.com/rreichel3/US-Stock-Symbols/main/nyse/nyse_tickers.json',
  nasdaq: 'https://raw.githubusercontent.com/rreichel3/US-Stock-Symbols/main/nasdaq/nasdaq_tickers.json',
  amex: 'https://raw.githubusercontent.com/rreichel3/US-Stock-Symbols/main/amex/amex_tickers.json'
};

async function downloadSymbols() {
  console.log('📡 Downloading stock symbols from GitHub (FREE!)...\n');

  const allSymbols = [];

  for (const [exchange, url] of Object.entries(GITHUB_URLS)) {
    try {
      console.log(`📥 Fetching ${exchange.toUpperCase()} symbols...`);
      const response = await fetch(url);
      const data = await response.json();

      if (Array.isArray(data)) {
        // Data is just an array of ticker strings
        const symbols = data.map(ticker => ({
          symbol: ticker,
          name: ticker, // We'll just use ticker as name for now
          exchange: exchange.toUpperCase(),
          exchangeFullName: getExchangeName(exchange),
          currency: 'USD'
        }));

        allSymbols.push(...symbols);
        console.log(`   ✅ Added ${symbols.length} ${exchange.toUpperCase()} symbols`);
      }
    } catch (error) {
      console.error(`   ❌ Error fetching ${exchange}:`, error.message);
    }
  }

  // Remove duplicates by symbol
  const uniqueSymbols = Array.from(
    new Map(allSymbols.map(s => [s.symbol, s])).values()
  );

  // Save to file
  const outputPath = './src/data/symbols-cache.json';
  fs.writeFileSync(outputPath, JSON.stringify(uniqueSymbols, null, 2));

  console.log(`\n✅ Symbol cache downloaded successfully!`);
  console.log(`📊 Total unique symbols: ${uniqueSymbols.length}`);
  console.log(`📞 API calls used: 0 (GitHub is free!)`);
  console.log(`💾 Saved to: ${outputPath}`);
  console.log(`\n💡 Run this weekly to stay updated (GitHub updates nightly)`);
}

function getExchangeName(exchange) {
  const names = {
    nyse: 'New York Stock Exchange',
    nasdaq: 'NASDAQ Global Select',
    amex: 'NYSE American'
  };
  return names[exchange] || exchange;
}

downloadSymbols();
