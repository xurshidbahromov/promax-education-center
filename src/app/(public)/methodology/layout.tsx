import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Metodika | Promax Education Center",
    description: "Promax Education da zamonaviy ta'lim metodikasi, dars jarayonlari va yuqori natijalarga erishish sirlari.",
    openGraph: {
        title: "Ta'lim Metodikasi - Promax Education Center",
        description: "Promax Education da zamonaviy ta'lim metodikasi, dars jarayonlari va yuqori natijalarga erishish sirlari.",
        url: "https://promaxedu.uz/methodology",
    },
    alternates: {
        canonical: "https://promaxedu.uz/methodology"
    }
};

export default function MethodologyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
