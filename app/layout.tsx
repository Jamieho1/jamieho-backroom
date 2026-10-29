import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  title: "Jamie Ho",
  description: "Software engineer in London: distributed systems, cloud and AI engineering.",
  // Google Search Console ownership check (set the token in Vercel; no code change needed).
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body>
        <SiteHeader />
        {children}
        <footer className="site-footer">
          <a href="/privacy">Privacy</a>
        </footer>
      </body>
    </html>
  );
}
