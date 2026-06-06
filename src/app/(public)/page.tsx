import Hero from "@/components/Hero";
import CoursesPreview from "@/components/CoursesPreview";
import YouTubeSection from "@/components/YouTubeSection";
import ResultsStats from "@/components/ResultsStats";
import Methodology from '@/components/Methodology';
import CallToAction from "@/components/CallToAction";

import AdmissionAnnouncement from "@/components/ui/AdmissionAnnouncement";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Promax Education Center",
    "url": "https://promaxedu.uz",
    "description": "Xorazm Urganch shahridagi eng zamonaviy o'quv markazi. OTM larga, IELTS, SAT va Xalqaro Universitetlarga tayyorlov.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Urgench",
      "addressRegion": "Xorazm",
      "addressCountry": "UZ"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+998-95-513-77-76",
      "contactType": "customer service"
    }
  };

  return (
    <div className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <div className="relative overflow-hidden bg-white/30 dark:bg-slate-900/35 border-y border-gray-200/30 dark:border-white/5 backdrop-blur-[4px] transition-colors duration-300">
        <CoursesPreview />
        <Methodology />
      </div>
      <ResultsStats />
      <div className="relative overflow-hidden bg-white/30 dark:bg-slate-900/35 border-t border-gray-200/30 dark:border-white/5 backdrop-blur-[4px] transition-colors duration-300">
        <YouTubeSection />
        <CallToAction />
      </div>
      <AdmissionAnnouncement />
    </div>
  );
}
