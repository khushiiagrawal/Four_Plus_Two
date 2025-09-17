import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from "@/components/ui/ConditionalNavbar";
import { ToastProvider } from "@/components/ui/Toast";
import { UserProvider } from "@/contexts/UserContext";
import PageTransition from "@/components/ui/PageTransition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JalRakshak | Digital Health Surveillance",
  description:
    "Smart Community Health Monitoring—AI and IoT powered Early Warning for Water-Borne Diseases in Rural India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-b from-cyan-200 via-sky-200 to-cyan-100`}
      >
        <ToastProvider>
          <UserProvider>
            <div className="min-h-dvh text-slate-800">
              <ConditionalNavbar />
              <PageTransition>{children}</PageTransition>
            </div>
          </UserProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
