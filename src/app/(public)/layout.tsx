import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Background } from "@/components/Background";

export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Background />
            <Navbar />
            <main className="flex-grow pt-16">
                {children}
            </main>
            <Footer />
        </>
    );
}
