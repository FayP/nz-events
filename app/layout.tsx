import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { WebsiteJsonLd } from "@/components/WebsiteJsonLd";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "GoStride - Find Your Next Finish Line",
    template: "%s | GoStride",
  },
  description: "Discover running, cycling, and triathlon events across New Zealand. Find your next finish line with GoStride.",
  keywords: ["running events", "cycling events", "triathlon", "New Zealand", "marathon", "race", "endurance sports", "NZ events"],
  authors: [{ name: "GoStride" }],
  creator: "GoStride",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://gostride.co.nz"),
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    type: "website",
    locale: "en_NZ",
    siteName: "GoStride",
    title: "GoStride - Find Your Next Finish Line",
    description: "Discover running, cycling, and triathlon events across New Zealand. Find your next finish line with GoStride.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GoStride - Find Your Next Finish Line",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GoStride - Find Your Next Finish Line",
    description: "Discover running, cycling, and triathlon events across New Zealand. Find your next finish line with GoStride.",
    images: ["/og-image.png"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${dmSans.variable} antialiased`}
      >
        <WebsiteJsonLd />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
