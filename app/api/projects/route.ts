import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import localProjects from '@/data/projects.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tech = searchParams.get('tech');

    let projects = [];

    // Try to fetch from database
    try {
      const where: any = {};
      if (tech) {
        where.topics = {
          has: tech,
        };
      }

      const dbProjects = await prisma.project.findMany({
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

      // Use DB projects if they exist, otherwise fallback to local
      if (dbProjects.length > 0) {
        projects = dbProjects;
      } else {
        // Fallback to local JSON file - extract projects array
        projects = localProjects.projects || [];
      }
    } catch (dbError) {
      console.log('Database not available, using local projects');
      // Fallback to local JSON file - extract projects array
      projects = localProjects.projects || [];
    }

    // If using local projects and tech filter is applied
    if (tech && projects.length > 0 && 'techStack' in projects[0]) {
      projects = projects.filter((project: any) =>
        project.techStack?.includes(tech)
      );
    }

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    // Final fallback to local projects - extract projects array
    const fallback = localProjects.projects || [];
    return NextResponse.json(fallback);
  }
}
