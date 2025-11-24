import React from 'react';
import { getRatingStyle } from '../utils/formatters';

/**
 * RatingBadge Component
 * Displays analyst rating with color-coded styling
 */
const RatingBadge = ({ rating }) => {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRatingStyle(rating)}`}>
      {rating}
    </span>
  );
};

export default RatingBadge;
