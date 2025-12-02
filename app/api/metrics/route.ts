import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Metric {
  date: Date;
  metricType: string;
  value: number;
}

/**
 * Forward-fills missing days in the metrics data.
 * For each day in [startDate, endDate], if no data exists, use the last known value.
 */
function fillMissingDays(metrics: Metric[], startDate: Date, endDate: Date): Metric[] {
  const result: Metric[] = [];

  // Group metrics by metricType for easier lookup
  const metricsByType = new Map<string, Map<string, number>>();

  metrics.forEach((metric) => {
    const dateKey = new Date(metric.date).toISOString().split('T')[0];
    if (!metricsByType.has(metric.metricType)) {
      metricsByType.set(metric.metricType, new Map());
    }
    metricsByType.get(metric.metricType)!.set(dateKey, metric.value);
  });

  // Get all unique metric types
  const metricTypes = Array.from(metricsByType.keys());

  // Generate all dates in range
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const dateForRecord = new Date(currentDate);

    // For each metric type, either use the actual value or forward-fill
    metricTypes.forEach((metricType) => {
      const typeData = metricsByType.get(metricType)!;
      let value: number | null = null;

      if (typeData.has(dateKey)) {
        // We have data for this day
        value = typeData.get(dateKey)!;
      } else {
        // Forward-fill: find the last known value before this date
        const pastDate = new Date(currentDate);
        pastDate.setDate(pastDate.getDate() - 1);

        while (pastDate >= startDate && value === null) {
          const pastDateKey = pastDate.toISOString().split('T')[0];
          if (typeData.has(pastDateKey)) {
            value = typeData.get(pastDateKey)!;
            break;
          }
          pastDate.setDate(pastDate.getDate() - 1);
        }
      }

      // Only add if we have a value (either actual or forward-filled)
      if (value !== null) {
        result.push({
          date: dateForRecord,
          metricType: metricType,
          value: value,
        });
      }
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source');
  const range = parseInt(searchParams.get('range') || '30');

  if (!source) {
    return NextResponse.json(
      { error: 'source parameter is required' },
      { status: 400 }
    );
  }

  try {
    // We want an inclusive window of `range` days that ends today.
    // Example: range = 30 ⇒ [today - 29 days, today].
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const startDate = new Date(endOfToday);
    startDate.setDate(startDate.getDate() - (range - 1));
    startDate.setHours(0, 0, 0, 0);

    const metrics = await prisma.metric.findMany({
      where: {
        source: source,
        date: {
          gte: startDate,
          lte: endOfToday,
        },
      },
      orderBy: {
        date: 'asc',
      },
      select: {
        date: true,
        metricType: true,
        value: true,
      },
    });

    // Forward-fill missing days: generate all 30 days and fill gaps
    const filledMetrics = fillMissingDays(metrics, startDate, endOfToday);

    return NextResponse.json(filledMetrics);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
