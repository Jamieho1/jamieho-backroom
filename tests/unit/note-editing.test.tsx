// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NotesReader } from "@/components/notes/reader";
import { validateNoteEdit, type NoteRow } from "@/lib/notes";
import type { NoteSaveResult } from "@/app/actions/notes";
const note: NoteRow = { id:"sample",title:"Sample",body:"Original body",free:"Original free notes",visual:[],sort:1,updated_at:"2026-10-31T00:00:00Z" };
vi.mock("@/app/actions/notes", () => ({ saveNote:vi.fn() }));
afterEach(cleanup);
it("keeps both draft fields after a failed save, then Retry saves and displays them", async () => {
  const save=vi.fn().mockResolvedValueOnce({ok:false,message:"Couldn't save. Your draft is still here — retry."})
    .mockResolvedValueOnce({ok:true,body:"New body",free:"New free notes",updated_at:"2026-10-31T15:00:00Z"});
  render(<NotesReader notes={[note]} canEdit save={save} />);
  fireEvent.click(screen.getByRole("button",{name:"Edit note"}));
  fireEvent.change(screen.getByLabelText("Note body (Markdown)"),{target:{value:"New body"}});
  fireEvent.change(screen.getByLabelText("Free notes (Markdown)"),{target:{value:"New free notes"}});
  fireEvent.click(screen.getByRole("button",{name:"Save"}));
  await screen.findByRole("button",{name:"Retry"});
  expect((screen.getByLabelText("Note body (Markdown)") as HTMLTextAreaElement).value).toBe("New body");
  expect((screen.getByLabelText("Free notes (Markdown)") as HTMLTextAreaElement).value).toBe("New free notes");
  expect(screen.getByRole("alert").textContent).toMatch(/draft is still here/);
  fireEvent.click(screen.getByRole("button",{name:"Retry"}));
  await screen.findByText("Saved.");
  expect(save).toHaveBeenNthCalledWith(2,"sample",{body:"New body",free:"New free notes"});
  expect(screen.getByText("New body")).toBeTruthy();
  expect(screen.getByRole("region",{name:"Free notes"}).textContent).toContain("New free notes");
  fireEvent.click(screen.getByRole("button",{name:"Edit note"}));
  expect((screen.getByLabelText("Free notes (Markdown)") as HTMLTextAreaElement).value).toBe("New free notes");
});
it("handles network exceptions without losing the draft", async () => {
  const save=vi.fn().mockRejectedValue(new Error("offline"));
  render(<NotesReader notes={[note]} canEdit save={save} />);
  fireEvent.click(screen.getByRole("button",{name:"Edit note"}));
  fireEvent.change(screen.getByLabelText("Note body (Markdown)"),{target:{value:"Unsaved"}});
  fireEvent.click(screen.getByRole("button",{name:"Save"}));
  await screen.findByRole("button",{name:"Retry"});
  expect((screen.getByLabelText("Note body (Markdown)") as HTMLTextAreaElement).value).toBe("Unsaved");
});
it("Cancel discards the draft, and topic switches are disabled while editing", () => {
  const save=vi.fn();
  render(<NotesReader notes={[note,{...note,id:"other",title:"Other"}]} canEdit save={save} />);
  fireEvent.click(screen.getByRole("button",{name:"Edit note"}));
  expect((screen.getByRole("button",{name:"Other"}) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.change(screen.getByLabelText("Note body (Markdown)"),{target:{value:"Discard"}});
  fireEvent.click(screen.getByRole("button",{name:"Cancel"}));
  expect(save).not.toHaveBeenCalled();
  expect(screen.getByText("Original body")).toBeTruthy();
});
it("visitors can read free notes but have no editor", () => {
  render(<NotesReader notes={[note]} />);
  expect(screen.getByText("Original free notes")).toBeTruthy();
  expect(screen.queryByRole("button",{name:"Edit note"})).toBeNull();
  expect(screen.queryByRole("textbox")).toBeNull();
});
it("disables fields while saving so later typing cannot be lost", async () => {
  let finish!: (v:NoteSaveResult)=>void;
  const save=vi.fn(()=>new Promise<NoteSaveResult>(resolve=>{finish=resolve;}));
  render(<NotesReader notes={[note]} canEdit save={save} />);
  fireEvent.click(screen.getByRole("button",{name:"Edit note"}));
  fireEvent.click(screen.getByRole("button",{name:"Save"}));
  await waitFor(()=>expect((screen.getByLabelText("Note body (Markdown)") as HTMLTextAreaElement).disabled).toBe(true));
  finish({ok:false,message:"Try again"});
  await screen.findByRole("button",{name:"Retry"});
  expect((screen.getByLabelText("Note body (Markdown)") as HTMLTextAreaElement).disabled).toBe(false);
});
it("validates types and bounds without stripping Markdown whitespace", () => {
  expect(validateNoteEdit("sample",{body:"  indented\n",free:""})).toBeNull();
  expect(validateNoteEdit("../sample",{body:"x",free:""})).toMatch(/valid note/);
  expect(validateNoteEdit("sample",{body:1,free:""})).toBeTruthy();
  expect(validateNoteEdit("sample",{body:"x".repeat(200001),free:""})).toMatch(/200,000/);
});
