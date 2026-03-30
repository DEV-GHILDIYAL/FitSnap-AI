import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  variable: "--font-primary",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://fitsnap.ai"), // Update to your final domain
  title: {
    default: "FitSnap AI – AI-Powered Virtual Try-On & Outfits Preview",
    template: "%s | FitSnap AI"
  },
  description: "Experience the magic of AI Virtual Try-On with FitSnap. Upload your photo and an outfit image to see how it looks on you instantly. Transform your wardrobe today.",
  keywords: ["virtual try-on", "AI fashion", "outfit preview", "FitSnap AI", "virtual dressing room", "AI style assistant"],
  authors: [{ name: "FitSnap AI Team" }],
  creator: "FitSnap AI",
  publisher: "FitSnap AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FitSnap AI – Try Outfits on Yourself Instantly",
    description: "Upload your photo and an outfit to see the magic. Powered by AI virtual try-on technology.",
    url: "https://fitsnap.ai",
    siteName: "FitSnap AI",
    images: [
      {
        url: "/og-image.png", // Recommended: Create an OG image in public folder
        width: 1200,
        height: 630,
        alt: "FitSnap AI - Virtual Try-On Studio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FitSnap AI – AI Virtual Try-On",
    description: "Try any outfit on your photo instantly with AI magic.",
    images: ["/og-image.png"],
    creator: "@fitsnap_ai",
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
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "FitSnap AI",
  description: "AI-powered virtual try-on platform that lets you see how outfits look on you instantly.",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
  url: "https://fitsnap.ai",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD"
  },
  featureList: [
    "Virtual Try-On",
    "AI Fashion Recommendations",
    "Personal Wardrobe Support",
    "Community Outfit Sharing"
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Providers>
          <div className="app-shell">
            <Sidebar />
            <main className="main-content">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
