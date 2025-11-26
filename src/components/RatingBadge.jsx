import React from 'react';
import { getRatingStyle } from '../utils/formatters';

/**
 * RatingBadge Component
 * Displays analyst rating with color-coded styling
 */
const RatingBadge = ({ rating, large = false }) => {
  const sizeClasses = large
    ? 'px-4 py-2 text-lg'
    : 'px-2 py-1 text-xs';

  return (
    <span className={`rounded-full font-semibold ${sizeClasses} ${getRatingStyle(rating)}`}>
      {rating}
    </span>
  );
};

export default RatingBadge;
