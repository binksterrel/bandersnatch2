import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ShaderBackground } from "@/components/ShaderBackground";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Bandersnatch - Aventure Interactive",
  description: "Créez votre propre aventure avec l'IA.",
    generator: 'v0.app'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-slate-950 text-white overflow-x-hidden`}>
        <ShaderBackground />
        <main className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
