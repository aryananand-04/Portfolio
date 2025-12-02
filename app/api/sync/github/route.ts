import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  fork: boolean;
  private: boolean;
  created_at: string;
  updated_at: string;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const username = process.env.GITHUB_USERNAME;
    const token = process.env.GITHUB_PAT;

    if (!username) {
      return NextResponse.json(
        { error: 'GITHUB_USERNAME not configured' },
        { status: 500 }
      );
    }

    // Fetch repos from GitHub API
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      { headers }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API error:', response.status, errorText);

      // Log failed sync
      await prisma.failedSync.create({
        data: {
          source: 'github',
          errorMessage: `GitHub API returned ${response.status}`,
          errorData: { status: response.status, body: errorText },
        },
      });

      return NextResponse.json(
        { error: 'Failed to fetch from GitHub API' },
        { status: response.status }
      );
    }

    const repos: GitHubRepo[] = await response.json();

    // Filter repos: not fork, not private, has 'portfolio' topic OR has stars
    const filteredRepos = repos.filter(
      (repo) =>
        !repo.fork &&
        !repo.private &&
        (repo.topics.includes('portfolio') || repo.stargazers_count > 0)
    );

    let syncedCount = 0;
    let updatedCount = 0;
    let createdCount = 0;

    // Upsert each repo to database
    for (const repo of filteredRepos) {
      const existingProject = await prisma.project.findUnique({
        where: { githubUrl: repo.html_url },
      });

      const projectData = {
        name: repo.name,
        description: repo.description,
        githubUrl: repo.html_url,
        homepageUrl: repo.homepage,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        topics: repo.topics,
        lastUpdated: new Date(repo.updated_at),
        rawData: repo as unknown as Prisma.InputJsonValue,
      };

      if (existingProject) {
        await prisma.project.update({
          where: { id: existingProject.id },
          data: projectData,
        });
        updatedCount++;
      } else {
        await prisma.project.create({
          data: projectData,
        });
        createdCount++;
      }

      syncedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedCount} projects from GitHub`,
      stats: {
        total: filteredRepos.length,
        created: createdCount,
        updated: updatedCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('GitHub sync error:', error);

    // Log failed sync
    try {
      await prisma.failedSync.create({
        data: {
          source: 'github',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorData: error instanceof Error ? { stack: error.stack } : {},
        },
      });
    } catch (dbError) {
      console.error('Failed to log sync error:', dbError);
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
