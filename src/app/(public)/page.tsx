import dynamic from "next/dynamic";
import Hero from "@/components/Hero";

// Dynamic Code-Splitting for Below-the-Fold components
const NewsSection = dynamic(() => import("@/components/NewsSection"));
const CoursesPreview = dynamic(() => import("@/components/CoursesPreview"));
const Methodology = dynamic(() => import("@/components/Methodology"));
const ResultsStats = dynamic(() => import("@/components/ResultsStats"));
const YouTubeSection = dynamic(() => import("@/components/YouTubeSection"));
const CallToAction = dynamic(() => import("@/components/CallToAction"));
const AdmissionAnnouncement = dynamic(() => import("@/components/ui/AdmissionAnnouncement"));

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Promax Education Center",
    "url": "https://promaxedu.uz",
    "description": "Toshkent Chilonzor shahridagi eng zamonaviy o'quv markazi. OTM larga, IELTS, SAT va Xalqaro Universitetlarga tayyorlov.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Toshkent",
      "addressRegion": "Chilonzor",
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
      <NewsSection />
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
