import "./globals.css";
import { ReactNode } from "react";
import { Navbar, Footer } from "../components";
import { site } from "../lib/site";

export const metadata = {
  metadataBase: new URL(`${site.url}/`),
  title: "Jayden Yu | Inference & GPU Kernels",
  description: site.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="night-sky-bg text-gray-100 min-h-screen flex flex-col relative">
        <a href="#main-content" className="skip-link">Skip to content</a>
        {/* Space background with stars */}
        <div className="stars-container fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
          <div className="stars4"></div>
          <div className="shooting-star" style={{ top: '20%', animationDelay: '0s' }}></div>
          <div className="shooting-star" style={{ top: '60%', animationDelay: '4s' }}></div>
          <div className="shooting-star" style={{ top: '80%', animationDelay: '8s' }}></div>
        </div>
        
        {/* White navbar with enforced styling */}
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
