import Hero from "@/components/Hero";
import CoursesPreview from "@/components/CoursesPreview";
import YouTubeSection from "@/components/YouTubeSection";
import ResultsStats from "@/components/ResultsStats";
import Methodology from '@/components/Methodology';
import CallToAction from "@/components/CallToAction";

import AdmissionAnnouncement from "@/components/ui/AdmissionAnnouncement";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <CoursesPreview />
      <Methodology />
      <ResultsStats />
      <YouTubeSection />
      <CallToAction />
      <AdmissionAnnouncement />
    </main>
  );
}
