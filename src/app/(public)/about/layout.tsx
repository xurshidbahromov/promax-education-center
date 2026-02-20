import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Biz haqimizda | Promax Education Center",
    description: "Urganch shahridagi Promax Education markazining tarixi, nufuzli ustozlari va yutuqlari bilan tanishing.",
    openGraph: {
        title: "Biz haqimizda - Promax Education Center",
        description: "Urganch shahridagi Promax Education markazining tarixi, nufuzli ustozlari va yutuqlari bilan tanishing.",
        url: "https://promaxedu.uz/about",
    },
    alternates: {
        canonical: "https://promaxedu.uz/about"
    }
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
