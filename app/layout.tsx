import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Jamie Ho",
  description: "Software engineer in London: distributed systems, cloud and AI engineering.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
