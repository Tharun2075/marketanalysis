# Quick Start Guide

Get MarketSight running in under 5 minutes!

## 🚀 Fast Setup

```bash
# 1. Clone and enter directory
git clone https://github.com/Tharun2075/marketanalysis.git
cd marketanalysis

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Add your API key to .env
# Edit .env and replace 'your_api_key_here' with your actual key

# 5. Start the app
npm run dev

# 6. Open http://localhost:3000
```

## 🔑 Get Free API Key

1. Visit: https://financialmodelingprep.com/developer/docs/
2. Sign up (takes 30 seconds)
3. Copy your API key
4. Paste into `.env` file

## ✅ Verify It Works

1. You should see the dashboard with AAPL data
2. Try searching for other tickers: TSLA, GOOGL, MSFT
3. Check console (F12) for any errors

## 🐛 Common Issues

### "Demo Mode" Banner Appears
→ Your API key isn't set correctly in `.env`
→ Make sure the variable is named `VITE_FMP_API_KEY`

### Port 3000 Already in Use
```bash
# Use a different port
npm run dev -- --port 3001
```

### Dependencies Won't Install
```bash
# Clear cache and retry
rm -rf node_modules package-lock.json
npm install
```

## 📊 Try These Tickers

- **Tech**: AAPL, GOOGL, MSFT, TSLA, NVDA
- **Finance**: JPM, BAC, GS
- **Healthcare**: JNJ, PFE

## 🎯 Next Steps

- Read full [README.md](./README.md)
- Check [CHANGELOG.md](./CHANGELOG.md) for updates
- Customize colors in `tailwind.config.js`
- Add more mock data in `src/services/mockData.js`

## 💡 Tips

1. **Free API Limit**: 250 calls/day - perfect for development
2. **Browser Console**: Open with F12 to see detailed API logs
3. **Hot Reload**: Changes to code update instantly
4. **Mobile Testing**: Works great on phones too!

## ❓ Need Help?

- Check the [README.md](./README.md) troubleshooting section
- Open an issue on GitHub
- Review API docs: https://financialmodelingprep.com/developer/docs/

---

Happy analyzing! 📈
