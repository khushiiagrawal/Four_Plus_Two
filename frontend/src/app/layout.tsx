import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from "@/components/ui/ConditionalNavbar";
import { ToastProvider } from "@/components/ui/Toast";
import { UserProvider } from "@/contexts/UserContext";
import PageTransition from "@/components/ui/PageTransition";
import { ThemeProvider } from "next-themes";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import PWAInstallPrompt from "@/components/ui/PWAInstallPrompt";
import PWAStatus from "@/components/ui/PWAStatus";

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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JalRakshak",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0891b2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="JalRakshak" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="JalRakshak" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#0891b2" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="192x192"
          href="/icons/icon-192x192.png"
        />

        {/* Favicon */}
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/icon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/icon-16x16.png"
        />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Splash Screens for iOS */}
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        {/* Microsoft Tiles */}
        <meta
          name="msapplication-TileImage"
          content="/icons/icon-144x144.png"
        />

        {/* Preload critical resources */}
        <link rel="preload" href="/icons/icon-192x192.png" as="image" />

        {/* Service Worker Registration */}
        <script src="/register-sw.js" defer></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <LocaleProvider>
            <ToastProvider>
              <UserProvider>
                <div className="min-h-dvh text-slate-800 dark:text-slate-200 bg-gradient-to-b from-cyan-200 via-sky-200 to-cyan-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                  <ConditionalNavbar />
                  <PageTransition>{children}</PageTransition>
                  <PWAStatus />
                  <PWAInstallPrompt />
                </div>
              </UserProvider>
            </ToastProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
