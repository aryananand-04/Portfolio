'use client';

import { useEffect, useState } from 'react';

interface Rating {
  name: string;
  value: number | null;
  provisional?: boolean;
}

interface RatingCardsProps {
  platform: 'chess.com' | 'lichess';
}

export default function RatingCards({ platform }: RatingCardsProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        if (platform === 'chess.com') {
          const username = process.env.NEXT_PUBLIC_CHESS_USERNAME || 'younglord9104';
          const response = await fetch(`https://api.chess.com/pub/player/${username}/stats`);

          if (!response.ok) throw new Error('Failed to fetch Chess.com stats');

          const data = await response.json();

          setRatings([
            { name: 'Blitz', value: data.chess_blitz?.last?.rating || null },
            { name: 'Bullet', value: data.chess_bullet?.last?.rating || null },
            { name: 'Rapid', value: data.chess_rapid?.last?.rating || null },
            { name: 'Puzzle', value: data.tactics?.highest?.rating || null },
          ]);
        } else {
          const username = process.env.NEXT_PUBLIC_LICHESS_USERNAME || 'Aryananand09';
          const response = await fetch(`https://lichess.org/api/user/${username}`);

          if (!response.ok) throw new Error('Failed to fetch Lichess stats');

          const data = await response.json();

          setRatings([
            { name: 'Blitz', value: data.perfs?.blitz?.rating || null, provisional: data.perfs?.blitz?.prov },
            { name: 'Bullet', value: data.perfs?.bullet?.rating || null, provisional: data.perfs?.bullet?.prov },
            { name: 'Rapid', value: data.perfs?.rapid?.rating || null, provisional: data.perfs?.rapid?.prov },
            { name: 'Puzzle', value: data.perfs?.puzzle?.rating || null, provisional: data.perfs?.puzzle?.prov },
          ]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching ratings:', err);
        setError('Failed to load ratings');
        setLoading(false);
      }
    };

    fetchRatings();
  }, [platform]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-2"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {ratings.map((rating) => (
        <div
          key={rating.name}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
        >
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
            {rating.name}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {rating.value || 'N/A'}
            {rating.provisional && (
              <span className="text-xs text-yellow-600 dark:text-yellow-400 ml-1">?</span>
            )}
          </div>
          {rating.provisional && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Provisional
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
