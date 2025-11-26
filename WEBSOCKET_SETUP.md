# WebSocket Real-Time Data Setup Guide

## Overview

This application supports **multiple WebSocket providers** that automatically route based on the stock's exchange. This eliminates REST API calls for real-time price updates!

## 🎯 Strategy: Multi-Provider WebSocket Pool

Instead of exhausting your FMP API limit (250 calls/day), use WebSockets for real-time data:

```
Symbol Search → Local Cache (0 API calls)
Real-Time Prices → WebSocket (0 API calls)
Analyst Data → FMP REST API (only when needed)
```

---

## 📡 Supported WebSocket Providers

### 1. **Finnhub** (Free - US Stocks) ⭐

**Best for**: NYSE, NASDAQ, AMEX real-time prices

- **Cost**: FREE (60 API calls/minute)
- **Exchanges**: NYSE, NASDAQ, AMEX
- **WebSocket**: ✅ Included in free tier
- **Latency**: ~100ms

**Setup**:
1. Sign up: https://finnhub.io/register
2. Get your API key
3. Add to `.env`:
```bash
VITE_FINNHUB_API_KEY=your_finnhub_key_here
```

**Why use it**: Best free option for US stocks!

---

### 2. **Real-Time Finance** (Free - US + Europe) ⭐⭐

**Best for**: NYSE, NASDAQ, LSE, EURONEXT

- **Cost**: FREE (no limits!)
- **Exchanges**: NYSE, NASDAQ, LSE, EURONEXT (~10K stocks)
- **WebSocket**: ✅ Public API
- **Latency**: ~150ms

**Setup**:
1. No signup needed!
2. GitHub: https://github.com/Real-time-finance/finance-websocket-API
3. Just works out of the box ✅

**Why use it**: Completely free, no API key needed!

---

### 3. **Twelve Data** (Paid - Global Coverage)

**Best for**: All global exchanges (LSE, JPX, HKEX, NSE, BSE, etc.)

- **Cost**: $8-29/month
- **Exchanges**: ALL (70+ countries)
- **WebSocket**: ✅ Ultra-low latency (~170ms)
- **Pricing**: https://twelvedata.com/pricing

**Setup**:
1. Sign up: https://twelvedata.com/
2. Choose plan ($8-29/mo)
3. Add to `.env`:
```bash
VITE_TWELVEDATA_API_KEY=your_twelvedata_key_here
```

**Why use it**: Only provider with COMPLETE global coverage!

---

### 4. **FMP WebSocket** (Paid - Premium Only)

**Best for**: Backup if you already have FMP premium

- **Cost**: Not included in standard tiers (contact sales)
- **Exchanges**: Global
- **WebSocket**: ✅ If you have premium plan

**Setup**:
Already configured if you have `.env` with FMP API key.

---

## 🚀 Quick Start

### Option 1: Free Tier (Recommended) ⭐

Use Finnhub + Real-Time Finance for zero cost:

```bash
# Add to .env
VITE_FINNHUB_API_KEY=your_finnhub_key_here

# No other keys needed! Real-Time Finance is public
```

**Coverage**:
- ✅ NYSE, NASDAQ, AMEX (Finnhub)
- ✅ LSE, EURONEXT (Real-Time Finance)
- ✅ All free!

**API Budget**:
- Symbol cache: 0 calls (GitHub)
- Real-time prices: 0 calls (WebSocket)
- Analyst data: 250 calls = **41 stocks/day** ✅

---

### Option 2: Maximum Coverage ($29/mo)

Add Twelve Data for global exchanges:

```bash
# Add to .env
VITE_FINNHUB_API_KEY=your_finnhub_key_here
VITE_TWELVEDATA_API_KEY=your_twelvedata_key_here
```

**Coverage**:
- ✅ NYSE, NASDAQ (Finnhub - free)
- ✅ LSE, EURONEXT (RTF - free)
- ✅ JPX, HKEX, NSE, BSE, TSX, etc. (Twelve Data - $29/mo)

---

## 💻 Usage in Code

### Basic Usage - Single Stock

```javascript
import { useRealTimePrice } from './hooks/useRealTimePrice';

function StockPrice({ symbol, exchange }) {
  const { price, change, changePercent, isConnected, provider } = useRealTimePrice(symbol, exchange);

  return (
    <div>
      <h2>{symbol}</h2>
      <p>Price: ${price}</p>
      <p>Change: ${change} ({changePercent}%)</p>
      <p>Source: {provider} {isConnected ? '🟢' : '🔴'}</p>
    </div>
  );
}

// Usage
<StockPrice symbol="AAPL" exchange="NASDAQ" />
<StockPrice symbol="BP.L" exchange="LSE" />
<StockPrice symbol="7203.T" exchange="JPX" />
```

### Advanced Usage - Multiple Stocks

```javascript
import { useRealTimePrices } from './hooks/useRealTimePrice';

function Watchlist() {
  const tickers = [
    { symbol: 'AAPL', exchange: 'NASDAQ' },
    { symbol: 'MSFT', exchange: 'NASDAQ' },
    { symbol: 'TSLA', exchange: 'NASDAQ' }
  ];

  const prices = useRealTimePrices(tickers);

  return (
    <div>
      {tickers.map(({ symbol }) => (
        <div key={symbol}>
          {symbol}: ${prices[symbol]?.price || 'Loading...'}
        </div>
      ))}
    </div>
  );
}
```

### Check Connection Status

```javascript
import { useWebSocketStatus } from './hooks/useRealTimePrice';

function WebSocketIndicator() {
  const status = useWebSocketStatus();

  return (
    <div>
      <p>Finnhub: {status.finnhub?.connected ? '🟢' : '🔴'} ({status.finnhub?.subscribers} active)</p>
      <p>Real-Time Finance: {status.rtf?.connected ? '🟢' : '🔴'}</p>
      <p>Twelve Data: {status.twelvedata?.connected ? '🟢' : '🔴'}</p>
    </div>
  );
}
```

---

## 🔄 How Provider Selection Works

The WebSocket manager automatically selects the best provider:

1. **Check exchange** (NYSE, LSE, JPX, etc.)
2. **Find providers** that support this exchange
3. **Filter by availability** (API key configured + free tier preference)
4. **Sort by priority**:
   - Priority 1: Finnhub (free US)
   - Priority 2: Real-Time Finance (free US+EU)
   - Priority 3: Twelve Data (paid global)
   - Priority 4: FMP (premium backup)
5. **Connect to best option**

### Example Routing

| Symbol | Exchange | Selected Provider | Why? |
|--------|----------|-------------------|------|
| AAPL | NASDAQ | Finnhub | Free, best for US |
| BP.L | LSE | Real-Time Finance | Free, supports LSE |
| 7203.T | JPX | Twelve Data | Only provider with JPX |
| RELIANCE.NS | NSE | Twelve Data | Only provider with NSE |

---

## 📊 API Call Savings

### Without WebSocket (Old Way)

```
Search "AAPL" → 1 API call
Get price → 1 API call
Price updates (every 5 sec) → 720 API calls/hour!
Analyst data → 6 API calls

Total: 727 calls for 1 hour of watching 1 stock
```

**Daily limit exhausted in**: 20 minutes ❌

### With WebSocket (New Way)

```
Search "AAPL" → 0 API calls (local cache)
Get price → 0 API calls (WebSocket)
Price updates (real-time) → 0 API calls (WebSocket)
Analyst data → 6 API calls (only once)

Total: 6 calls for unlimited hours of watching
```

**Daily limit**: 250 calls = **41 stocks** with full analyst data ✅

---

## 🛠️ Testing WebSocket Connection

### Test Script

Create `test-websocket.js`:

```javascript
import { wsManager } from './src/services/websocketManager.js';

async function testWebSocket() {
  console.log('🧪 Testing WebSocket connections...\n');

  // Subscribe to AAPL
  const result = await wsManager.subscribe('AAPL', 'NASDAQ', (data) => {
    console.log('📈 Price update:', data);
  });

  if (result) {
    console.log(`✅ Connected via ${result.provider}`);
    console.log('⏱️  Listening for 30 seconds...\n');

    // Listen for 30 seconds
    setTimeout(() => {
      console.log('\n🛑 Unsubscribing...');
      wsManager.unsubscribe('AAPL', 'NASDAQ');
      wsManager.disconnectAll();
      console.log('✅ Test complete!');
      process.exit(0);
    }, 30000);
  } else {
    console.error('❌ Failed to connect');
    process.exit(1);
  }
}

testWebSocket();
```

Run:
```bash
node test-websocket.js
```

---

## 🔧 Troubleshooting

### "No provider available"

**Problem**: WebSocket manager can't find a provider for this exchange.

**Solution**:
1. Check if exchange is supported by any provider
2. Add API key for provider that supports it
3. Fallback to REST API (FMP) if no WebSocket available

### "Connection failed"

**Problem**: WebSocket connection error

**Solutions**:
- Check API key is correct
- Verify API key has WebSocket access (some free tiers don't)
- Check firewall/network settings
- Try different provider

### "Price not updating"

**Problem**: Connected but no price data

**Solutions**:
- Check symbol format (e.g., LSE uses `.L` suffix)
- Verify market hours (WebSockets only work when market is open)
- Check provider limits (free tiers may have symbol limits)

---

## 💰 Cost Comparison

### Scenario: Watch 10 stocks, 8 hours/day, 20 trading days/month

| Approach | Monthly Cost | API Calls | Notes |
|----------|--------------|-----------|-------|
| **REST API only** | $0 | 345,600 calls | ❌ Exceeds all limits |
| **GitHub cache + REST** | $0 | 3,600 calls | ⚠️ Still too many |
| **GitHub + Finnhub WS** | $0 | 60 calls | ✅ Perfect! |
| **Twelve Data** | $29 | 0 calls | ✅ Global coverage |
| **FMP Premium** | $59 | 0 calls | ❌ Expensive, limited |

**Winner**: GitHub cache + Finnhub WebSocket = $0/month ⭐

---

## 📚 Resources

- [Finnhub API Docs](https://finnhub.io/docs/api)
- [Real-Time Finance GitHub](https://github.com/Real-time-finance/finance-websocket-API)
- [Twelve Data WebSocket Docs](https://twelvedata.com/docs#websocket)
- [FMP WebSocket Docs](https://site.financialmodelingprep.com/developer/docs/websocket-api)

---

## 🎯 Recommended Setup

**For most users** (free):
```bash
VITE_FMP_API_KEY=your_fmp_key  # Analyst data
VITE_FINNHUB_API_KEY=your_finnhub_key  # Real-time US prices
# RTF works automatically (no key needed)
```

**For global coverage** ($29/mo):
```bash
VITE_FMP_API_KEY=your_fmp_key  # Analyst data
VITE_FINNHUB_API_KEY=your_finnhub_key  # Real-time US prices
VITE_TWELVEDATA_API_KEY=your_twelvedata_key  # Global real-time
```

---

## Next Steps

1. ✅ Sign up for Finnhub (free)
2. ✅ Add API key to `.env`
3. ✅ Test with `node test-websocket.js`
4. ✅ Update analyst dashboard to use `useRealTimePrice` hook
5. ✅ Enjoy real-time prices with zero API calls!
