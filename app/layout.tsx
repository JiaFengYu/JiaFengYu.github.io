import "./globals.css";
import { ReactNode } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import NightSky from "../components/NightSky";
import { assetPath, site } from "../lib/site";

export const metadata = {
  metadataBase: new URL(`${site.url}/`),
  title: "Jayden Yu | Inference & GPU Kernels",
  description: site.description,
  icons: {
    icon: [
      { url: assetPath("/favicon.ico"), sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: assetPath("/favicon.svg"), sizes: "any", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="night-sky-bg text-gray-100 min-h-screen flex flex-col relative">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <NightSky />
        
        {/* Main navigation */}
        <div className="relative z-20">
          <Navbar />
        </div>
        
        {/* Main content */}
        <main id="main-content" className="flex-1 container mx-auto px-4 py-12 relative z-10">
          {children}
        </main>
        
        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
