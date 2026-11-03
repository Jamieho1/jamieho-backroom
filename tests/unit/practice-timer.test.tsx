// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PracticeTimer, formatElapsed } from "@/components/practice/timer";

describe("practice timer", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-03T10:00:00Z")); });
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it("formats mm:ss and h:mm:ss", () => {
    expect(formatElapsed(0)).toBe("00:00");
    expect(formatElapsed(65_400)).toBe("01:05");
    expect(formatElapsed(3_725_000)).toBe("1:02:05");
  });

  it("only runs between the user's start and pause, and resets", () => {
    render(<PracticeTimer title="Two Sum" />);
    const time = screen.getByRole("timer");
    act(() => { vi.advanceTimersByTime(5000); });
    expect(time.textContent).toBe("00:00");
    fireEvent.click(screen.getByRole("button", { name: "Start timer" }));
    act(() => { vi.advanceTimersByTime(3000); });
    expect(time.textContent).toBe("00:03");
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    act(() => { vi.advanceTimersByTime(10_000); });
    expect(time.textContent).toBe("00:03");
    fireEvent.click(screen.getByRole("button", { name: "Resume" }));
    act(() => { vi.advanceTimersByTime(2000); });
    expect(time.textContent).toBe("00:05");
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(time.textContent).toBe("00:00");
    expect(screen.getByRole("button", { name: "Start timer" })).toBeTruthy();
  });
});
