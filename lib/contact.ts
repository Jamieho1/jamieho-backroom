/** Contact transport helpers. Pure form rules live in contact-fields.ts. */
import {createHmac} from "node:crypto";
import type {ContactInput} from "./contact-fields";
export * from "./contact-fields";

/** First address in x-forwarded-for (Vercel sets this header; it isn't the visitor's to choose). */
export function clientIp(forwardedFor: string | null): string | null {
  const ip = forwardedFor?.split(",")[0]?.trim();
  return ip ? ip : null;
}

/** One-way, keyed hash of the IP: enough to count messages per sender, not enough to recover the address. */
export function hashIp(ip: string, salt: string): string {
  return createHmac("sha256", salt).update(ip).digest("hex");
}

/** Plain-text alert email for Jamie. */
export function alertText(c: ContactInput): string {
  return [`From: ${c.name} <${c.email}>`, `Budget: ${c.budget}`, "", c.need, "", "Reply to this email to answer them. All messages: /settings#inbox"]
    .join("\n");
}
