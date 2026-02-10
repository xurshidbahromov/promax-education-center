import { Background } from "@/components/Background";

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Background />
            <main className="min-h-screen">
                {children}
            </main>
        </>
    );
}
