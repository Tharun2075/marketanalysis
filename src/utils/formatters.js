/**
 * Utility Functions for Formatting and Calculations
 */

/**
 * Format number as currency
 * @param {number} value - Number to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format percentage value
 * @param {number} value - Percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2) => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

/**
 * Format date string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

/**
 * Get rating badge color classes
 * @param {string} rating - Rating label
 * @returns {string} Tailwind CSS classes
 */
export const getRatingStyle = (rating) => {
  const styles = {
    'Strong Buy': 'bg-green-600 text-white',
    'Buy': 'bg-green-100 text-green-800 border-green-200 border',
    'Hold': 'bg-yellow-100 text-yellow-800 border-yellow-200 border',
    'Sell': 'bg-red-100 text-red-800 border-red-200 border',
    'Strong Sell': 'bg-red-600 text-white',
    'Overweight': 'bg-green-100 text-green-800 border-green-200 border',
    'Outperform': 'bg-green-100 text-green-800 border-green-200 border',
    'Neutral': 'bg-gray-100 text-gray-800 border-gray-200 border',
    'Equal-Weight': 'bg-gray-100 text-gray-800 border-gray-200 border',
    'Underweight': 'bg-red-100 text-red-800 border-red-200 border',
  };
  return styles[rating] || 'bg-gray-100 text-gray-600';
};

/**
 * Calculate upside potential
 * @param {number} current - Current price
 * @param {number} target - Target price
 * @returns {number} Upside percentage
 */
export const calculateUpside = (current, target) => {
  if (current === 0) return 0;
  return ((target - current) / current) * 100;
};

/**
 * Safely parse number
 * @param {any} value - Value to parse
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number} Parsed number
 */
export const safeNumber = (value, defaultValue = 0) => {
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
};
