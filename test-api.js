/**
 * API Testing Script
 * Tests Financial Modeling Prep API endpoints and checks what data we get
 */

import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/stable';

// Track API calls
let apiCallCount = 0;

/**
 * Fetch with detailed logging
 */
async function testEndpoint(name, url) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🧪 Testing: ${name}`);
  console.log(`📡 URL: ${url}`);
  console.log(`${'='.repeat(70)}`);

  try {
    apiCallCount++;
    const response = await fetch(url);

    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📦 Headers:`, {
      'content-type': response.headers.get('content-type'),
      'x-ratelimit-limit': response.headers.get('x-ratelimit-limit'),
      'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining'),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Error Response:`, errorText);
      return { error: errorText, status: response.status };
    }

    const data = await response.json();
    console.log(`✅ Success! Data type:`, Array.isArray(data) ? `Array[${data.length}]` : typeof data);
    console.log(`📋 Sample Data:`, JSON.stringify(data, null, 2).substring(0, 500));

    return data;
  } catch (error) {
    console.log(`❌ Exception:`, error.message);
    return { error: error.message };
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║          Financial Modeling Prep API Test Suite             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`\n🔑 API Key: ${API_KEY ? API_KEY.substring(0, 10) + '...' : 'NOT SET'}`);
  console.log(`⏰ Time: ${new Date().toISOString()}`);

  const ticker = 'AAPL';

  // Test 1: Company Profile (stable)
  await testEndpoint(
    'Company Profile (stable)',
    `${BASE_URL}/profile?symbol=${ticker}&apikey=${API_KEY}`
  );

  // Test 2: Quote Short (stable)
  await testEndpoint(
    'Quote Short (stable)',
    `${BASE_URL}/quote-short?symbol=${ticker}&apikey=${API_KEY}`
  );

  // Test 3: Quote Full (stable)
  await testEndpoint(
    'Quote Full (stable)',
    `${BASE_URL}/quote?symbol=${ticker}&apikey=${API_KEY}`
  );

  // Test 4: Historical Price (stable)
  await testEndpoint(
    'Historical Price EOD Full (stable)',
    `${BASE_URL}/historical-price-eod/full?symbol=${ticker}&apikey=${API_KEY}`
  );

  // Test 5: Analyst Grades Consensus (stable)
  await testEndpoint(
    'Analyst Grades Consensus (stable)',
    `${BASE_URL}/grades-consensus?symbol=${ticker}&apikey=${API_KEY}`
  );

  // Test 6: Price Target Consensus (stable)
  await testEndpoint(
    'Price Target Consensus (stable)',
    `${BASE_URL}/price-target-consensus?symbol=${ticker}&apikey=${API_KEY}`
  );

  // Test 7: Stock Grades/Ratings History (stable)
  await testEndpoint(
    'Stock Grades History (stable)',
    `${BASE_URL}/grades?symbol=${ticker}&apikey=${API_KEY}`
  );

  // Test 8: Check API usage limit endpoint (v4 - may not be in stable)
  // Note: API usage is tracked via dashboard, no stable endpoint found
  console.log(`\n${'='.repeat(70)}`);
  console.log(`ℹ️  Note: API usage tracking is available via FMP Dashboard`);
  console.log(`   Visit: https://site.financialmodelingprep.com/dashboard`);
  console.log(`${'='.repeat(70)}`);

  // Summary
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 SUMMARY`);
  console.log(`${'='.repeat(70)}`);
  console.log(`📞 Total API Calls Made: ${apiCallCount}`);
  console.log(`✅ Test completed at: ${new Date().toISOString()}`);
  console.log(`\n💡 TIP: Check the output above to see which endpoints work\n`);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
