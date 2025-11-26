/**
 * Quick Verify - Test sample of symbols to find premium-only ones
 * Uses minimal API calls (~50)
 */
import fs from 'fs';

const API_KEY = 'DVXwybd6u9SWWtRsxPpKeXfDeZC5tG4c';
const BASE_URL = 'https://financialmodelingprep.com/stable';

async function testSymbol(symbol) {
  try {
    const response = await fetch(`${BASE_URL}/grades-consensus?symbol=${symbol}&apikey=${API_KEY}`);
    const text = await response.text();

    if (text.includes('Premium')) {
      return { symbol, status: 'premium' };
    }

    try {
      const data = JSON.parse(text);
      if (Array.isArray(data) && data.length > 0 && data[0].strongBuy !== undefined) {
        const total = (data[0].strongBuy || 0) + (data[0].buy || 0) +
                      (data[0].hold || 0) + (data[0].sell || 0) + (data[0].strongSell || 0);
        return { symbol, status: 'ok', count: total };
      }
    } catch {}

    return { symbol, status: 'no-data' };
  } catch (e) {
    return { symbol, status: 'error', error: e.message };
  }
}

async function main() {
  // Load current list
  const coverage = JSON.parse(fs.readFileSync('./src/data/analyst-coverage.json'));
  const allSymbols = Object.keys(coverage);

  console.log(`Testing ${allSymbols.length} symbols...\n`);

  const premium = [];
  const working = [];
  const noData = [];

  for (let i = 0; i < allSymbols.length; i++) {
    const symbol = allSymbols[i];
    const result = await testSymbol(symbol);

    if (result.status === 'premium') {
      premium.push(symbol);
      process.stdout.write(`💰 `);
    } else if (result.status === 'ok') {
      working.push(symbol);
      process.stdout.write(`✅ `);
    } else {
      noData.push(symbol);
      process.stdout.write(`❌ `);
    }

    if ((i + 1) % 20 === 0) {
      console.log(` [${i + 1}/${allSymbols.length}]`);
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n\n${'='.repeat(60)}`);
  console.log('RESULTS');
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Working: ${working.length}`);
  console.log(`💰 Premium only: ${premium.length}`);
  console.log(`❌ No data: ${noData.length}`);

  // Save working list
  const verifiedCoverage = {};
  working.forEach(s => verifiedCoverage[s] = true);

  fs.writeFileSync('./src/data/analyst-coverage.json', JSON.stringify(verifiedCoverage, null, 2));
  console.log(`\n💾 Updated analyst-coverage.json with ${working.length} verified symbols`);

  if (premium.length > 0) {
    console.log(`\n💰 Premium-only symbols removed:\n${premium.join(', ')}`);
  }
}

main();
