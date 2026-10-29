// @vitest-environment jsdom
import { describe, expect, it, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ContactForm } from "@/components/contact-form";
import type { ContactResult } from "@/lib/contact";

afterEach(cleanup);

describe("ContactForm", () => {
  it("keeps what was typed after an error and offers Try again", async () => {
    const action = async (_: ContactResult | null, f: FormData): Promise<ContactResult> => ({
      ok: false,
      message: "Couldn't send.",
      values: { name: String(f.get("name")), email: "ann@example.com", need: "Hello", budget: "" },
    });
    render(<ContactForm action={action} />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Ann" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect((await screen.findByRole("alert")).textContent).toMatch(/Couldn't send/);
    expect((screen.getByLabelText("What do you need?") as HTMLTextAreaElement).value).toBe("Hello");
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
  });
  it("shows a thank-you once saved", async () => {
    render(<ContactForm action={async () => ({ ok: true, message: "Thanks, your message is in." })} />);
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect((await screen.findByRole("status")).textContent).toMatch(/Thanks/);
  });
  it("hides the honeypot from people and screen readers", () => {
    render(<ContactForm action={async () => ({ ok: true, message: "" })} />);
    const hp = document.querySelector('input[name="website"]')!;
    expect(hp.getAttribute("tabindex")).toBe("-1");
    expect(hp.closest("[aria-hidden=true]")).toBeTruthy();
    expect(screen.queryByLabelText(/Website/)).toBeTruthy(); // present in the DOM, but aria-hidden
  });
});
