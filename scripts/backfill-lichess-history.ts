/**
 * Script to backfill 30 days of Lichess rating history
 *
 * Usage:
 *   npx tsx scripts/backfill-lichess-history.ts
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface LichessRatingHistory {
  name: string;
  points: Array<[number, number, number, number]>; // [year, month, day, rating]
}

async function backfillLichessHistory() {
  const username = process.env.NEXT_PUBLIC_LICHESS_USERNAME;

  if (!username) {
    console.error('Error: NEXT_PUBLIC_LICHESS_USERNAME environment variable not set');
    process.exit(1);
  }

  console.log(`Backfilling Lichess history for user: ${username}`);

  // Get last 30 days
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 29);
  startDate.setHours(0, 0, 0, 0);

  console.log(`Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

  // Fetch rating history from Lichess API
  console.log(`Fetching rating history from Lichess...`);

  try {
    const response = await fetch(`https://lichess.org/api/user/${username}/rating-history`);

    if (!response.ok) {
      throw new Error('Failed to fetch Lichess rating history');
    }

    const ratingHistory: LichessRatingHistory[] = await response.json();

    console.log(`Found ${ratingHistory.length} rating categories`);

    // Process rating history
    const ratingsByDay = new Map<string, { bullet?: number; blitz?: number; rapid?: number; puzzle?: number }>();

    ratingHistory.forEach((category) => {
      const timeControl = category.name.toLowerCase();
      console.log(`Processing ${timeControl}: ${category.points.length} data points`);

      category.points.forEach((point) => {
        const [year, month, day, rating] = point;
        const pointDate = new Date(year, month, day);

        // Only include points in our date range
        if (pointDate < startDate || pointDate > endDate) return;

        const dateKey = pointDate.toISOString().split('T')[0];

        if (!ratingsByDay.has(dateKey)) {
          ratingsByDay.set(dateKey, {});
        }

        const dayRatings = ratingsByDay.get(dateKey)!;

        // Map Lichess time control names to our keys
        if (timeControl === 'bullet') {
          dayRatings.bullet = rating;
        } else if (timeControl === 'blitz') {
          dayRatings.blitz = rating;
        } else if (timeControl === 'rapid') {
          dayRatings.rapid = rating;
        } else if (timeControl === 'puzzle' || timeControl === 'puzzles') {
          dayRatings.puzzle = rating;
        }
      });
    });

    console.log(`\nProcessed ${ratingsByDay.size} days with rating data`);

    // Insert data into database
    let imported = 0;

    for (const [dateKey, ratings] of ratingsByDay.entries()) {
      const date = new Date(dateKey);
      date.setHours(0, 0, 0, 0);

      // Import bullet rating
      if (ratings.bullet) {
        await prisma.metric.upsert({
          where: {
            source_username_metricType_date: {
              source: 'lichess',
              username,
              metricType: 'bullet_rating',
              date,
            },
          },
          update: { value: ratings.bullet },
          create: {
            source: 'lichess',
            username,
            date,
            metricType: 'bullet_rating',
            value: ratings.bullet,
            rawData: { backfilled: true } as Prisma.InputJsonValue,
          },
        });
        imported++;
      }

      // Import blitz rating
      if (ratings.blitz) {
        await prisma.metric.upsert({
          where: {
            source_username_metricType_date: {
              source: 'lichess',
              username,
              metricType: 'blitz_rating',
              date,
            },
          },
          update: { value: ratings.blitz },
          create: {
            source: 'lichess',
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
              source: 'lichess',
              username,
              metricType: 'rapid_rating',
              date,
            },
          },
          update: { value: ratings.rapid },
          create: {
            source: 'lichess',
            username,
            date,
            metricType: 'rapid_rating',
            value: ratings.rapid,
            rawData: { backfilled: true } as Prisma.InputJsonValue,
          },
        });
        imported++;
      }

      // Import puzzle rating
      if (ratings.puzzle) {
        await prisma.metric.upsert({
          where: {
            source_username_metricType_date: {
              source: 'lichess',
              username,
              metricType: 'puzzle_rating',
              date,
            },
          },
          update: { value: ratings.puzzle },
          create: {
            source: 'lichess',
            username,
            date,
            metricType: 'puzzle_rating',
            value: ratings.puzzle,
            rawData: { backfilled: true } as Prisma.InputJsonValue,
          },
        });
        imported++;
      }

      console.log(`✓ Imported ${dateKey}: bullet=${ratings.bullet || 'N/A'}, blitz=${ratings.blitz || 'N/A'}, rapid=${ratings.rapid || 'N/A'}, puzzle=${ratings.puzzle || 'N/A'}`);
    }

    console.log(`\n✅ Backfill complete!`);
    console.log(`   Total metrics imported/updated: ${imported}`);

  } catch (error) {
    console.error('Error fetching or processing Lichess data:', error);
    throw error;
  }

  await prisma.$disconnect();
}

// Run the backfill
backfillLichessHistory()
  .catch((error) => {
    console.error('Error backfilling data:', error);
    prisma.$disconnect();
    process.exit(1);
  });
