/**
 * One-time script to import historic chess rating data into the database.
 *
 * Usage:
 *   npx tsx scripts/import-historic-chess-data.ts
 *
 * This script helps you backfill historic chess rating data if you have it
 * from external sources (CSV, JSON, manual records, etc.).
 *
 * Modify the `historicData` array below with your actual historic ratings.
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Example historic data structure - replace with your actual data
const historicData: Array<{ date: string; blitz?: number; rapid?: number; bullet?: number }> = [
  // Format: { date: 'YYYY-MM-DD', blitz: number, rapid: number, bullet: number }
  // Example:
  // { date: '2024-11-01', blitz: 1200, rapid: 1300, bullet: 1100 },
  // { date: '2024-11-02', blitz: 1205, rapid: 1305, bullet: 1105 },
  // ... add more dates as needed
];

async function importHistoricData() {
  const username = process.env.CHESS_USERNAME;

  if (!username) {
    console.error('Error: CHESS_USERNAME environment variable not set');
    process.exit(1);
  }

  console.log(`Importing historic chess data for user: ${username}`);

  let imported = 0;
  let skipped = 0;

  for (const record of historicData) {
    const date = new Date(record.date);
    date.setHours(0, 0, 0, 0);

    // Import blitz rating
    if (record.blitz) {
      await prisma.metric.upsert({
        where: {
          source_username_metricType_date: {
            source: 'chess.com',
            username,
            metricType: 'blitz_rating',
            date,
          },
        },
        update: {
          value: record.blitz,
        },
        create: {
          source: 'chess.com',
          username,
          date,
          metricType: 'blitz_rating',
          value: record.blitz,
          rawData: { imported: true } as Prisma.InputJsonValue,
        },
      });
      imported++;
    }

    // Import rapid rating
    if (record.rapid) {
      await prisma.metric.upsert({
        where: {
          source_username_metricType_date: {
            source: 'chess.com',
            username,
            metricType: 'rapid_rating',
            date,
          },
        },
        update: {
          value: record.rapid,
        },
        create: {
          source: 'chess.com',
          username,
          date,
          metricType: 'rapid_rating',
          value: record.rapid,
          rawData: { imported: true } as Prisma.InputJsonValue,
        },
      });
      imported++;
    }

    // Import bullet rating
    if (record.bullet) {
      await prisma.metric.upsert({
        where: {
          source_username_metricType_date: {
            source: 'chess.com',
            username,
            metricType: 'bullet_rating',
            date,
          },
        },
        update: {
          value: record.bullet,
        },
        create: {
          source: 'chess.com',
          username,
          date,
          metricType: 'bullet_rating',
          value: record.bullet,
          rawData: { imported: true } as Prisma.InputJsonValue,
        },
      });
      imported++;
    }

    console.log(`✓ Imported data for ${record.date}`);
  }

  console.log(`\nImport complete!`);
  console.log(`- Records imported/updated: ${imported}`);
  console.log(`- Records skipped: ${skipped}`);

  await prisma.$disconnect();
}

// Run the import
importHistoricData()
  .catch((error) => {
    console.error('Error importing data:', error);
    process.exit(1);
  });
