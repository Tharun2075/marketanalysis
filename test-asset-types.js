import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/stable';

async function testAssetTypes() {
  console.log('\n🧪 Testing Asset Type Detection\n');

  // Test 1: Get ETF list
  console.log('1️⃣  Fetching ETF List (first 5):');
  const etfRes = await fetch(`${BASE_URL}/etf-list?apikey=${API_KEY}`);
  const etfData = await etfRes.json();
  console.log(`   Total ETFs: ${Array.isArray(etfData) ? etfData.length : 0}`);
  console.log(`   Sample:`, JSON.stringify(etfData.slice(0, 3), null, 2));

  // Test 2: Get stock list
  console.log('\n2️⃣  Fetching Stock List (first 5):');
  const stockRes = await fetch(`${BASE_URL}/stock-list?apikey=${API_KEY}`);
  const stockData = await stockRes.json();
  console.log(`   Total Stocks: ${Array.isArray(stockData) ? stockData.length : 0}`);
  console.log(`   Sample:`, JSON.stringify(stockData.slice(0, 3), null, 2));

  // Test 3: Check if search includes type info
  console.log('\n3️⃣  Searching for "SPY" (known ETF):');
  const spyRes = await fetch(`${BASE_URL}/search-symbol?query=SPY&apikey=${API_KEY}`);
  const spyData = await spyRes.json();
  console.log(`   Results:`, JSON.stringify(spyData.slice(0, 2), null, 2));

  // Test 4: Get profile for more details
  console.log('\n4️⃣  Getting Profile for SPY:');
  const profileRes = await fetch(`${BASE_URL}/profile?symbol=SPY&apikey=${API_KEY}`);
  const profileData = await profileRes.json();
  console.log(`   Profile:`, JSON.stringify(profileData, null, 2).substring(0, 800));
}

testAssetTypes();
