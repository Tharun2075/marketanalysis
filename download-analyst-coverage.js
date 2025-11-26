/**
 * Download Analyst Coverage Data from Public Sources
 *
 * This script builds a comprehensive list of stocks with analyst coverage
 * using publicly available data sources (no API calls needed!)
 */

import fs from 'fs';
import https from 'https';

console.log('🔍 Building Analyst Coverage Database...\n');

/**
 * Method 1: Use S&P 500, NASDAQ-100, and other major indices
 * These stocks almost always have analyst coverage
 */
const knownCoveredIndices = {
  // S&P 500 - Top 500 US companies (guaranteed analyst coverage)
  'sp500': 'https://raw.githubusercontent.com/datasets/s-and-p-500-companies/master/data/constituents.csv',

  // NASDAQ-100 - Top 100 NASDAQ stocks
  'nasdaq100': 'https://raw.githubusercontent.com/datasets/nasdaq-listings/master/data/nasdaq-listed.csv',

  // Dow Jones Industrial Average - 30 major companies
  // (Manually add since it's small)
  'dow30': ['AAPL', 'MSFT', 'JPM', 'JNJ', 'V', 'PG', 'UNH', 'HD', 'MA', 'DIS',
            'BAC', 'CSCO', 'VZ', 'ADBE', 'CRM', 'NFLX', 'PFE', 'KO', 'INTC', 'CMCSA',
            'WMT', 'ABT', 'PEP', 'TMO', 'COST', 'NKE', 'CVX', 'MCD', 'ACN', 'DHR']
};

/**
 * Fetch data from URL
 */
function fetchURL(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * Parse CSV and extract symbols
 */
function parseCSV(csv) {
  const lines = csv.split('\n').filter(l => l.trim());
  const headers = lines[0].toLowerCase().split(',');

  // Find symbol column
  const symbolCol = headers.findIndex(h =>
    h.includes('symbol') || h.includes('ticker') || h === 'stock'
  );

  if (symbolCol === -1) {
    console.warn('⚠️  Could not find symbol column in CSV');
    return [];
  }

  // Extract symbols (skip header)
  return lines.slice(1).map(line => {
    const cols = line.split(',');
    return cols[symbolCol]?.trim().replace(/"/g, '');
  }).filter(s => s && s.length > 0);
}

/**
 * Main function
 */
async function buildCoverageDatabase() {
  const coveredStocks = new Set();

  // Add Dow 30 (manual list - all have heavy analyst coverage)
  console.log('📊 Adding Dow Jones 30...');
  knownCoveredIndices.dow30.forEach(symbol => coveredStocks.add(symbol));
  console.log(`   ✅ Added ${knownCoveredIndices.dow30.length} Dow 30 stocks\n`);

  // Try to fetch S&P 500
  try {
    console.log('📊 Fetching S&P 500 constituents...');
    const sp500Data = await fetchURL(knownCoveredIndices.sp500);
    const sp500Symbols = parseCSV(sp500Data);
    sp500Symbols.forEach(symbol => coveredStocks.add(symbol));
    console.log(`   ✅ Added ${sp500Symbols.length} S&P 500 stocks\n`);
  } catch (e) {
    console.warn('   ⚠️  Failed to fetch S&P 500:', e.message, '\n');
  }

  // Add additional manually curated list of popular stocks with analyst coverage
  const popularCovered = [
    // Major tech
    'TSLA', 'NVDA', 'AMD', 'GOOGL', 'GOOG', 'META', 'AMZN', 'NFLX', 'UBER', 'LYFT',

    // Finance
    'GS', 'MS', 'C', 'WFC', 'BLK', 'SCHW', 'AXP', 'COF',

    // Healthcare/Pharma
    'MRNA', 'BNTX', 'REGN', 'GILD', 'BIIB', 'VRTX',

    // EV/Clean Energy
    'RIVN', 'LCID', 'F', 'GM', 'TM', 'ENPH', 'SEDG',

    // Semiconductors
    'TSM', 'ASML', 'AVGO', 'TXN', 'QCOM', 'MU', 'LRCX', 'AMAT',

    // Consumer
    'SBUX', 'CMG', 'YUM', 'MCD', 'DPZ', 'WING',

    // Retail
    'AMZN', 'TGT', 'WMT', 'COST', 'LOW', 'HD', 'BBY',

    // Software
    'PLTR', 'SNOW', 'DDOG', 'CRWD', 'ZS', 'NET', 'OKTA', 'TEAM',

    // Aerospace
    'BA', 'LMT', 'RTX', 'GD', 'NOC',

    // Industrial
    'CAT', 'DE', 'HON', 'UPS', 'FDX',

    // Energy
    'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'OXY'
  ];

  console.log('📊 Adding popular stocks with known analyst coverage...');
  popularCovered.forEach(symbol => coveredStocks.add(symbol));
  console.log(`   ✅ Added ${popularCovered.length} popular stocks\n`);

  // Convert to sorted array
  const finalList = Array.from(coveredStocks).sort();

  console.log('=' .repeat(70));
  console.log(`✅ SUCCESS: Built analyst coverage database`);
  console.log(`📊 Total stocks with analyst coverage: ${finalList.length}`);
  console.log('=' .repeat(70));

  // Create coverage object
  const coverageData = {};
  finalList.forEach(symbol => {
    coverageData[symbol] = true;
  });

  // Save to file
  const outputPath = './src/data/analyst-coverage.json';
  fs.writeFileSync(outputPath, JSON.stringify(coverageData, null, 2));
  console.log(`\n💾 Saved to: ${outputPath}`);

  // Print sample
  console.log('\n📋 Sample stocks with coverage:');
  finalList.slice(0, 20).forEach((symbol, i) => {
    if (i % 5 === 0) console.log('  ', symbol);
    else process.stdout.write(` ${symbol}`);
  });
  console.log('\n');

  // Stats
  console.log('📈 Coverage Stats:');
  console.log(`   - Dow 30: ${knownCoveredIndices.dow30.length} stocks`);
  console.log(`   - S&P 500: ~500 stocks`);
  console.log(`   - Popular stocks: ${popularCovered.length} stocks`);
  console.log(`   - Total unique: ${finalList.length} stocks`);
  console.log('\n✅ Done! Now update your code to load this coverage data.\n');

  return coverageData;
}

// Run the script
buildCoverageDatabase().catch(console.error);
