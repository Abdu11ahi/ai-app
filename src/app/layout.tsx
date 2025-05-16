import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import { Navigation } from "@/components/Navigation";
import { ClientAuthProtection } from "@/components/ClientAuthProtection";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RetroApp",
  description: "A modern retrospective application built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <div className="fixed inset-0 -z-10 h-full w-full bg-background">
          <div className="absolute inset-0 bg-grid-[rgba(0,0,0,0.03)] -z-10"></div>
          <div className="absolute top-0 left-0 right-0 h-60 bg-gradient-to-b from-primary/10 to-transparent -z-10"></div>
          <div className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-primary/10 to-transparent -z-10"></div>
          <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px] -z-10"></div>
          <div className="absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-accent/5 blur-[120px] -z-10"></div>
        </div>
        <ClientAuthProtection>
          <div className="flex min-h-screen flex-col">
            {/* Navigation component removed to prevent duplicate nav bars */}
            <main className="flex-1">{children}</main>
            <footer className="border-t border-border/50 py-6 bg-background/80 backdrop-blur-sm">
              <div className="container">
                <div className="flex flex-col items-center justify-center gap-2 md:flex-row md:justify-between text-sm text-muted-foreground">
                  <p>© 2024 RetroApp. All rights reserved.</p>
                  <div className="flex items-center gap-4">
                    <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                    <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                    <a href="#" className="hover:text-foreground transition-colors">Contact</a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </ClientAuthProtection>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
