"use client";

import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Course } from '@/lib/courseData';

interface CourseGridProps {
  courses: Course[];
  selectedCourses: string[];
}

export default function CourseGrid({ courses, selectedCourses }: CourseGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;

    courses.forEach(course => {
      course.prerequisites.forEach(prereqId => {
        const prereq = courses.find(c => c.id === prereqId);
        if (prereq) {
          const startX = prereq.coordinates.x * 200 + 100;
          const startY = prereq.coordinates.y * 200 + 100;
          const endX = course.coordinates.x * 200 + 100;
          const endY = course.coordinates.y * 200 + 100;

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      });
    });
  }, [courses]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="absolute inset-0 pointer-events-none"
      />
      <div className="grid grid-cols-3 gap-8 relative">
        {courses.map((course) => (
          <Card
            key={course.id}
            className={`p-6 transform transition-all duration-300 hover:scale-105 ${
              selectedCourses.includes(course.id)
                ? 'ring-2 ring-primary'
                : ''
            }`}
            style={{
              gridColumn: course.coordinates.x + 1,
              gridRow: course.coordinates.y + 1,
            }}
          >
            <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {course.description}
            </p>
            <div className="flex justify-between text-sm">
              <span>{course.id}</span>
              <span>{course.credits} credits</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}