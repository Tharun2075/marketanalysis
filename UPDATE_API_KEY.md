# Update Your API Key

## Current Issue
The API key in the `.env` file is returning "Access denied".

## How to Fix

### Option 1: Get Your Current API Key

1. Log in to: https://site.financialmodelingprep.com/developer/docs/dashboard
2. Find your API key in the dashboard
3. Copy the key

### Option 2: Generate a New FREE API Key

1. Visit: https://site.financialmodelingprep.com/developer/docs/
2. Sign up (if you haven't)
3. Copy your new API key

## Update the .env File

Open `.env` and replace the current key:

```env
# OLD (not working):
VITE_FMP_API_KEY=DVXwybd6u9SWWtRsxPpKeXfDeZC5tG4c

# NEW (your actual key):
VITE_FMP_API_KEY=YOUR_ACTUAL_KEY_HERE
```

## Test Your New Key

After updating, run:
```bash
# Test the key
curl "https://financialmodelingprep.com/api/v3/profile/AAPL?apikey=YOUR_KEY_HERE"

# If it works, you'll see Apple's company profile data
# If not, you'll see "Access denied"
```

## After Updating

1. Save the `.env` file
2. Restart the dev server: `npm run dev`
3. The app will now use real data!

---

**Need Help?**
- Dashboard: https://site.financialmodelingprep.com/developer/docs/dashboard
- Docs: https://site.financialmodelingprep.com/developer/docs/
