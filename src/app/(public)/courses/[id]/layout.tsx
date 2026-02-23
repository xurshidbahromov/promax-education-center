import { Metadata } from 'next';
import { courses } from '@/data/courses';
import { uz } from '@/locales/uz';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const course = courses.find((c) => c.id === resolvedParams.id);

    if (!course) {
        return {
            title: 'Kurs topilmadi | Promax Education Center',
        };
    }

    // Default to the key 'courses.[id]' or customized if complex
    let titleKey = `courses.${course.id}`;
    let descKey = `courses.${course.id}.desc`;

    const title = (uz as any)[titleKey] || "Matn topilmadi";
    const description = (uz as any)[descKey] || "Promax Education Center dagi maxsus tayyorgarlik kursi.";

    return {
        title: `${title} | Promax Education Center`,
        description: description,
        openGraph: {
            title: `${title} - Promax Education Center`,
            description: description,
            url: `https://promaxedu.uz/courses/${resolvedParams.id}`,
            type: "website",
        },
        alternates: {
            canonical: `https://promaxedu.uz/courses/${resolvedParams.id}`
        }
    };
}

export default async function CourseLayout({ children, params }: { children: React.ReactNode, params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const course = courses.find((c) => c.id === resolvedParams.id);

    // Create JSON-LD for this individual course
    let jsonLd = null;
    if (course) {
        let titleKey = `courses.${course.id}`;
        let descKey = `courses.${course.id}.desc`;
        const title = (uz as any)[titleKey] || "Matn topilmadi";
        const description = (uz as any)[descKey] || "Promax Education Center dagi maxsus tayyorgarlik kursi.";

        jsonLd = {
            "@context": "https://schema.org",
            "@type": "Course",
            "name": title,
            "description": description,
            "provider": {
                "@type": "EducationalOrganization",
                "name": "Promax Education Center",
                "sameAs": "https://promaxedu.uz"
            }
        };
    }

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            {children}
        </>
    );
}
