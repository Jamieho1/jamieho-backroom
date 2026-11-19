// @vitest-environment jsdom
import { describe, expect, it, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ContactForm } from "@/components/contact-form";
import type { ContactResult } from "@/lib/contact";

afterEach(cleanup);

describe("ContactForm",()=>{
 it("shows accessible reason chips, optional message and project-only fields",()=>{render(<ContactForm action={async()=>({ok:false,message:"Retry"})}/>);expect(screen.getByLabelText("Name").hasAttribute("required")).toBe(true);expect(screen.getByLabelText("Tell me about it (optional)").hasAttribute("required")).toBe(false);expect(screen.queryByRole("checkbox",{name:"AI engineering"})).toBeNull();fireEvent.click(screen.getByRole("radio",{name:/^Project$/}));expect(screen.getByRole("checkbox",{name:"AI engineering"})).toBeTruthy();fireEvent.click(screen.getByRole("radio",{name:"Just saying hi"}));expect(screen.queryByRole("checkbox",{name:"AI engineering"})).toBeNull();});
 it("keeps entered fields after a server failure and permits retry",async()=>{render(<ContactForm action={async()=>({ok:false,message:"Could not save. Retry."})}/>);fireEvent.click(screen.getByRole("radio",{name:"Just saying hi"}));fireEvent.change(screen.getByLabelText("Name"),{target:{value:"Synthetic"}});fireEvent.change(screen.getByLabelText("Email"),{target:{value:"synthetic@example.test"}});fireEvent.submit(screen.getByRole("form",{name:"Contact"}));expect((await screen.findByRole("alert")).textContent).toContain("Could not save");expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("Synthetic");expect(screen.getByRole("button",{name:"Try again"})).toBeTruthy();});
 it("reports required errors without calling the action",async()=>{let sent=false;render(<ContactForm action={async()=>{sent=true;return{ok:true,message:"Saved"}}}/>);fireEvent.submit(screen.getByRole("form",{name:"Contact"}));expect(screen.getAllByRole("alert").length).toBe(3);expect(sent).toBe(false);});
 it("hides the honeypot",()=>{render(<ContactForm action={async()=>({ok:true,message:"Saved"})}/>);const hp=document.querySelector('input[name="website"]')!;expect(hp.getAttribute("tabindex")).toBe("-1");expect(hp.closest('[aria-hidden="true"]')).toBeTruthy();});
});
