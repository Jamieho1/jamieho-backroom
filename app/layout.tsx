import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { ViewerProvider } from "@/components/viewer-provider";
import { THEME_BOOT } from "@/components/theme-toggle";
import { SiteAnalytics } from "@/components/site-analytics";

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  title: "Jamie Ho",
  description: "Software engineer in London: distributed systems, cloud and AI engineering.",
  // Google Search Console ownership check (set the token in Vercel; no code change needed).
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>
        <ViewerProvider>
          <SiteHeader />
          {children}
          <footer className="site-footer">
            <a href="/privacy">Privacy</a>
          </footer>
        </ViewerProvider>
        <SiteAnalytics />
      </body>
    </html>
  );
}
