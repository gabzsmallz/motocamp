import { Star, Users } from 'lucide-react';

/**
 * Displays the community average rating for a campsite.
 * communityData: { average: 4.2, count: 7 } | undefined
 */
export default function CommunityRating({ communityData, size = 'sm' }) {
  if (!communityData || communityData.count === 0) {
    return (
      <span className="flex items-center gap-1 text-gray-600 text-xs">
        <Star size={12} />
        <span>No ratings yet</span>
      </span>
    );
  }

  const { average, count } = communityData;
  const filled = Math.round(average);

  if (size === 'lg') {
    return (
      <div className="flex items-center gap-3">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map(s => (
            <Star
              key={s}
              size={20}
              className={s <= filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
            />
          ))}
        </div>
        <div>
          <span className="text-yellow-300 font-bold text-lg">{average.toFixed(1)}</span>
          <span className="text-gray-500 text-xs ml-1.5">
            <Users size={11} className="inline mr-0.5" />
            {count} {count === 1 ? 'rating' : 'ratings'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <span className="flex items-center gap-1 text-xs text-gray-400">
      <Star size={11} className="text-yellow-500 fill-yellow-500" />
      <span className="text-yellow-400 font-medium">{average.toFixed(1)}</span>
      <span className="text-gray-600">({count})</span>
    </span>
  );
}
