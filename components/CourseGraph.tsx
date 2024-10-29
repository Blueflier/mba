"use client";

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Course } from '@/lib/types';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CourseGraphProps {
  courses: Course[];
  selectedCourses: string[];
}

interface Position {
  x: number;
  y: number;
}

interface HoverInfo {
  course: Course;
  position: Position;
}

export default function CourseGraph({ courses, selectedCourses }: CourseGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const positions = useRef(new Map<string, Position>());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate levels for each course
    const levels = new Map<string, number>();
    const calculateLevel = (courseId: string, visited = new Set<string>()): number => {
      if (visited.has(courseId)) return 0;
      visited.add(courseId);

      const course = courses.find(c => c.id === courseId);
      if (!course?.prerequisites?.length) return 0;

      let maxLevel = 0;
      course.prerequisites.forEach(prereqId => {
        maxLevel = Math.max(maxLevel, calculateLevel(prereqId, visited) + 1);
      });

      return maxLevel;
    };

    // Assign levels
    courses.forEach(course => {
      levels.set(course.id, calculateLevel(course.id));
    });

    // Position courses based on levels
    const levelCounts = new Map<number, number>();
    const spacing = { x: 200, y: 150 };
    const offset = { x: 100, y: 80 };

    positions.current.clear();
    courses.forEach(course => {
      const level = levels.get(course.id) || 0;
      const count = levelCounts.get(level) || 0;
      levelCounts.set(level, count + 1);

      positions.current.set(course.id, {
        x: level * spacing.x + offset.x,
        y: count * spacing.y + offset.y,
      });
    });

    // Draw connections
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;

    courses.forEach(course => {
      if (!course.prerequisites) return;
      
      course.prerequisites.forEach(prereqId => {
        const startPos = positions.current.get(prereqId);
        const endPos = positions.current.get(course.id);

        if (startPos && endPos) {
          ctx.beginPath();
          ctx.moveTo(startPos.x + 100, startPos.y + 50);
          ctx.lineTo(endPos.x + 100, endPos.y + 50);
          
          // Draw arrow
          const angle = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x);
          const arrowLength = 10;
          
          ctx.moveTo(endPos.x + 100, endPos.y + 50);
          ctx.lineTo(
            endPos.x + 100 - arrowLength * Math.cos(angle - Math.PI / 6),
            endPos.y + 50 - arrowLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(endPos.x + 100, endPos.y + 50);
          ctx.lineTo(
            endPos.x + 100 - arrowLength * Math.cos(angle + Math.PI / 6),
            endPos.y + 50 - arrowLength * Math.sin(angle + Math.PI / 6)
          );
          
          ctx.stroke();
        }
      });
    });

    // Draw courses
    courses.forEach(course => {
      const pos = positions.current.get(course.id);
      if (!pos) return;

      const isSelected = selectedCourses.includes(course.id);
      const isPrerequisite = selectedCourses.some(selectedId => {
        const selectedCourse = courses.find(c => c.id === selectedId);
        return selectedCourse?.prerequisites?.includes(course.id);
      });

      if (isSelected || isPrerequisite) {
        ctx.fillStyle = isSelected ? '#3b82f6' : '#93c5fd';
        ctx.strokeStyle = '#1d4ed8';
      } else {
        ctx.fillStyle = '#f3f4f6';
        ctx.strokeStyle = '#d1d5db';
      }

      // Draw hexagon
      const hexSize = 60;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = pos.x + 100 + hexSize * Math.cos(angle);
        const y = pos.y + 50 + hexSize * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw text
      ctx.fillStyle = isSelected ? '#ffffff' : '#000000';
      ctx.font = 'bold 16px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(course.id, pos.x + 100, pos.y + 50);
    });

  }, [courses, selectedCourses]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Check if mouse is over any hexagon
    for (const [courseId, pos] of positions.current.entries()) {
      const dx = x - (pos.x + 100);
      const dy = y - (pos.y + 50);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 60) { // hexagon size
        const course = courses.find(c => c.id === courseId);
        if (course) {
          setHoverInfo({ course, position: { x: e.clientX, y: e.clientY } });
          return;
        }
      }
    }

    setHoverInfo(null);
  };

  return (
    <div className="relative bg-white rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Course Path Visualization</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Blue hexagons are recommended courses.<br/>Light blue indicates prerequisites.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={1000}
          height={800}
          className="w-full h-auto"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverInfo(null)}
        />
        {hoverInfo && (
          <div
            className="absolute z-10 bg-white p-4 rounded-lg shadow-lg max-w-xs"
            style={{
              left: hoverInfo.position.x + 20,
              top: hoverInfo.position.y + 20,
            }}
          >
            <h3 className="font-semibold text-lg">{hoverInfo.course.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{hoverInfo.course.description}</p>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-primary">{hoverInfo.course.credits} credits</span>
              <span className="text-muted-foreground">{hoverInfo.course.category}</span>
            </div>
            {hoverInfo.course.prerequisites?.length > 0 && (
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">Prerequisites: </span>
                {hoverInfo.course.prerequisites.join(", ")}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {courses.filter(course => selectedCourses.includes(course.id)).map((course) => (
          <Card key={course.id} className="p-4">
            <h3 className="font-semibold">{course.name}</h3>
            <p className="text-sm text-muted-foreground">{course.description}</p>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-primary">{course.id}</span>
              <span>{course.credits} credits</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}