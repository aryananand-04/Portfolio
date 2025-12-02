import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tech = searchParams.get('tech');

    // Build query
    const where: any = {};
    if (tech) {
      where.topics = {
        has: tech,
      };
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        description: true,
        githubUrl: true,
        homepageUrl: true,
        stars: true,
        forks: true,
        language: true,
        topics: true,
        isFeatured: true,
        lastUpdated: true,
        createdAt: true,
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
