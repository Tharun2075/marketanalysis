import React, { useState, useEffect, useRef } from 'react';
import { Search, User, BarChart2 } from 'lucide-react';
import APIUsageIndicator from './APIUsageIndicator';
import { searchTickers } from '../services/api';

/**
 * Category badge colors
 */
const getCategoryColor = (category) => {
  const colors = {
    'Stock': 'bg-blue-100 text-blue-700',
    'ETF': 'bg-purple-100 text-purple-700',
    'Index': 'bg-amber-100 text-amber-700',
    'Crypto': 'bg-orange-100 text-orange-700',
    'LSE': 'bg-red-100 text-red-700',
    'HKSE': 'bg-pink-100 text-pink-700',
    'NSE': 'bg-green-100 text-green-700',
    'BSE': 'bg-teal-100 text-teal-700',
    'TSX': 'bg-indigo-100 text-indigo-700',
    'OTC': 'bg-gray-100 text-gray-700'
  };
  return colors[category] || 'bg-slate-100 text-slate-700';
};

/**
 * Search Autocomplete Component
 */
const SearchAutocomplete = ({ searchQuery, onSearchChange, onSearchSubmit, onSelectResult }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length > 0) {
        const results = await searchTickers(searchQuery, 5);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        onSelectResult(suggestions[selectedIndex].symbol);
        setShowSuggestions(false);
      } else {
        onSearchSubmit(e);
        setShowSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <input
        type="text"
        placeholder="Search Ticker (e.g. AAPL, TSLA)"
        className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-green-500 outline-none w-64 transition-all"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
      />
      <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />

      {/* Autocomplete Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {suggestions.map((result, index) => (
            <button
              key={result.symbol}
              className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-slate-50' : ''
              }`}
              onClick={() => {
                onSelectResult(result.symbol);
                setShowSuggestions(false);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900">{result.symbol}</div>
                  <div className="text-xs text-slate-500 truncate">{result.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{result.exchangeFullName}</div>
                </div>
                <div className="flex flex-wrap gap-1 ml-2 items-start">
                  {result.categories.map((cat) => (
                    <span
                      key={cat}
                      className={`text-xs px-1.5 py-0.5 rounded ${getCategoryColor(cat)}`}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Navigation Component
 * Top navigation bar with search and branding
 */
const Navigation = ({ searchQuery, onSearchChange, onSearchSubmit }) => {
  const handleSelectResult = (symbol) => {
    onSearchChange(symbol);
    // Trigger a fake form submit event
    onSearchSubmit({ preventDefault: () => {}, target: { elements: {} } });
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded bg-green-600 text-white font-bold text-xl mr-2">
                <BarChart2 size={18} />
              </div>
              <span className="font-bold text-xl tracking-tight">
                Market<span className="text-green-600">Sight</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <form onSubmit={onSearchSubmit} className="hidden md:block">
                <SearchAutocomplete
                  searchQuery={searchQuery}
                  onSearchChange={onSearchChange}
                  onSearchSubmit={onSearchSubmit}
                  onSelectResult={handleSelectResult}
                />
              </form>
              <APIUsageIndicator />
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                <User size={18} />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 py-3 bg-white border-b border-slate-200">
        <form onSubmit={onSearchSubmit}>
          <SearchAutocomplete
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onSearchSubmit={onSearchSubmit}
            onSelectResult={handleSelectResult}
          />
        </form>
      </div>
    </>
  );
};

export default Navigation;
