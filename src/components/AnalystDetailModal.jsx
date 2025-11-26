import React from 'react';
import { X, Building2, User, Calendar, TrendingUp, Target, ArrowUpCircle, ArrowDownCircle, ExternalLink, Search, FileText } from 'lucide-react';
import RatingBadge from './RatingBadge';

/**
 * Analyst Detail Modal Component
 * Shows detailed information for a specific analyst's rating
 */
export default function AnalystDetailModal({ rating, onClose, stockSymbol }) {
  if (!rating) return null;

  // Determine action icon and color
  const getActionDetails = (action) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('upgrade') || actionLower.includes('up')) {
      return {
        icon: ArrowUpCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else if (actionLower.includes('downgrade') || actionLower.includes('down')) {
      return {
        icon: ArrowDownCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    } else {
      return {
        icon: TrendingUp,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    }
  };

  const actionDetails = getActionDetails(rating.action);
  const ActionIcon = actionDetails.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-start bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <Building2 className="mr-2 text-blue-600" size={24} />
                {rating.firm}
              </h2>
            </div>
            <p className="text-sm text-slate-600 flex items-center">
              <User size={14} className="mr-1" />
              Analyst: <span className="font-semibold ml-1">{rating.analyst}</span>
            </p>
            <p className="text-xs text-slate-500 flex items-center mt-1">
              <Calendar size={12} className="mr-1" />
              {rating.date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors ml-4"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Stock Being Analyzed */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Stock Analyzed</div>
            <div className="text-xl font-bold text-slate-900">{stockSymbol}</div>
          </div>

          {/* Action */}
          <div className={`rounded-lg p-4 border ${actionDetails.borderColor} ${actionDetails.bgColor}`}>
            <div className="flex items-center mb-2">
              <ActionIcon className={`mr-2 ${actionDetails.color}`} size={20} />
              <div className="text-xs text-slate-500 uppercase tracking-wide">Action</div>
            </div>
            <div className={`text-lg font-bold ${actionDetails.color}`}>{rating.action}</div>
          </div>

          {/* Rating & Target Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Current Rating */}
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-3">Current Rating</div>
              <RatingBadge rating={rating.rating} large />
            </div>

            {/* Price Target */}
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="flex items-center mb-3">
                <Target size={14} className="mr-1 text-slate-500" />
                <div className="text-xs text-slate-500 uppercase tracking-wide">Price Target</div>
              </div>
              {rating.target !== '-' ? (
                <div className="text-3xl font-bold text-green-600">
                  ${rating.target}
                </div>
              ) : (
                <div className="text-lg text-slate-400 font-semibold">Not Disclosed</div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-slate-900 mb-3 text-sm">About This Rating</h3>
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex">
                <span className="font-medium w-32">Analyst Firm:</span>
                <span>{rating.firm}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-32">Analyst Name:</span>
                <span>{rating.analyst}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-32">Date Issued:</span>
                <span>{rating.date}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-32">Action Type:</span>
                <span>{rating.action}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-32">Rating:</span>
                <span className="font-semibold">{rating.rating}</span>
              </div>
              {rating.target !== '-' && (
                <div className="flex">
                  <span className="font-medium w-32">Price Target:</span>
                  <span className="font-semibold text-green-600">${rating.target}</span>
                </div>
              )}
            </div>
          </div>

          {/* Find Original Report */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center mb-3">
              <FileText size={16} className="mr-2 text-blue-600" />
              <h3 className="font-semibold text-slate-900 text-sm">Find Original Report</h3>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Search for the full analyst report or news coverage:
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(`${rating.firm} ${stockSymbol} ${rating.rating} analyst report ${rating.date}`)}&tbm=nws`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors"
              >
                <Search size={12} />
                Google News
                <ExternalLink size={10} />
              </a>
              <a
                href={`https://seekingalpha.com/symbol/${stockSymbol}/ratings/quant-ratings`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors"
              >
                Seeking Alpha
                <ExternalLink size={10} />
              </a>
              <a
                href={`https://www.tipranks.com/stocks/${stockSymbol.toLowerCase()}/forecast`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors"
              >
                TipRanks
                <ExternalLink size={10} />
              </a>
              <a
                href={`https://finance.yahoo.com/quote/${stockSymbol}/analysis`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors"
              >
                Yahoo Finance
                <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* Data Source Info */}
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <p className="text-xs text-amber-800">
              <strong>Note:</strong> This data is provided by Financial Modeling Prep API. The information
              shown represents the analyst's opinion as of the date listed. Price targets are typically
              12-month forward projections. Always conduct your own research before making investment decisions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
