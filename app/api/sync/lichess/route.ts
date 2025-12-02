import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface LichessPerf {
  rating: number;
  games: number;
  rd: number;
  prog: number;
  prov?: boolean;
}

interface LichessUser {
  perfs: {
    bullet?: LichessPerf;
    blitz?: LichessPerf;
    rapid?: LichessPerf;
    puzzle?: LichessPerf;
  };
}

export async function POST() {
  try {
    const username = process.env.NEXT_PUBLIC_LICHESS_USERNAME;

    if (!username) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_LICHESS_USERNAME not configured' },
        { status: 500 }
      );
    }

    // Fetch Lichess user stats with 10s timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `https://lichess.org/api/user/${username}`,
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Lichess API returned ${response.status}`);
    }

    const data: LichessUser = await response.json();

    // Extract ratings
    const blitzRating = data.perfs?.blitz?.rating;
    const rapidRating = data.perfs?.rapid?.rating;
    const bulletRating = data.perfs?.bullet?.rating;
    const puzzleRating = data.perfs?.puzzle?.rating;

    // We store one row per calendar day in the database.
    // Truncate the timestamp to the start of "today" so multiple syncs today
    // simply update the same record instead of creating new ones.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const metrics = [];

    // Cast data to JSON-compatible type for Prisma
    const jsonData = data as Prisma.InputJsonValue;

    // Store each rating as separate metric for this day
    if (blitzRating) {
      metrics.push({
        source: 'lichess',
        username,
        date: today,
        metricType: 'blitz_rating',
        value: blitzRating,
        rawData: jsonData,
      });
    }

    if (rapidRating) {
      metrics.push({
        source: 'lichess',
        username,
        date: today,
        metricType: 'rapid_rating',
        value: rapidRating,
        rawData: jsonData,
      });
    }

    if (bulletRating) {
      metrics.push({
        source: 'lichess',
        username,
        date: today,
        metricType: 'bullet_rating',
        value: bulletRating,
        rawData: jsonData,
      });
    }

    if (puzzleRating) {
      metrics.push({
        source: 'lichess',
        username,
        date: today,
        metricType: 'puzzle_rating',
        value: puzzleRating,
        rawData: jsonData,
      });
    }

    // Upsert metrics (insert or update if exists)
    for (const metric of metrics) {
      await prisma.metric.upsert({
        where: {
          source_username_metricType_date: {
            source: metric.source,
            username: metric.username,
            metricType: metric.metricType,
            date: metric.date,
          },
        },
        update: {
          value: metric.value,
          rawData: metric.rawData,
        },
        create: metric,
      });
    }

    return NextResponse.json({
      success: true,
      synced: metrics.length,
      ratings: {
        blitz: blitzRating,
        rapid: rapidRating,
        bullet: bulletRating,
        puzzle: puzzleRating,
      },
    });

  } catch (error: any) {
    // Log failure to database
    await prisma.failedSync.create({
      data: {
        source: 'lichess',
        errorMessage: error.message || 'Unknown error',
        errorData: {
          error: error.toString(),
          stack: error.stack,
        },
      },
    });

    return NextResponse.json(
      { error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}
