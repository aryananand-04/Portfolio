'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

interface AchievementsSliderProps {
  images: string[];
}

export default function AchievementsSlider({ images }: AchievementsSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.50; // pixels per frame (slowed down by 100%)

    const scroll = () => {
      scrollPosition += scrollSpeed;

      // Reset scroll position when we've scrolled through all images
      if (scrollPosition >= slider.scrollWidth / 2) {
        scrollPosition = 0;
      }

      slider.scrollLeft = scrollPosition;
      requestAnimationFrame(scroll);
    };

    const animationId = requestAnimationFrame(scroll);

    // Pause on hover
    const handleMouseEnter = () => {
      cancelAnimationFrame(animationId);
    };

    const handleMouseLeave = () => {
      requestAnimationFrame(scroll);
    };

    slider.addEventListener('mouseenter', handleMouseEnter);
    slider.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      slider.removeEventListener('mouseenter', handleMouseEnter);
      slider.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Duplicate images for seamless loop
  const duplicatedImages = [...images, ...images];

  return (
    <div className="w-full overflow-hidden bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
      <div
        ref={sliderRef}
        className="flex gap-4 overflow-x-hidden"
        style={{ scrollBehavior: 'auto' }}
      >
        {duplicatedImages.map((image, index) => (
          <div
            key={index}
            className="flex-shrink-0 relative w-80 h-48 rounded-lg overflow-hidden shadow-md"
          >
            <Image
              src={image}
              alt={`Achievement ${index + 1}`}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
