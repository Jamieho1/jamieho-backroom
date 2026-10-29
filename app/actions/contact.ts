"use server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { readSupabaseEnv } from "@/lib/env";
import { alertText, clientIp, hashIp, readContact, validateContact, type ContactResult } from "@/lib/contact";
import { sendAlert } from "@/lib/resend";

const SAVED = "Thanks, your message is in. I'll reply by email.";

/** Public contact form. Saves first; the email alert is best-effort and never loses the message. */
export async function sendMessage(_: ContactResult | null, form: FormData): Promise<ContactResult> {
  const values = readContact(form);
  // Honeypot: people never see this field; bots fill it. Pretend it worked and save nothing.
  if (String(form.get("website") ?? "").trim()) return { ok: true, message: SAVED };
  const invalid = validateContact(values);
  if (invalid) return { ok: false, message: invalid, values };

  const env = readSupabaseEnv();
  if (!env) return { ok: false, message: "The form isn't connected yet. Please use the links above.", values };
  const ip = clientIp((await headers()).get("x-forwarded-for"));
  const ip_hash = ip ? hashIp(ip, process.env.IP_HASH_SALT || env.url) : null;

  const sb = createClient(env.url, env.anonKey, { auth: { persistSession: false } });
  const { error } = await sb.from("messages").insert({ ...values, ip_hash });
  if (error) {
    if (error.message.includes("rate_limited")) return { ok: false, message: "That's a lot of messages from here. Please try again in an hour.", values };
    if (error.message.includes("busy")) return { ok: false, message: "The inbox is busy right now. Please try again later or use the links above.", values };
    return { ok: false, message: "Couldn't send. Your message is still here, try again.", values };
  }

  await sendAlert(`New message from ${values.name}`, alertText(values), values.email);
  revalidatePath("/settings");
  return { ok: true, message: SAVED };
}
