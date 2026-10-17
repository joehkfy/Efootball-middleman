import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "eFootball Middleman | Safe Account Trading",
  description: "Trusted middleman service for buying and selling eFootball accounts, coins and items.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {children}
        </main>
        <footer className="border-t border-zinc-800 mt-16 py-8 text-center text-zinc-500 text-sm">
          <p>© 2026 eFootball Middleman. Safe trading guaranteed.</p>
        </footer>
      </body>
    </html>
  );
}
