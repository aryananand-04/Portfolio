'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface Project {
  id: number;
  name?: string;
  title?: string;
  description: string | null;
  githubUrl: string | null;
  homepageUrl?: string | null;
  liveUrl?: string | null;
  stars?: number;
  forks?: number;
  language?: string | null;
  topics?: string[];
  techStack?: string[];
  imageUrl?: string;
  isFeatured?: boolean;
  lastUpdated?: string | null;
  createdAt?: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTech, setSelectedTech] = useState<string>('All');
  const [allTechStack, setAllTechStack] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const ITEMS_PER_VIEW = 4;

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [selectedTech, projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data);

      // Extract all unique tech stack
      const techSet = new Set<string>();
      data.forEach((project: Project) => {
        const techs = project.topics || project.techStack || [];
        techs.forEach((tech) => techSet.add(tech));
      });
      setAllTechStack(Array.from(techSet).sort());
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    if (selectedTech === 'All') {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter((project) => {
        const techs = project.topics || project.techStack || [];
        return techs.includes(selectedTech);
      });
      setFilteredProjects(filtered);
    }
    setCurrentIndex(0);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredProjects.length - ITEMS_PER_VIEW) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const canNavigate = filteredProjects.length > ITEMS_PER_VIEW;
  const canGoPrev = canNavigate && currentIndex > 0;
  const canGoNext = canNavigate && currentIndex < filteredProjects.length - ITEMS_PER_VIEW;

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Projects
        </h2>

        {/* Tech Stack Filter */}
        {allTechStack.length > 0 && (
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedTech('All')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedTech === 'All'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              }`}
            >
              All
            </button>
            {allTechStack.map((tech) => (
              <button
                key={tech}
                onClick={() => setSelectedTech(tech)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedTech === tech
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            No projects found for the selected tech stack.
          </div>
        ) : (
          <div className="relative">
            {/* Navigation Buttons */}
            <button
              onClick={handlePrev}
              disabled={!canGoPrev}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-700 p-3 rounded-full shadow-lg transition ${
                canGoPrev
                  ? 'hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              aria-label="Previous projects"
            >
              <svg className="w-6 h-6 text-gray-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-700 p-3 rounded-full shadow-lg transition ${
                canGoNext
                  ? 'hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              aria-label="Next projects"
            >
              <svg className="w-6 h-6 text-gray-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Carousel Container */}
            <div className="overflow-hidden mx-12">
              <div
                ref={carouselRef}
                className="flex transition-transform duration-500 ease-in-out gap-6"
                style={{
                  transform: `translateX(-${currentIndex * (100 / ITEMS_PER_VIEW)}%)`,
                }}
              >
                {filteredProjects.map((project) => {
                  const projectName = project.name || project.title || 'Untitled';
                  const techs = project.topics || project.techStack || [];

                  return (
                    <div
                      key={project.id}
                      className="flex-shrink-0 bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
                      style={{ width: `calc(${100 / ITEMS_PER_VIEW}% - 1.125rem)` }}
                    >
                      {/* Project Image */}
                      {project.imageUrl && (
                        <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-800">
                          <Image
                            src={project.imageUrl}
                            alt={projectName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                          {projectName}
                        </h3>
                        {project.description && (
                          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed line-clamp-3">
                            {project.description}
                          </p>
                        )}

                        {/* Tech Stack Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {techs.slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              onClick={() => setSelectedTech(tech)}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                            >
                              {tech}
                            </span>
                          ))}
                          {techs.length > 4 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                              +{techs.length - 4}
                            </span>
                          )}
                        </div>

                        {/* Links */}
                        <div className="flex gap-4">
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1 text-sm"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                              </svg>
                              GitHub
                            </a>
                          )}
                          {(project.homepageUrl || project.liveUrl) && (
                            <a
                              href={project.homepageUrl || project.liveUrl || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1 text-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Live Demo
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Carousel Indicators */}
            {canNavigate && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: Math.ceil(filteredProjects.length - ITEMS_PER_VIEW + 1) }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition ${
                      currentIndex === idx
                        ? 'bg-blue-600 w-8'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
