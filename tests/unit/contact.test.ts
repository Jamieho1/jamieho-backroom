import { describe, expect, it, vi, afterEach } from "vitest";
import { alertText, clientIp, hashIp, readContact, validateContact } from "@/lib/contact";
import { sendAlert } from "@/lib/resend";

const ok = { name: "Ann", email: "ann@example.com", need: "A website", budget: "Not sure yet" };

describe("contact checks", () => {
  it("reads and tidies the form", () => {
    const f = new FormData();
    f.set("name", " Ann ");
    f.set("email", " Ann@Example.com ");
    f.set("need", " Hi ");
    f.set("budget", "£15k+");
    expect(readContact(f)).toEqual({ name: "Ann", email: "ann@example.com", need: "Hi", budget: "£15k+" });
  });
  it("accepts a good message and names the first problem otherwise", () => {
    expect(validateContact(ok)).toBeNull();
    expect(validateContact({ ...ok, name: "" })).toMatch(/name/);
    expect(validateContact({ ...ok, email: "nope" })).toMatch(/email/);
    expect(validateContact({ ...ok, need: "" })).toMatch(/what you need/);
    expect(validateContact({ ...ok, need: "x".repeat(4001) })).toMatch(/4000/);
    expect(validateContact({ ...ok, budget: "" })).toMatch(/budget/);
    expect(validateContact({ ...ok, budget: "a million" })).toMatch(/budget/);
    expect(validateContact({ ...ok, budget: "Free consultation" })).toBeNull();
  });
  it("takes the first forwarded address and hashes it one way", () => {
    expect(clientIp("203.0.113.7, 10.0.0.1")).toBe("203.0.113.7");
    expect(clientIp(null)).toBeNull();
    const h = hashIp("203.0.113.7", "salt");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(h).not.toContain("203");
    expect(hashIp("203.0.113.7", "other")).not.toBe(h);
  });
  it("writes a plain alert with the budget", () => {
    expect(alertText({ ...ok, budget: "£1k–£5k" })).toMatch(/Budget: £1k–£5k/);
  });
});

describe("sendAlert", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("skips quietly when Resend isn't set up", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const f = vi.fn();
    expect(await sendAlert("s", "t", "a@b.co", f as never)).toBe("skipped");
    expect(f).not.toHaveBeenCalled();
  });
  it("posts to Resend with reply-to set to the sender", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubEnv("CONTACT_ALERT_TO", "me@example.com");
    const f = vi.fn(async () => new Response("{}", { status: 200 }));
    expect(await sendAlert("New message", "body", "ann@example.com", f as never)).toBe("sent");
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(JSON.parse(String(init.body))).toMatchObject({ to: ["me@example.com"], reply_to: "ann@example.com", subject: "New message" });
  });
  it("reports failure instead of throwing, so the saved message stands", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubEnv("CONTACT_ALERT_TO", "me@example.com");
    expect(await sendAlert("s", "t", "a@b.co", (async () => new Response("", { status: 500 })) as never)).toBe("failed");
    expect(await sendAlert("s", "t", "a@b.co", (async () => { throw new Error("down"); }) as never)).toBe("failed");
  });
});
