/**
 * API Testing Script
 * Tests Financial Modeling Prep API endpoints and checks what data we get
 */

import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/api';

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

    const text = await response.text();

    if (!response.ok) {
      console.log(`❌ Error Response:`, text);
      return { error: text, status: response.status };
    }

    const data = JSON.parse(text);
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

  // Test 1: API Availability (simple profile endpoint)
  await testEndpoint(
    'Company Profile (v3)',
    `${BASE_URL}/v3/profile/${ticker}?apikey=${API_KEY}`
  );

  // Test 2: Quote Short
  await testEndpoint(
    'Quote Short (v3)',
    `${BASE_URL}/v3/quote-short/${ticker}?apikey=${API_KEY}`
  );

  // Test 3: Quote Full
  await testEndpoint(
    'Quote Full (v3)',
    `${BASE_URL}/v3/quote/${ticker}?apikey=${API_KEY}`
  );

  // Test 4: Historical Price (1 day)
  await testEndpoint(
    'Historical Price (v3)',
    `${BASE_URL}/v3/historical-price-full/${ticker}?serietype=line&timeseries=1&apikey=${API_KEY}`
  );

  // Test 5: Analyst Recommendations
  await testEndpoint(
    'Analyst Recommendations (v3)',
    `${BASE_URL}/v3/analyst-stock-recommendations/${ticker}?apikey=${API_KEY}`
  );

  // Test 6: Price Target Consensus (v4)
  await testEndpoint(
    'Price Target Consensus (v4)',
    `${BASE_URL}/v4/price-target-consensus?symbol=${ticker}&apikey=${API_KEY}`
  );

  // Test 7: Upgrades/Downgrades (v4)
  await testEndpoint(
    'Upgrades & Downgrades (v4)',
    `${BASE_URL}/v4/upgrades-downgrades?symbol=${ticker}&apikey=${API_KEY}`
  );

  // Test 8: Check API usage limit endpoint
  await testEndpoint(
    'API Usage Check',
    `${BASE_URL}/v4/api-usage?apikey=${API_KEY}`
  );

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
