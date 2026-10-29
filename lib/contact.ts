/** Contact form (TKT-57): shared limits and checks. The database enforces the same limits again. */
import { createHmac } from "node:crypto";

export const CONTACT_LIMITS = { name: 100, email: 200, need: 4000, budget: 60 } as const;
export const BUDGETS = ["Under £1k", "£1k–£5k", "£5k–£15k", "£15k+", "Not sure yet"] as const;

export interface ContactInput {
  name: string;
  email: string;
  need: string;
  budget: string;
}
export interface ContactResult {
  ok: boolean;
  message: string;
  /** Field values to put back after an error, so nothing typed is lost. */
  values?: ContactInput;
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function readContact(form: FormData): ContactInput {
  const get = (k: string) => String(form.get(k) ?? "").trim();
  return { name: get("name"), email: get("email").toLowerCase(), need: get("need"), budget: get("budget") };
}

/** Error message, or null when the message can be sent. */
export function validateContact(c: ContactInput): string | null {
  if (!c.name) return "Please add your name.";
  if (c.name.length > CONTACT_LIMITS.name) return "Your name is too long.";
  if (!EMAIL.test(c.email) || c.email.length > CONTACT_LIMITS.email) return "That doesn't look like an email address.";
  if (!c.need) return "Tell me a little about what you need.";
  if (c.need.length > CONTACT_LIMITS.need) return `Please keep it under ${CONTACT_LIMITS.need} characters.`;
  if (!(BUDGETS as readonly string[]).includes(c.budget)) return "Please pick a budget (\"Not sure yet\" is fine).";
  return null;
}

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
