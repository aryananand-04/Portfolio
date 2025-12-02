'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Metric {
  date: string;
  metricType: string;
  value: number;
}

interface ChartData {
  date: string;
  timestamp: number;
  blitz_rating?: number;
  rapid_rating?: number;
  bullet_rating?: number;
  puzzle_rating?: number;
}

const CACHE_KEY = 'chess_metrics_cache';
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes cache

export default function ChessChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Check localStorage cache
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setData(cachedData);
            setLoading(false);
            return;
          }
        }

        // Fetch metrics from database API
        const response = await fetch('/api/metrics?source=chess.com&range=30');

        if (!response.ok) {
          throw new Error('Failed to fetch Chess.com metrics');
        }

        const metrics: Metric[] = await response.json();

        if (metrics.length === 0) {
          setError('No data available. Please wait for sync to complete.');
          setLoading(false);
          return;
        }

        // Transform metrics into chart data format
        const chartData = transformMetricsToChartData(metrics);

        console.log('Chess.com metrics loaded:', {
          totalMetrics: metrics.length,
          dataPoints: chartData.length,
          metricTypes: [...new Set(metrics.map(m => m.metricType))]
        });

        // Cache the data
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: chartData, timestamp: Date.now() })
        );

        setData(chartData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching chess metrics:', err);
        setError('Failed to load chess data');
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const transformMetricsToChartData = (metrics: Metric[]): ChartData[] => {
    // Group metrics by date
    const dataByDate = new Map<string, ChartData>();

    metrics.forEach((metric) => {
      const dateKey = new Date(metric.date).toISOString().split('T')[0];

      if (!dataByDate.has(dateKey)) {
        dataByDate.set(dateKey, {
          date: new Date(metric.date).toLocaleDateString(),
          timestamp: new Date(metric.date).getTime(),
        });
      }

      const dayData = dataByDate.get(dateKey)!;

      // Map metricType to the corresponding field
      if (metric.metricType === 'blitz_rating') {
        dayData.blitz_rating = metric.value;
      } else if (metric.metricType === 'rapid_rating') {
        dayData.rapid_rating = metric.value;
      } else if (metric.metricType === 'bullet_rating') {
        dayData.bullet_rating = metric.value;
      } else if (metric.metricType === 'puzzle_rating') {
        dayData.puzzle_rating = metric.value;
      }
    });

    // Convert to array and sort by timestamp
    return Array.from(dataByDate.values()).sort((a, b) => a.timestamp - b.timestamp);
  };

  if (loading) return <div className="text-center py-8">Loading chess data...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (data.length === 0) return <div className="text-center py-8 text-gray-500">No data available yet</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="timestamp"
          scale="time"
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
          formatter={(value: number, name: string) => [value, name]}
        />
        <Legend />
        <Line type="monotone" dataKey="blitz_rating" stroke="#8884d8" name="Blitz" connectNulls />
        <Line type="monotone" dataKey="rapid_rating" stroke="#82ca9d" name="Rapid" connectNulls />
        <Line type="monotone" dataKey="bullet_rating" stroke="#ffc658" name="Bullet" connectNulls />
        <Line type="monotone" dataKey="puzzle_rating" stroke="#a78bfa" name="Puzzle" connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}
