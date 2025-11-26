/**
 * Verify Analyst Coverage on FMP Free Tier
 *
 * This script tests each symbol from the analyst-coverage.json file
 * to see which ones actually have coverage on the free tier.
 *
 * Usage: node verify-analyst-coverage.js
 *
 * Note: This uses API calls! Run sparingly.
 */

import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/stable';

// Rate limiting
const DELAY_MS = 500; // 500ms between requests to avoid rate limiting
const BATCH_SIZE = 10; // Process in batches

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkCoverage(symbol) {
  try {
    const url = `${BASE_URL}/grades-consensus?symbol=${symbol}&apikey=${API_KEY}`;
    const response = await fetch(url);

    if (response.status === 402) {
      return { symbol, hasData: false, reason: 'premium' };
    }

    if (!response.ok) {
      return { symbol, hasData: false, reason: `error-${response.status}` };
    }

    const data = await response.json();

    // Check if there's actual analyst data
    if (data && data.length > 0 && data[0].strongBuy !== undefined) {
      const total = (data[0].strongBuy || 0) + (data[0].buy || 0) +
                    (data[0].hold || 0) + (data[0].sell || 0) + (data[0].strongSell || 0);
      return { symbol, hasData: total > 0, count: total };
    }

    return { symbol, hasData: false, reason: 'no-data' };
  } catch (error) {
    return { symbol, hasData: false, reason: error.message };
  }
}

async function main() {
  console.log('🔍 Verifying Analyst Coverage on FMP Free Tier\n');
  console.log(`API Key: ${API_KEY ? '✅ Found' : '❌ Missing'}`);

  if (!API_KEY) {
    console.error('Please set VITE_FMP_API_KEY in .env file');
    process.exit(1);
  }

  // Load current coverage file
  const coverageFile = './src/data/analyst-coverage.json';
  const currentCoverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
  const symbols = Object.keys(currentCoverage);

  console.log(`\n📊 Testing ${symbols.length} symbols from analyst-coverage.json`);
  console.log(`⏱️  Estimated time: ${Math.ceil(symbols.length * DELAY_MS / 1000 / 60)} minutes\n`);

  const verified = {};
  const premium = [];
  const noData = [];
  let processed = 0;

  for (const symbol of symbols) {
    const result = await checkCoverage(symbol);
    processed++;

    if (result.hasData) {
      verified[symbol] = true;
      process.stdout.write(`✅ ${symbol} (${result.count} analysts) `);
    } else if (result.reason === 'premium') {
      premium.push(symbol);
      process.stdout.write(`💰 ${symbol} (premium) `);
    } else {
      noData.push(symbol);
      process.stdout.write(`❌ ${symbol} (${result.reason}) `);
    }

    // Progress indicator
    if (processed % 10 === 0) {
      console.log(`\n[${processed}/${symbols.length}]`);
    }

    await sleep(DELAY_MS);
  }

  console.log('\n\n' + '='.repeat(70));
  console.log('📊 VERIFICATION RESULTS');
  console.log('='.repeat(70));
  console.log(`✅ Verified coverage: ${Object.keys(verified).length} symbols`);
  console.log(`💰 Premium only: ${premium.length} symbols`);
  console.log(`❌ No data: ${noData.length} symbols`);

  // Save verified coverage
  const verifiedFile = './src/data/analyst-coverage-verified.json';
  fs.writeFileSync(verifiedFile, JSON.stringify(verified, null, 2));
  console.log(`\n💾 Saved verified list to: ${verifiedFile}`);

  // Show premium symbols
  if (premium.length > 0) {
    console.log(`\n💰 Premium-only symbols (${premium.length}):`);
    console.log(premium.join(', '));
  }

  // Show no-data symbols
  if (noData.length > 0) {
    console.log(`\n❌ No data symbols (${noData.length}):`);
    console.log(noData.join(', '));
  }

  console.log('\n✅ Done! To use the verified list:');
  console.log('   mv src/data/analyst-coverage-verified.json src/data/analyst-coverage.json');
}

main().catch(console.error);
