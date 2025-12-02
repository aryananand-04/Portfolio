/**
 * Script to backfill ALL ratings (not just games played) for the past 30 days
 * This ensures all 4 time controls show as lines on the chart
 *
 * Usage:
 *   npx tsx scripts/backfill-all-ratings.ts
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillAllRatings() {
  console.log('Backfilling all ratings for past 30 days...\n');

  // Get last 30 days
  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 29);
  startDate.setHours(0, 0, 0, 0);

  console.log(`Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}\n`);

  // ===== CHESS.COM =====
  const chessUsername = process.env.CHESS_USERNAME;
  if (chessUsername) {
    console.log('Fetching Chess.com current ratings...');

    try {
      const response = await fetch(`https://api.chess.com/pub/player/${chessUsername}/stats`);
      if (response.ok) {
        const data = await response.json();

        const currentRatings = {
          blitz: data.chess_blitz?.last?.rating,
          bullet: data.chess_bullet?.last?.rating,
          rapid: data.chess_rapid?.last?.rating,
          puzzle: data.tactics?.highest?.rating,
        };

        console.log('Current Chess.com ratings:', currentRatings);
        console.log('\nBackfilling Chess.com ratings for 30 days...');

        let chessCount = 0;
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
          const date = new Date(currentDate);
          date.setHours(0, 0, 0, 0);

          // Add all 4 ratings for this day
          for (const [type, rating] of Object.entries(currentRatings)) {
            if (rating) {
              await prisma.metric.upsert({
                where: {
                  source_username_metricType_date: {
                    source: 'chess.com',
                    username: chessUsername,
                    metricType: `${type}_rating`,
                    date,
                  },
                },
                update: {
                  value: rating,
                },
                create: {
                  source: 'chess.com',
                  username: chessUsername,
                  date,
                  metricType: `${type}_rating`,
                  value: rating,
                  rawData: { backfilled: true, constant: true } as Prisma.InputJsonValue,
                },
              });
              chessCount++;
            }
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }

        console.log(`✅ Chess.com: Added ${chessCount} metrics (${chessCount / 30} ratings × 30 days)`);
      }
    } catch (error) {
      console.error('Error fetching Chess.com data:', error);
    }
  }

  console.log('\n');

  // ===== LICHESS =====
  const lichessUsername = process.env.NEXT_PUBLIC_LICHESS_USERNAME;
  if (lichessUsername) {
    console.log('Fetching Lichess current ratings...');

    try {
      const response = await fetch(`https://lichess.org/api/user/${lichessUsername}`);
      if (response.ok) {
        const data = await response.json();

        const currentRatings = {
          blitz: data.perfs?.blitz?.rating,
          bullet: data.perfs?.bullet?.rating,
          rapid: data.perfs?.rapid?.rating,
          puzzle: data.perfs?.puzzle?.rating,
        };

        console.log('Current Lichess ratings:', currentRatings);
        console.log('\nBackfilling Lichess ratings for 30 days...');

        let lichessCount = 0;
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
          const date = new Date(currentDate);
          date.setHours(0, 0, 0, 0);

          // Add all 4 ratings for this day
          for (const [type, rating] of Object.entries(currentRatings)) {
            if (rating) {
              await prisma.metric.upsert({
                where: {
                  source_username_metricType_date: {
                    source: 'lichess',
                    username: lichessUsername,
                    metricType: `${type}_rating`,
                    date,
                  },
                },
                update: {
                  value: rating,
                },
                create: {
                  source: 'lichess',
                  username: lichessUsername,
                  date,
                  metricType: `${type}_rating`,
                  value: rating,
                  rawData: { backfilled: true, constant: true } as Prisma.InputJsonValue,
                },
              });
              lichessCount++;
            }
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }

        console.log(`✅ Lichess: Added ${lichessCount} metrics (${lichessCount / 30} ratings × 30 days)`);
      }
    } catch (error) {
      console.error('Error fetching Lichess data:', error);
    }
  }

  console.log('\n✅ All ratings backfilled for 30 days!');
  console.log('Note: These are constant values. Run backfill-chess-history.ts to get actual game-based ratings.');

  await prisma.$disconnect();
}

// Run the backfill
backfillAllRatings()
  .catch((error) => {
    console.error('Error backfilling data:', error);
    prisma.$disconnect();
    process.exit(1);
  });
