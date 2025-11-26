import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Filter, X } from 'lucide-react';

/**
 * Analyst Coverage Browser Component
 * Displays all stocks with analyst coverage in a searchable, filterable table
 */
export default function AnalystCoverageBrowser({ onSelectStock, onClose }) {
  const [coveredStocks, setCoveredStocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('symbol'); // symbol, name
  const [loading, setLoading] = useState(true);

  // Load analyst coverage database
  useEffect(() => {
    const loadCoverage = async () => {
      try {
        // Load prebuilt database
        const response = await fetch('/src/data/analyst-coverage.json');
        const coverageData = await response.json();

        // Load symbol details
        const symbolResponse = await fetch('/src/data/symbols-cache.json');
        const symbols = await symbolResponse.json();

        // Merge: coverage data + symbol details
        const stocks = Object.keys(coverageData)
          .filter(symbol => coverageData[symbol] === true)
          .map(symbol => {
            const details = symbols.find(s => s.symbol === symbol);
            return {
              symbol,
              name: details?.name || symbol,
              exchange: details?.exchange || 'N/A',
              exchangeFullName: details?.exchangeFullName || 'N/A'
            };
          })
          .sort((a, b) => a.symbol.localeCompare(b.symbol));

        setCoveredStocks(stocks);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load analyst coverage:', error);
        setLoading(false);
      }
    };

    loadCoverage();
  }, []);

  // Filter stocks
  const filteredStocks = coveredStocks.filter(stock => {
    const query = searchQuery.toLowerCase();
    return (
      stock.symbol.toLowerCase().includes(query) ||
      stock.name.toLowerCase().includes(query)
    );
  });

  // Sort stocks
  const sortedStocks = [...filteredStocks].sort((a, b) => {
    if (sortBy === 'symbol') {
      return a.symbol.localeCompare(b.symbol);
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-green-50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
              <TrendingUp className="mr-2 text-blue-600" size={24} />
              Analyst Coverage Browser
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {loading ? 'Loading...' : `${coveredStocks.length} stocks with confirmed analyst coverage`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by symbol or company name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-slate-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="symbol">Sort by Symbol</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          {searchQuery && (
            <div className="mt-2 text-sm text-slate-600">
              {filteredStocks.length === 0 ? (
                <span className="text-red-600">No stocks found matching "{searchQuery}"</span>
              ) : (
                <span>Found {filteredStocks.length} stocks matching "{searchQuery}"</span>
              )}
            </div>
          )}
        </div>

        {/* Stock List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading analyst coverage database...</p>
              </div>
            </div>
          ) : sortedStocks.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-slate-600 text-lg">No stocks found</p>
                <p className="text-slate-400 text-sm mt-2">Try a different search query</p>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-100 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Company Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Exchange
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedStocks.map((stock) => (
                  <tr
                    key={stock.symbol}
                    className="hover:bg-blue-50 transition-colors cursor-pointer"
                    onClick={() => onSelectStock(stock.symbol)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="font-semibold text-slate-900">{stock.symbol}</span>
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                          📊 Covered
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {stock.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                        {stock.exchange}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStock(stock.symbol);
                        }}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                      >
                        View Ratings
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="text-sm text-slate-600">
            <strong>{sortedStocks.length}</strong> stocks displayed
            {searchQuery && ` • Filtered from ${coveredStocks.length} total`}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
