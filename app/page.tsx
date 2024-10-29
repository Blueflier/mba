import CourseAdvisor from '@/components/CourseAdvisor';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">MBA Course Advisor</h1>
      <CourseAdvisor />
    </div>
  );
}