/**
 * Script to backfill 30 days of chess rating history from Chess.com game archives
 *
 * Usage:
 *   npx tsx scripts/backfill-chess-history.ts
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface ChessGame {
  end_time: number;
  white: { rating: number; username: string };
  black: { rating: number; username: string };
  time_class: string;
}

interface ChessArchive {
  games: ChessGame[];
}

async function backfillChessHistory() {
  const username = process.env.CHESS_USERNAME;

  if (!username) {
    console.error('Error: CHESS_USERNAME environment variable not set');
    process.exit(1);
  }

  console.log(`Backfilling chess history for user: ${username}`);

  // Get last 30 days
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 29);
  startDate.setHours(0, 0, 0, 0);

  console.log(`Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

  // Fetch archives for the last 2 months to ensure we have all data
  const currentMonth = new Date();
  const previousMonth = new Date();
  previousMonth.setMonth(previousMonth.getMonth() - 1);

  const monthsToFetch = [
    { year: currentMonth.getFullYear(), month: currentMonth.getMonth() + 1 },
    { year: previousMonth.getFullYear(), month: previousMonth.getMonth() + 1 },
  ];

  const allGames: ChessGame[] = [];

  for (const { year, month } of monthsToFetch) {
    const paddedMonth = String(month).padStart(2, '0');
    const url = `https://api.chess.com/pub/player/${username}/games/${year}/${paddedMonth}`;

    console.log(`Fetching games from ${year}-${paddedMonth}...`);

    try {
      const response = await fetch(url);

      if (response.ok) {
        const data: ChessArchive = await response.json();
        if (data.games) {
          allGames.push(...data.games);
          console.log(`  Found ${data.games.length} games`);
        }
      } else {
        console.log(`  No games found for ${year}-${paddedMonth}`);
      }
    } catch (error) {
      console.error(`  Error fetching ${year}-${paddedMonth}:`, error);
    }
  }

  console.log(`\nTotal games fetched: ${allGames.length}`);

  // Process games and extract daily ratings
  const ratingsByDay = new Map<string, { blitz?: number; rapid?: number; bullet?: number }>();

  // Sort games by end time
  allGames.sort((a, b) => a.end_time - b.end_time);

  allGames.forEach((game) => {
    const gameDate = new Date(game.end_time * 1000);

    // Only include games in our date range
    if (gameDate < startDate || gameDate > endDate) return;

    const dateKey = gameDate.toISOString().split('T')[0];

    // Determine the player's rating after this game
    const isWhite = game.white.username.toLowerCase() === username.toLowerCase();
    const playerRating = isWhite ? game.white.rating : game.black.rating;

    // Map time_class to our rating types
    const timeClass = game.time_class;

    if (!ratingsByDay.has(dateKey)) {
      ratingsByDay.set(dateKey, {});
    }

    const dayRatings = ratingsByDay.get(dateKey)!;

    if (timeClass === 'blitz') {
      dayRatings.blitz = playerRating;
    } else if (timeClass === 'rapid') {
      dayRatings.rapid = playerRating;
    } else if (timeClass === 'bullet') {
      dayRatings.bullet = playerRating;
    }
  });

  console.log(`\nProcessed ${ratingsByDay.size} days with rating data`);

  // Fetch current puzzle rating
  let puzzleRating: number | undefined;
  try {
    const statsResponse = await fetch(`https://api.chess.com/pub/player/${username}/stats`);
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      puzzleRating = statsData.tactics?.highest?.rating;
      console.log(`Current puzzle rating: ${puzzleRating || 'N/A'}`);
    }
  } catch (err) {
    console.log('Could not fetch puzzle rating');
  }

  // Insert data into database
  let imported = 0;

  for (const [dateKey, ratings] of ratingsByDay.entries()) {
    const date = new Date(dateKey);
    date.setHours(0, 0, 0, 0);

    // Import blitz rating
    if (ratings.blitz) {
      await prisma.metric.upsert({
        where: {
          source_username_metricType_date: {
            source: 'chess.com',
            username,
            metricType: 'blitz_rating',
            date,
          },
        },
        update: { value: ratings.blitz },
        create: {
          source: 'chess.com',
          username,
          date,
          metricType: 'blitz_rating',
          value: ratings.blitz,
          rawData: { backfilled: true } as Prisma.InputJsonValue,
        },
      });
      imported++;
    }

    // Import rapid rating
    if (ratings.rapid) {
      await prisma.metric.upsert({
        where: {
          source_username_metricType_date: {
            source: 'chess.com',
            username,
            metricType: 'rapid_rating',
            date,
          },
        },
        update: { value: ratings.rapid },
        create: {
          source: 'chess.com',
          username,
          date,
          metricType: 'rapid_rating',
          value: ratings.rapid,
          rawData: { backfilled: true } as Prisma.InputJsonValue,
        },
      });
      imported++;
    }

    // Import bullet rating
    if (ratings.bullet) {
      await prisma.metric.upsert({
        where: {
          source_username_metricType_date: {
            source: 'chess.com',
            username,
            metricType: 'bullet_rating',
            date,
          },
        },
        update: { value: ratings.bullet },
        create: {
          source: 'chess.com',
          username,
          date,
          metricType: 'bullet_rating',
          value: ratings.bullet,
          rawData: { backfilled: true } as Prisma.InputJsonValue,
        },
      });
      imported++;
    }

    console.log(`✓ Imported ${dateKey}: blitz=${ratings.blitz || 'N/A'}, rapid=${ratings.rapid || 'N/A'}, bullet=${ratings.bullet || 'N/A'}`);
  }

  // Add puzzle rating for today only (we don't have historic puzzle data)
  if (puzzleRating) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.metric.upsert({
      where: {
        source_username_metricType_date: {
          source: 'chess.com',
          username,
          metricType: 'puzzle_rating',
          date: today,
        },
      },
      update: { value: puzzleRating },
      create: {
        source: 'chess.com',
        username,
        date: today,
        metricType: 'puzzle_rating',
        value: puzzleRating,
        rawData: { backfilled: true } as Prisma.InputJsonValue,
      },
    });
    imported++;
    console.log(`✓ Added puzzle rating for today: ${puzzleRating}`);
  }

  console.log(`\n✅ Backfill complete!`);
  console.log(`   Total metrics imported/updated: ${imported}`);

  await prisma.$disconnect();
}

// Run the backfill
backfillChessHistory()
  .catch((error) => {
    console.error('Error backfilling data:', error);
    prisma.$disconnect();
    process.exit(1);
  });
