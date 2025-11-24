/**
 * Download GLOBAL stock symbols from GitHub (FREE - no API calls!)
 * Covers: NYSE, NASDAQ, AMEX, LSE, TSE, ASX, HKEX
 * Sources:
 *   - US: github.com/rreichel3/US-Stock-Symbols
 *   - Global: github.com/LondonMarket/Global-Stock-Symbols
 */
import fs from 'fs';

// CSV parsing helper
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');

  // Parse header row
  const headerValues = [];
  let current = '';
  let inQuotes = false;

  for (let char of lines[0]) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      headerValues.push(current.trim().replace(/^"/, '').replace(/"$/, ''));
      current = '';
    } else {
      current += char;
    }
  }
  headerValues.push(current.trim().replace(/^"/, '').replace(/"$/, ''));
  const headers = headerValues;

  return lines.slice(1).map(line => {
    // Handle quoted fields with commas
    const values = [];
    current = '';
    inQuotes = false;

    for (let char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"/, '').replace(/"$/, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"/, '').replace(/"$/, ''));

    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i] || '';
    });
    return obj;
  });
}

const DATA_SOURCES = {
  // US Exchanges (JSON format - simple ticker arrays)
  us: {
    nyse: 'https://raw.githubusercontent.com/rreichel3/US-Stock-Symbols/main/nyse/nyse_tickers.json',
    nasdaq: 'https://raw.githubusercontent.com/rreichel3/US-Stock-Symbols/main/nasdaq/nasdaq_tickers.json',
    amex: 'https://raw.githubusercontent.com/rreichel3/US-Stock-Symbols/main/amex/amex_tickers.json'
  },

  // Global Exchanges (CSV format - detailed data)
  global: {
    nyse_global: 'https://raw.githubusercontent.com/LondonMarket/Global-Stock-Symbols/main/nyse_1668526574444.csv',
    nasdaq_global: 'https://raw.githubusercontent.com/LondonMarket/Global-Stock-Symbols/main/nasdaq_1668526380140.csv',
    asx: 'https://raw.githubusercontent.com/LondonMarket/Global-Stock-Symbols/main/ASX_Listed_Companies_07-06-2025_01-26-38_AEST.csv'
  }
};

async function downloadGlobalSymbols() {
  console.log('🌍 Downloading GLOBAL stock symbols from GitHub (FREE!)...\n');
  console.log('📋 Exchanges: NYSE, NASDAQ, AMEX, ASX (Australia)');
  console.log('   More exchanges coming soon: LSE, TSE, HKEX, BSE, NSE\n');

  const allSymbols = new Map(); // Use Map to deduplicate by symbol

  // Phase 1: US Stock Symbols (JSON format - fast)
  console.log('📡 Phase 1: US Exchanges (JSON)...');
  for (const [exchange, url] of Object.entries(DATA_SOURCES.us)) {
    try {
      console.log(`📥 Fetching ${exchange.toUpperCase()}...`);
      const response = await fetch(url);
      const data = await response.json();

      if (Array.isArray(data)) {
        data.forEach(ticker => {
          const key = `${ticker}-${exchange.toUpperCase()}`;
          allSymbols.set(key, {
            symbol: ticker,
            name: ticker,
            exchange: exchange.toUpperCase(),
            exchangeFullName: getExchangeName(exchange),
            currency: getCurrency(exchange),
            country: getCountry(exchange)
          });
        });
        console.log(`   ✅ Added ${data.length} symbols`);
      }
    } catch (error) {
      console.error(`   ❌ Error fetching ${exchange}:`, error.message);
    }
  }

  // Phase 2: Global Stock Symbols (CSV format - detailed)
  console.log('\n📡 Phase 2: Global Exchanges (CSV with company names)...');
  for (const [exchange, url] of Object.entries(DATA_SOURCES.global)) {
    try {
      console.log(`📥 Fetching ${exchange.toUpperCase()}...`);
      const response = await fetch(url);
      const csvText = await response.text();

      const data = parseCSV(csvText);
      let addedCount = 0;

      data.forEach(row => {
        let symbol, name, exchangeCode;

        // Handle different CSV formats
        if (exchange === 'asx') {
          // ASX format: "ASX code", "Company name"
          symbol = row['ASX code'] || row['Code'] || row['ASX code'] || '';
          name = row['Company name'] || row['Company'] || row['Company name'] || symbol;
          exchangeCode = 'ASX';
        } else {
          // NYSE/NASDAQ format: Symbol, Name
          symbol = row['Symbol'] || '';
          name = row['Name'] || symbol;
          exchangeCode = exchange === 'nyse_global' ? 'NYSE' : 'NASDAQ';
        }

        if (symbol && symbol !== '' && symbol !== '--') {
          const key = `${symbol}-${exchangeCode}`;

          // Only add if we don't already have it from US source
          if (!allSymbols.has(key)) {
            allSymbols.set(key, {
              symbol: symbol,
              name: name || symbol,
              exchange: exchangeCode,
              exchangeFullName: getExchangeName(exchangeCode.toLowerCase()),
              currency: getCurrency(exchangeCode.toLowerCase()),
              country: getCountry(exchangeCode.toLowerCase())
            });
            addedCount++;
          }
        }
      });

      console.log(`   ✅ Added ${addedCount} new symbols (${data.length} total in file)`);
    } catch (error) {
      console.error(`   ❌ Error fetching ${exchange}:`, error.message);
    }
  }

  // Convert Map to Array and remove duplicate keys
  const symbolArray = Array.from(allSymbols.values());

  // Group by exchange for stats
  const byExchange = {};
  symbolArray.forEach(s => {
    byExchange[s.exchange] = (byExchange[s.exchange] || 0) + 1;
  });

  // Save to file
  const outputPath = './src/data/symbols-cache.json';
  fs.writeFileSync(outputPath, JSON.stringify(symbolArray, null, 2));

  console.log(`\n✅ GLOBAL symbol cache downloaded successfully!`);
  console.log(`\n📊 Breakdown by Exchange:`);
  Object.entries(byExchange).forEach(([exchange, count]) => {
    console.log(`   ${exchange}: ${count.toLocaleString()} symbols`);
  });
  console.log(`\n📈 Total unique symbols: ${symbolArray.length.toLocaleString()}`);
  console.log(`📞 API calls used: 0 (GitHub is free!)`);
  console.log(`💾 Saved to: ${outputPath}`);
  console.log(`\n💡 Run this weekly to stay updated`);
}

function getExchangeName(exchange) {
  const names = {
    nyse: 'New York Stock Exchange',
    nasdaq: 'NASDAQ Global Select',
    amex: 'NYSE American',
    asx: 'Australian Securities Exchange',
    lse: 'London Stock Exchange',
    tse: 'Tokyo Stock Exchange',
    hkex: 'Hong Kong Stock Exchange',
    nse: 'National Stock Exchange of India',
    bse: 'Bombay Stock Exchange'
  };
  return names[exchange.toLowerCase()] || exchange.toUpperCase();
}

function getCurrency(exchange) {
  const currencies = {
    nyse: 'USD',
    nasdaq: 'USD',
    amex: 'USD',
    asx: 'AUD',
    lse: 'GBP',
    tse: 'JPY',
    hkex: 'HKD',
    nse: 'INR',
    bse: 'INR'
  };
  return currencies[exchange.toLowerCase()] || 'USD';
}

function getCountry(exchange) {
  const countries = {
    nyse: 'United States',
    nasdaq: 'United States',
    amex: 'United States',
    asx: 'Australia',
    lse: 'United Kingdom',
    tse: 'Japan',
    hkex: 'Hong Kong',
    nse: 'India',
    bse: 'India'
  };
  return countries[exchange.toLowerCase()] || 'Unknown';
}

downloadGlobalSymbols();
