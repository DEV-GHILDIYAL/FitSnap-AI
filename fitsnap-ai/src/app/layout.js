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
  title: "FitSnap AI – Try Outfits on Yourself",
  description:
    "Upload your photo and an outfit image to see how it looks on you. Powered by AI virtual try-on technology.",
  keywords: ["virtual try-on", "AI fashion", "outfit preview", "FitSnap"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
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
