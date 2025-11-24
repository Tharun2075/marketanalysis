import React from 'react';
import { Search, User, BarChart2 } from 'lucide-react';
import APIUsageIndicator from './APIUsageIndicator';

/**
 * Navigation Component
 * Top navigation bar with search and branding
 */
const Navigation = ({ searchQuery, onSearchChange, onSearchSubmit }) => {
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
              <form onSubmit={onSearchSubmit} className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search Ticker (e.g. AAPL, TSLA)"
                  className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-green-500 outline-none w-64 transition-all"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
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
        <form onSubmit={onSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search (AAPL, TSLA, GOOGL...)"
            className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm w-full outline-none"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
        </form>
      </div>
    </>
  );
};

export default Navigation;
