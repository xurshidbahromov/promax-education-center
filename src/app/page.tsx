import Hero from "@/components/Hero";
import CoursesPreview from "@/components/CoursesPreview";
import YouTubeSection from "@/components/YouTubeSection";

export default function Home() {
  return (
    <div className="bg-white dark:bg-slate-950 transition-colors duration-300">
      <Hero />
      <CoursesPreview />
      <YouTubeSection />
      {/* Future Platform Sections: Results, Teachers */}
    </div>
  );
}
