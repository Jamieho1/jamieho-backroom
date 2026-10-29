/**
 * Sends the "new message" alert through Resend's HTTP API. Jamie sets RESEND_API_KEY (Sensitive) and
 * CONTACT_ALERT_TO in Vercel himself. Without them the alert is skipped and the message is still saved.
 */
export type AlertOutcome = "sent" | "skipped" | "failed";

export async function sendAlert(subject: string, text: string, replyTo: string, fetcher: typeof fetch = fetch): Promise<AlertOutcome> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_ALERT_TO?.trim();
  if (!key || !to) {
    console.warn(`contact alert skipped: ${!key ? "RESEND_API_KEY" : "CONTACT_ALERT_TO"} not set`);
    return "skipped";
  }
  const from = process.env.RESEND_FROM?.trim() || "jamieho-backroom <onboarding@resend.dev>";
  try {
    const res = await fetcher("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text, reply_to: replyTo }),
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) return "sent";
    // Resend's own reason (e.g. "you can only send testing emails to your own email address"). Never includes the key.
    const reason = await res.text().catch(() => "");
    console.error(`contact alert: Resend refused (${res.status}) ${reason.slice(0, 300)}`);
    return "failed";
  } catch (e) {
    console.error(`contact alert: Resend unreachable (${e instanceof Error ? e.name : "error"})`);
    return "failed";
  }
}
