import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Metadata, Viewport } from "next";
import { RootLayoutClient } from './layout-client';
import 'react-toastify/dist/ReactToastify.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: "Practivoo",
    template: "%s | Practivoo",
  },
  description:
    "Practivoo — Empowering education through innovative technology. Where schools, teachers, and students grow together.",
  keywords: [
    "education",
    "school software",
    "teacher dashboard",
    "student progress",
    "autocorrected exercises",
    "Practivoo",
  ],
  authors: [{ name: "Practivoo", url: "https://www.practivoo.com" }],
  creator: "Practivoo",
  openGraph: {
    title: "Practivoo",
    description:
      "Practivoo — Empowering education through innovative technology. Where schools, teachers, and students grow together.",
    url: "https://www.practivoo.com",
    siteName: "Practivoo",
    images: [
      {
        url: "https://www.practivoo.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Practivoo — Empowering education",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Practivoo",
    description:
      "Practivoo — Empowering education through innovative technology. Where schools, teachers, and students grow together.",
    images: ["https://www.practivoo.com/og-image.png"],
    site: "@practivoo",
    creator: "@practivoo",
  },
  manifest: "https://www.practivoo.com/site.webmanifest",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "android-chrome-192x192.png",
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
      },
      {
        rel: "android-chrome-512x512.png",
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
      },
    ],
  },
};

// Separate viewport export for themeColor
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <RootLayoutClient>{children}
         
        </RootLayoutClient>
      </body>
    </html>
  );
}
