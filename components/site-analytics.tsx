"use client";
/**
 * Vercel Web Analytics (TKT-58): cookieless page views, no banner needed.
 * Owner pages aren't counted, and query strings (sign-in "next" links etc.) are dropped before sending.
 */
import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

export function tidyEvent(event: BeforeSendEvent): BeforeSendEvent | null {
  const url = new URL(event.url);
  if (url.pathname.startsWith("/settings") || url.pathname.startsWith("/auth")) return null;
  url.search = "";
  return { ...event, url: url.toString() };
}

export function SiteAnalytics() {
  return <Analytics beforeSend={tidyEvent} />;
}
