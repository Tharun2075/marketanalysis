# MarketSight - Analyst Dashboard

A professional stock market analyst dashboard built with React that displays real-time analyst ratings, consensus data, and price targets using the Financial Modeling Prep API.

![MarketSight Dashboard](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-18.2-blue)
![Vite](https://img.shields.io/badge/Vite-5.0-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-cyan)

## ✨ Features

- 📊 **Real-time Analyst Consensus** - Aggregated ratings from top financial institutions
- 🎯 **Price Target Visualization** - Interactive chart showing analyst price targets
- 📈 **Latest Analyst Activity** - Recent upgrades, downgrades, and rating changes
- 🔍 **Stock Search** - Quick search for any ticker symbol
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🎨 **Modern UI** - Clean, professional interface with TailwindCSS
- 🔐 **Secure API Integration** - Environment-based API key management
- 🎭 **Demo Mode Fallback** - Graceful fallback when API limits are reached

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm/yarn/pnpm
- Financial Modeling Prep API key (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tharun2075/marketanalysis.git
   cd marketanalysis
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Add your API key to `.env`**
   ```env
   VITE_FMP_API_KEY=your_actual_api_key_here
   ```

   Get your free API key at: [https://financialmodelingprep.com/developer/docs/](https://financialmodelingprep.com/developer/docs/)

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔑 Getting an API Key

1. Visit [Financial Modeling Prep](https://financialmodelingprep.com/developer/docs/)
2. Sign up for a free account
3. Copy your API key from the dashboard
4. Paste it into your `.env` file

**Free Tier Limits:**
- 250 API calls per day
- Perfect for development and testing

## 📁 Project Structure

```
marketanalysis/
├── src/
│   ├── components/          # React components
│   │   ├── AnalystDashboard.jsx
│   │   ├── ConsensusMeter.jsx
│   │   ├── Navigation.jsx
│   │   ├── PriceTargetChart.jsx
│   │   └── RatingBadge.jsx
│   ├── services/            # API and data services
│   │   ├── api.js           # API integration
│   │   └── mockData.js      # Fallback mock data
│   ├── utils/               # Utility functions
│   │   └── formatters.js    # Data formatting helpers
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── .env                     # Environment variables (not in git)
├── .env.example             # Example environment file
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS config
└── README.md                # This file
```

## 🛠️ Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📊 Supported Tickers

Search for any publicly traded stock using its ticker symbol:

- **Tech**: AAPL, GOOGL, MSFT, TSLA, META, NVDA, AMD
- **Finance**: JPM, BAC, GS, MS, WFC, C
- **Healthcare**: JNJ, UNH, PFE, ABBV, TMO
- **And thousands more...**

## 🎨 Key Components

### AnalystDashboard
Main dashboard component that orchestrates data fetching and display.

### ConsensusMeter
Visual breakdown of analyst ratings (Strong Buy, Buy, Hold, Sell, Strong Sell).

### PriceTargetChart
Interactive visualization of analyst price targets with upside calculation.

### RatingBadge
Color-coded badge component for displaying analyst ratings.

## 🔧 Configuration

### API Service (`src/services/api.js`)
- Handles all API calls to Financial Modeling Prep
- Implements graceful error handling
- Provides automatic fallback to demo data

### Mock Data (`src/services/mockData.js`)
- Fallback data for when API is unavailable
- Pre-configured data for popular stocks (AAPL, TSLA, GOOGL, MSFT)

### Environment Variables
```env
VITE_FMP_API_KEY=your_api_key_here
VITE_APP_NAME=MarketSight
VITE_APP_VERSION=1.0.0
```

## 🐛 Troubleshooting

### API Key Issues
- **Problem**: "Demo Mode" banner appears
- **Solution**: Verify your API key is correctly set in `.env` file
- **Check**: Make sure variable name is `VITE_FMP_API_KEY` (with VITE_ prefix)

### API Rate Limits
- **Problem**: Getting demo data after several searches
- **Solution**: Free tier has 250 calls/day limit
- **Workaround**: Wait 24 hours or upgrade to paid plan

### No Data Showing
- **Problem**: Ticker shows "N/A" for all fields
- **Solution**: Check browser console (F12) for API errors
- **Common causes**: Invalid ticker, API downtime, network issues

### Development Server Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 🔐 Security Best Practices

- ✅ **Never commit `.env` file** (it's in `.gitignore`)
- ✅ **API key is client-side** - Use backend proxy for production
- ✅ **Use environment variables** - Not hardcoded keys
- ✅ **Rotate API keys regularly**

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variable in Vercel dashboard
# VITE_FMP_API_KEY=your_key
```

### Netlify
```bash
# Build
npm run build

# Deploy dist/ folder
# Add VITE_FMP_API_KEY in Netlify dashboard
```

### GitHub Pages
Not recommended - API key would be exposed in client-side code.
Use a backend proxy instead.

## 📈 Future Enhancements

- [ ] Historical price charts
- [ ] News sentiment analysis
- [ ] Earnings calendar
- [ ] Portfolio tracking
- [ ] Email alerts for rating changes
- [ ] Dark mode theme
- [ ] Export reports to PDF
- [ ] Multi-stock comparison

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Financial Modeling Prep](https://financialmodelingprep.com/) - API data provider
- [Lucide React](https://lucide.dev/) - Beautiful icon set
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vite](https://vitejs.dev/) - Fast build tool

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Tharun2075/marketanalysis/issues)
- **API Support**: [FMP Support](https://financialmodelingprep.com/developer/docs/)

---

Made with ❤️ by Tharun2075

**Disclaimer**: This tool is for informational purposes only. Always conduct your own research and consult with a financial advisor before making investment decisions.
