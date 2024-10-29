"use client";

import { useState } from 'react';
import ChatInterface from './ChatInterface';
import CourseGraph from './CourseGraph';
import { courses } from '@/lib/courses';

export default function CourseAdvisor() {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <div className="w-full max-w-md mx-auto">
        {isChatOpen ? (
          <ChatInterface
            onPathUpdate={setSelectedCourses}
            onClose={() => setIsChatOpen(false)}
            onInterviewComplete={() => setIsInterviewComplete(true)}
          />
        ) : (
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-full p-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Open Course Advisor Chat
          </button>
        )}
      </div>
      
      {isInterviewComplete && (
        <div className="w-full">
          <CourseGraph courses={courses} selectedCourses={selectedCourses} />
        </div>
      )}
    </div>
  );
}