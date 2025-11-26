/**
 * Simple WebSocket Test for Finnhub
 * Tests if we can connect and receive data
 */

import dotenv from 'dotenv';
import WebSocket from 'ws';

dotenv.config();

const API_KEY = process.env.VITE_FINNHUB_API_KEY;

console.log('🧪 Testing Finnhub WebSocket Connection...\n');
console.log(`API Key: ${API_KEY ? API_KEY.substring(0, 10) + '...' : 'NOT FOUND'}`);

if (!API_KEY) {
  console.error('❌ No Finnhub API key found in .env');
  process.exit(1);
}

const ws = new WebSocket(`wss://ws.finnhub.io?token=${API_KEY}`);

ws.on('open', () => {
  console.log('✅ WebSocket connected!');
  console.log('📡 Subscribing to AAPL...');
  ws.send(JSON.stringify({ type: 'subscribe', symbol: 'AAPL' }));

  // Also try PLTR
  setTimeout(() => {
    console.log('📡 Subscribing to PLTR...');
    ws.send(JSON.stringify({ type: 'subscribe', symbol: 'PLTR' }));
  }, 1000);
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('📥 Received:', JSON.stringify(message, null, 2));
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
});

ws.on('close', () => {
  console.log('🔌 WebSocket closed');
});

// Keep alive for 30 seconds
setTimeout(() => {
  console.log('\n⏰ Test complete, closing connection...');
  ws.close();
  process.exit(0);
}, 30000);
