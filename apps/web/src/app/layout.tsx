import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "../index.css";
import Header from "@/components/core/header";
import Footer from "@/components/core/footer";
import Providers from "@/components/core/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Archivist",
  description:
    "A visual autobiography of your emotional journey. Every square holds a memory, every color tells a story.",
  keywords: [
    "journal",
    "diary",
    "emotional tracking",
    "life journal",
    "personal journal",
    "memory keeper",
  ],
  authors: [{ name: "ramxcodes", url: "https://twitter.com/ramxcodes" }],
  creator: "ramxcodes",
  publisher: "Archivist",
  metadataBase: process.env.NEXT_PUBLIC_FRONTEND_URL
    ? new URL(process.env.NEXT_PUBLIC_FRONTEND_URL)
    : undefined,

  icons: {
    icon: [
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/icons/180.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "icon",
        url: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "icon",
        url: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Archivist",
    title: "Archivist",
    description:
      "A visual autobiography of your emotional journey. Every square holds a memory, every color tells a story.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Archivist – A visual autobiography of your emotional journey",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Archivist",
    description:
      "A visual autobiography of your emotional journey. Every square holds a memory, every color tells a story.",
    images: ["/og-image.jpg"],
    creator: "@ramxcodes",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0D0D0F",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased bg-[#0D0D0F] text-gray-100 min-h-screen flex flex-col`}
      >
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
