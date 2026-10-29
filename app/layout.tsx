import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jamie Ho",
  description: "Software engineer in London: distributed systems, cloud and AI engineering.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
