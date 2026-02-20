import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Natijalarimiz | Promax Education Center",
    description: "Promax Education Center o'quvchilarining OTM larga kirish ko'rsatkichlari, IELTS va SAT dagi yuqori natijalari.",
    openGraph: {
        title: "O'quvchilarimiz Natijalari - Promax Education Center",
        description: "Promax Education Center o'quvchilarining OTM larga kirish ko'rsatkichlari, IELTS va SAT dagi yuqori natijalari.",
        url: "https://promaxedu.uz/results",
    },
    alternates: {
        canonical: "https://promaxedu.uz/results"
    }
};

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
