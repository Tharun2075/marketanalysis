import React, { useState, useEffect } from 'react';
import {
  Minus,
  ExternalLink,
  ShieldAlert,
  Loader2,
  AlertTriangle
} from 'lucide-react';

import { fetchStockData } from '../services/api';
import Navigation from './Navigation';
import ConsensusMeter from './ConsensusMeter';
import PriceTargetChart from './PriceTargetChart';
import RatingBadge from './RatingBadge';
import AnalystCoverageBrowser from './AnalystCoverageBrowser';
import AnalystDetailModal from './AnalystDetailModal';

/**
 * AnalystDashboard Component
 * Main dashboard for displaying stock analyst ratings and consensus
 */
export default function AnalystDashboard() {
  const [ticker, setTicker] = useState('AAPL');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('consensus');
  const [showAllRatings, setShowAllRatings] = useState(false);
  const [showCoverageBrowser, setShowCoverageBrowser] = useState(false);
  const [selectedAnalyst, setSelectedAnalyst] = useState(null);

  // Ref to track if initial load has happened (prevents React StrictMode double-call)
  const initialLoadRef = React.useRef(false);

  // Load initial data on mount
  useEffect(() => {
    // Prevent duplicate calls in React StrictMode (development)
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;

    loadData(ticker);
  }, []);

  /**
   * Load stock data for a given symbol
   */
  const loadData = async (symbol) => {
    setLoading(true);
    setData(null); // Clear data to show loading state

    const result = await fetchStockData(symbol);
    setData(result);
    setTicker(result.symbol);
    setLoading(false);
  };

  /**
   * Handle search form submission
   */
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    loadData(searchQuery);
    setSearchQuery(''); // Clear search after submission
  };

  /**
   * Handle autocomplete selection
   */
  const handleSelectResult = (symbol) => {
    console.log('[Dashboard] Selected symbol from autocomplete:', symbol);
    loadData(symbol);
    setSearchQuery(''); // Clear search after selection
  };

  // Loading State
  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-10 w-10 text-green-600 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Connecting to Financial Data...</p>
          <p className="text-xs text-slate-400 mt-2">Fetching analyst ratings and consensus...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (!data) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Critical Error: Unable to load application.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Demo Mode Banner */}
      {data.isDemo && (
        <div className="bg-amber-100 border-b border-amber-200 px-4 py-3 flex items-center justify-center text-sm text-amber-800">
          <AlertTriangle size={16} className="mr-2" />
          <span>
            <strong>Demo Mode:</strong> Live data unavailable ({data.error || "API issue"}).
            Showing sample data. Check console (F12) for details or verify API key in .env file.
          </span>
        </div>
      )}

      {/* Navigation */}
      <Navigation
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearch}
        onSelectResult={handleSelectResult}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stock Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <h1 className="text-3xl font-bold text-slate-900">{data.symbol}</h1>
              <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-xs font-semibold">
                {data.name}
              </span>
            </div>

            {/* Price Display (simplified - WebSocket temporarily disabled) */}
            <div className="space-y-2">
              <div className="flex items-baseline space-x-4">
                <span className="text-4xl font-light text-slate-900">
                  ${data.price ? data.price.toFixed(2) : '---'}
                </span>
                {data.change !== undefined && (
                  <div className={`flex items-center ${data.change >= 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                    <span className="text-lg">
                      {data.change >= 0 ? '+' : ''}${Math.abs(data.change || 0).toFixed(2)}
                    </span>
                    <span className="text-sm ml-2">
                      ({data.changePercent >= 0 ? '+' : ''}{(data.changePercent || 0).toFixed(2)}%)
                    </span>
                  </div>
                )}
              </div>
              <div className="text-xs text-slate-400">{data.currency || 'USD'}</div>
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={() => setShowCoverageBrowser(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center"
            >
              📊 Browse Covered Stocks
            </button>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm transition-colors">
              Trade
            </button>
            <button className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors">
              Add to Watchlist
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="border-b border-slate-200 mb-8">
          <div className="flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('consensus');
                setShowAllRatings(false);
              }}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'consensus'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Analyst Consensus
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                setShowAllRatings(false);
              }}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Rating History
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Consensus Meter (only show on Consensus tab) */}
          {activeTab === 'consensus' && (
            <div className="lg:col-span-1">
              <ConsensusMeter
                breakdown={data.breakdown}
                consensus={data.consensus}
                total={data.analystsCount}
              />
            </div>
          )}

          {/* Right Column: Price Targets & Ratings */}
          <div className={`space-y-8 ${activeTab === 'consensus' ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            {/* Price Target Chart (only show on Consensus tab) */}
            {activeTab === 'consensus' && <PriceTargetChart targets={data.targets} />}

            {/* Analyst Ratings Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center">
                  <ExternalLink size={16} className="mr-2 text-slate-500" />
                  {activeTab === 'consensus' ? 'Latest Analyst Activity' : 'Complete Rating History'}
                </h3>
                <span className="text-xs text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded">
                  {activeTab === 'consensus' ? 'Recent Updates' : `${data.ratings.length} Total`}
                </span>
              </div>

              <div className="overflow-x-auto">
                {data.ratings.length > 0 ? (
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium">Firm</th>
                        <th className="px-6 py-3 font-medium">Action</th>
                        <th className="px-6 py-3 font-medium">Rating</th>
                        <th className="px-6 py-3 font-medium text-right">Target</th>
                        <th className="px-6 py-3 font-medium text-center">Report</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(activeTab === 'consensus' && !showAllRatings
                        ? data.ratings.slice(0, 10)
                        : data.ratings
                      ).map((rating) => (
                        <tr key={rating.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                            {rating.date}
                          </td>
                          <td
                            className="px-6 py-4 cursor-pointer hover:bg-blue-50 transition-colors"
                            onClick={() => setSelectedAnalyst(rating)}
                          >
                            <div className="font-semibold text-slate-800 hover:text-blue-600 transition-colors">
                              {rating.firm}
                            </div>
                            <div className="text-xs text-slate-400">{rating.analyst || 'Analyst'}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{rating.action}</td>
                          <td className="px-6 py-4">
                            <RatingBadge rating={rating.rating} />
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-slate-700">
                            {rating.target !== '-' ? `$${rating.target}` : '-'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <a
                              href={`https://www.google.com/search?q=${encodeURIComponent(`${rating.firm} ${data.symbol} ${rating.rating} ${rating.date}`)}&tbm=nws`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink size={12} />
                              <span className="hidden sm:inline">Find</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="px-6 py-8 text-center text-slate-500">
                    <p>No recent analyst activity available for this ticker.</p>
                  </div>
                )}
              </div>

              {data.ratings.length > 10 && activeTab === 'consensus' && !showAllRatings && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center">
                  <button
                    onClick={() => setShowAllRatings(true)}
                    className="text-green-600 font-medium text-sm hover:underline"
                  >
                    View All {data.ratings.length} Analyst Ratings
                  </button>
                </div>
              )}

              {activeTab === 'consensus' && showAllRatings && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center">
                  <button
                    onClick={() => setShowAllRatings(false)}
                    className="text-green-600 font-medium text-sm hover:underline"
                  >
                    Show Less
                  </button>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="flex items-start p-4 bg-blue-50 text-blue-800 rounded-lg text-xs">
              <ShieldAlert size={16} className="mr-2 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Data Disclaimer:</strong> Analyst ratings are aggregated from third-party
                research reports. "Consensus" represents the most common rating among analysts.
                Price targets are 12-month projections. Past performance is not indicative of
                future results. Always conduct your own research before making investment decisions.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Analyst Coverage Browser Modal */}
      {showCoverageBrowser && (
        <AnalystCoverageBrowser
          onSelectStock={handleSelectResult}
          onClose={() => setShowCoverageBrowser(false)}
        />
      )}

      {/* Analyst Detail Modal */}
      {selectedAnalyst && (
        <AnalystDetailModal
          rating={selectedAnalyst}
          stockSymbol={ticker}
          onClose={() => setSelectedAnalyst(null)}
        />
      )}
    </div>
  );
}
