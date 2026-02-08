import Hero from "@/components/Hero";
import CoursesPreview from "@/components/CoursesPreview";
import YouTubeSection from "@/components/YouTubeSection";
import ResultsStats from "@/components/ResultsStats";
import Link from 'next/link';
import Methodology from '@/components/Methodology';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <CoursesPreview />
      <Methodology />
      <ResultsStats />
      <YouTubeSection />
      {/* Future Platform Sections: Results, Teachers */}
    </main>
  );
}
