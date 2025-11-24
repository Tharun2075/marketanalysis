# Symbol Search Cache System

## Overview

The search autocomplete feature uses a **local cache** of ticker symbols to provide instant search results **without consuming API calls**.

## How It Works

1. **One-Time Download**: Run `npm run update-symbols-global` to download symbols from GitHub
2. **Local Storage**: 15,000+ global stock symbols stored in `src/data/symbols-cache.json`
3. **Zero API Calls**: Search happens locally in the browser - instant and free!
4. **Smart Ranking**: Results ranked by relevance (exact match > starts with > contains)

## Features

- ⚡ **Instant search** - No network delays
- 💰 **Zero API costs** - Doesn't use FMP API quota
- 🌍 **Global coverage** - 15,176 symbols from NYSE, NASDAQ, AMEX, ASX
- 🎯 **Smart filtering** - Prioritizes symbol matches over name matches
- 🏷️ **Auto-categorization** - Exchange tags (NYSE, NASDAQ, ASX), asset types (ETF, REIT, Bond)
- 🔄 **Auto-updated** - GitHub repos update nightly

## Updating the Cache

### Global Symbols (Recommended)

Run this command **once a week** to refresh all symbols:

```bash
npm run update-symbols-global
```

**Coverage**: US + Australia (15,176 symbols)

### US Only (Faster)

For US stocks only:

```bash
npm run update-symbols
```

**Coverage**: US only (7,065 symbols)

**Cost**: 0 API calls (downloads from GitHub, free!)

## Cache Stats

- **Total Symbols**: 15,176
- **File Size**: ~1.2MB
- **Coverage**:
  - 🇺🇸 **United States**: NYSE (3,448), NASDAQ (9,544), AMEX (286)
  - 🇦🇺 **Australia**: ASX (1,898)
- **Data Sources**:
  - [rreichel3/US-Stock-Symbols](https://github.com/rreichel3/US-Stock-Symbols) (US exchanges)
  - [LondonMarket/Global-Stock-Symbols](https://github.com/LondonMarket/Global-Stock-Symbols) (International exchanges)

## Manual Ticker Entry

Users can still type **any ticker symbol** directly - the search is just for suggestions. If someone types a ticker not in the cache, the app will still fetch data for it.

## Benefits

**Before** (API search):
- Every keystroke = 1 API call
- Slow (network latency)
- Expensive (burns through quota)
- Example: "AAPL" = 4 API calls

**After** (Local cache):
- Every keystroke = 0 API calls
- Instant (local search)
- Free (no API usage)
- Example: "AAPL" = 0 API calls ✅

## Future Improvements

- ✅ **Global Exchanges** - Added ASX (Australia)
- 🔜 **More International Exchanges**:
  - London Stock Exchange (LSE) - ~2,000 symbols
  - Hong Kong Exchange (HKEX) - ~2,500 symbols
  - Tokyo Stock Exchange (TSE) - ~3,800 symbols
  - India Exchanges (NSE, BSE) - ~5,000+ symbols
- 🔜 **Compress cache file** (gzip) - Reduce 1.2MB to ~200KB
- 🔜 **Market-specific filters** - Filter by region (US, Asia, Europe)
- 🔜 **Fuzzy search** - Handle typos and approximate matches
- 🔜 **WebSocket integration** - Real-time symbol updates
