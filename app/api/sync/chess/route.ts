import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ChessComStats {
  chess_blitz?: { last?: { rating: number } };
  chess_rapid?: { last?: { rating: number } };
  chess_bullet?: { last?: { rating: number } };
}

export async function POST() {
  try {
    const username = process.env.CHESS_USERNAME;

    if (!username) {
      return NextResponse.json(
        { error: 'CHESS_USERNAME not configured' },
        { status: 500 }
      );
    }

    // Fetch Chess.com stats with 10s timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `https://api.chess.com/pub/player/${username}/stats`,
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Chess.com API returned ${response.status}`);
    }

    const data: ChessComStats = await response.json();

    // Extract ratings
    const blitzRating = data.chess_blitz?.last?.rating;
    const rapidRating = data.chess_rapid?.last?.rating;
    const bulletRating = data.chess_bullet?.last?.rating;

    const now = new Date();
    const metrics = [];

    // Store each rating as separate metric
    if (blitzRating) {
      metrics.push({
        source: 'chess.com',
        username,
        date: now,
        metricType: 'blitz_rating',
        value: blitzRating,
        rawData: data,
      });
    }

    if (rapidRating) {
      metrics.push({
        source: 'chess.com',
        username,
        date: now,
        metricType: 'rapid_rating',
        value: rapidRating,
        rawData: data,
      });
    }

    if (bulletRating) {
      metrics.push({
        source: 'chess.com',
        username,
        date: now,
        metricType: 'bullet_rating',
        value: bulletRating,
        rawData: data,
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
          rawData: metric.rawData as any,
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
      },
    });

  } catch (error: any) {
    // Log failure to database
    await prisma.failedSync.create({
      data: {
        source: 'chess.com',
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
