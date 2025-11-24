# Symbol Cache Update Guide

## TL;DR - Quick Start

**Recommended for daily use:**
```bash
npm run build-cache-fmp
```
Uses 36 API calls, gets ~3,000 symbols from 22+ exchanges including LSE, JPX, ASX, FSX, and more!

---

## Three Approaches to Symbol Updates

### Approach 1: FMP API (Recommended) ⭐

**Best for**: Fresh data, all FMP-supported exchanges, daily updates

```bash
# Basic mode - 36 API calls (recommended for daily)
npm run build-cache-fmp

# International mode - 46 API calls (includes exchange prefixes)
npm run build-cache-fmp:international

# Comprehensive mode - 712 API calls (all two-letter combos)
npm run build-cache-fmp:comprehensive

# Full mode - 758 API calls (everything!)
npm run build-cache-fmp:full
```

#### Pros:
✅ Most up-to-date (queries FMP directly)
✅ Includes ALL exchanges FMP supports (22+ exchanges)
✅ New listings added immediately
✅ Delisted stocks automatically removed
✅ Includes company names, currency, type
✅ Basic mode only uses 36 API calls!

#### Cons:
❌ Requires API calls (counts against daily limit)
❌ Hit API limit = can't complete full download

#### Coverage by Mode:

| Mode | API Calls | Symbols | Exchanges | Recommended For |
|------|-----------|---------|-----------|-----------------|
| **basic** | 36 | ~3,000 | 22+ | Daily updates |
| **international** | 46 | ~3,500 | 25+ | Weekly updates |
| **comprehensive** | 712 | ~15,000 | 30+ | Monthly deep refresh |
| **full** | 758 | ~18,000 | 35+ | One-time setup |

#### Exchange Coverage (Basic Mode):

- 🇺🇸 **NYSE** (1,272), **NASDAQ** (590), **AMEX** (593)
- 🇬🇧 **LSE** - London (135)
- 🇯🇵 **JPX** - Tokyo (72)
- 🇦🇺 **ASX** - Australia (10)
- 🇩🇪 **FSX/XETRA** - Germany (63)
- 🇫🇷 **PAR** - Paris
- 🇦🇹 **VIE** - Vienna
- 🇵🇱 **WSE** - Warsaw
- 🇹🇭 **SET** - Thailand
- 🇸🇬 **SES** - Singapore
- 🇨🇦 **TSX/TSXV** - Toronto
- 💱 **CRYPTO** (9)
- **OTC** (68), **CBOE** (69)

---

### Approach 2: GitHub Global (Good for Testing)

**Best for**: Offline development, no API usage, static datasets

```bash
# US + Australia (15,176 symbols)
npm run update-symbols-global

# US only (7,065 symbols)
npm run update-symbols
```

#### Pros:
✅ Zero API calls
✅ Works offline
✅ Fast download (~10 seconds)
✅ Includes company names
✅ Reliable (doesn't fail mid-download)

#### Cons:
❌ Limited exchange coverage (only US + Australia)
❌ Updates weekly (GitHub repo schedule)
❌ Missing: LSE, TSE, HKEX, NSE, BSE, etc.
❌ New listings delayed by days/weeks

#### Coverage:
- 🇺🇸 NYSE (3,448), NASDAQ (9,544), AMEX (286)
- 🇦🇺 ASX (1,898)
- **Total**: 15,176 symbols

---

### Approach 3: Manual API Queries (Advanced)

**Best for**: Custom requirements, specific exchanges, testing

Use `test-api.js` to manually test endpoints.

---

## Recommended Workflow

### Daily Development

Use FMP basic mode (36 calls):
```bash
npm run build-cache-fmp
```

**Why**: Gets fresh data from 22+ exchanges, only uses 36 calls

### Weekly Refresh

Use FMP international mode (46 calls):
```bash
npm run build-cache-fmp:international
```

**Why**: Includes exchange-specific prefixes for better international coverage

### Monthly Deep Refresh

Use FMP comprehensive mode (712 calls):
```bash
npm run build-cache-fmp:comprehensive
```

**Why**: Uses two-letter combinations to find obscure tickers

**Warning**: Uses most of your daily API limit!

### API Limit Reached?

Use GitHub fallback:
```bash
npm run update-symbols-global
```

**Why**: Zero API calls, still gets 15K+ symbols

---

## Comparison Table

| Feature | FMP Basic | FMP Full | GitHub Global |
|---------|-----------|----------|---------------|
| **API Calls** | 36 | 758 | 0 |
| **Symbols** | ~3,000 | ~18,000 | 15,176 |
| **Exchanges** | 22+ | 35+ | 4 (US + AU) |
| **Update Speed** | Fast (6 sec) | Slow (2 min) | Very Fast (10 sec) |
| **Freshness** | Real-time | Real-time | Weekly lag |
| **International** | ✅ Excellent | ✅ Best | ❌ Limited |
| **New Listings** | ✅ Immediate | ✅ Immediate | ❌ Days delay |
| **Offline** | ❌ No | ❌ No | ✅ Yes |
| **Reliability** | ⚠️ API dependent | ⚠️ API dependent | ✅ Always works |

---

## Exchange Coverage Details

### Fully Covered by FMP Basic Mode:

- **NYSE** - New York Stock Exchange
- **NASDAQ** - NASDAQ Global Select
- **AMEX** - NYSE American
- **LSE** - London Stock Exchange 🇬🇧
- **JPX** - Japan Exchange (Tokyo) 🇯🇵
- **ASX** - Australian Securities Exchange 🇦🇺
- **FSX** - Frankfurt Stock Exchange 🇩🇪
- **XETRA** - Deutsche Börse (Germany) 🇩🇪
- **TSX** - Toronto Stock Exchange 🇨🇦
- **TSXV** - TSX Venture Exchange 🇨🇦
- **SES** - Singapore Exchange 🇸🇬
- **OTC** - Over-the-Counter Markets
- **CBOE** - Chicago Board Options Exchange
- **CRYPTO** - Cryptocurrency pairs

### Available with International/Comprehensive Mode:

- **HKEX** - Hong Kong Exchange 🇭🇰
- **NSE** - National Stock Exchange of India 🇮🇳
- **BSE** - Bombay Stock Exchange 🇮🇳
- **EPA** - Euronext Paris 🇫🇷
- **SWX** - Swiss Exchange 🇨🇭
- **TSE** - Taiwan Stock Exchange 🇹🇼
- **KRX** - Korea Exchange 🇰🇷
- **BMV** - Mexican Stock Exchange 🇲🇽
- **B3** - Brazil Stock Exchange 🇧🇷

---

## Handling API Limits

### If You Hit 429 "Limit Reached" Error:

1. **Wait for reset** (daily limit resets at midnight UTC)
2. **Use what you got** (partial download still works!)
3. **Fall back to GitHub**: `npm run update-symbols-global`
4. **Upgrade FMP plan** (if you need more calls)

### Partial Download Strategy

FMP script saves progress automatically:
- Completed queries are preserved
- Partial downloads are usable
- Re-run later to continue

---

## Which Exchanges Get Company Names?

### Full Company Names:
✅ All symbols from FMP API (all modes)
✅ NYSE, NASDAQ, ASX from GitHub global

### Symbol Only (No Company Name):
❌ Some international symbols may use ticker as name

To get company names for all symbols, use FMP API modes.

---

## Automation

### Daily Auto-Update (Recommended)

Add to crontab (Linux/Mac):
```bash
# Every day at 2 AM
0 2 * * * cd /path/to/marketanalysis && npm run build-cache-fmp
```

### Weekly Deep Refresh

```bash
# Every Sunday at 3 AM
0 3 * * 0 cd /path/to/marketanalysis && npm run build-cache-fmp:comprehensive
```

### Pre-Start Hook

Update `package.json`:
```json
"scripts": {
  "dev": "npm run build-cache-fmp && vite"
}
```

**Warning**: Adds 6 seconds startup time + uses 36 API calls every dev restart!

---

## Troubleshooting

### "Restricted Endpoint" Error

Some FMP endpoints require premium subscription:
- `/stable/stock-list` ❌ Premium only
- `/stable/actively-trading-list` ❌ Premium only
- `/stable/search-symbol` ✅ Free tier (what we use)

### API Limit Reached

You'll see:
```
HTTP 429: Limit Reach. Please upgrade your plan
```

**Solution**: Use GitHub fallback or wait for reset

### Empty Cache File

If `symbols-cache.json` is empty:
1. Check API key in `.env`
2. Verify API key has calls remaining
3. Try `npm run update-symbols-global` as fallback

### Dev Server Not Showing Symbols

Browser console (F12) should show:
```
[API] ✅ Loaded 3000 symbols from cache
```

If not:
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache
3. Re-run cache build
4. Check file exists: `ls -lh src/data/symbols-cache.json`

---

## Best Practices

### For Production

1. **Use FMP basic mode** for daily updates
2. **Keep GitHub backup** for fallback
3. **Monitor API usage** with API call counter
4. **Automate weekly refresh**

### For Development

1. **Use GitHub** during active development (saves API calls)
2. **Switch to FMP** before committing (fresh data)
3. **Don't commit** `symbols-cache.json` (too large, changes often)

### For Testing

1. **Use small test cache** (save current cache, replace with subset)
2. **Mock search results** for unit tests
3. **Don't waste API calls** on test data

---

## Summary

**Just starting?** → `npm run build-cache-fmp`

**Need more coverage?** → `npm run build-cache-fmp:international`

**API limit hit?** → `npm run update-symbols-global`

**Maximum coverage?** → `npm run build-cache-fmp:comprehensive` (weekly)

**Questions?** Check [GLOBAL_EXCHANGES.md](./GLOBAL_EXCHANGES.md) for architecture details.
