import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/stable';

async function testSearch(query) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🔍 Testing Search for: "${query}"`);
  console.log(`${'='.repeat(70)}`);

  // Test 1: Search by symbol
  console.log('\n1️⃣  SEARCH-SYMBOL ENDPOINT:');
  const symbolRes = await fetch(`${BASE_URL}/search-symbol?query=${query}&apikey=${API_KEY}`);
  const symbolData = await symbolRes.json();
  console.log(`   Results: ${Array.isArray(symbolData) ? symbolData.length : 0}`);
  console.log(`   Sample:`, JSON.stringify(symbolData.slice(0, 3), null, 2));

  // Test 2: Search by name
  console.log('\n2️⃣  SEARCH-NAME ENDPOINT:');
  const nameRes = await fetch(`${BASE_URL}/search-name?query=${query}&apikey=${API_KEY}`);
  const nameData = await nameRes.json();
  console.log(`   Results: ${Array.isArray(nameData) ? nameData.length : 0}`);
  console.log(`   Sample:`, JSON.stringify(nameData.slice(0, 3), null, 2));
}

// Test with different queries
(async () => {
  await testSearch('B');
  await testSearch('BTC');
  await testSearch('Apple');
})();
