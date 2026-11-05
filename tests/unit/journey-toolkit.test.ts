import { describe, expect, it } from "vitest";
import { firstHttps, layerZ, parseToolkit, toolkitScroll, toolkitState } from "@/lib/journey/toolkit";

describe("toolkit stack (TKT-88)", () => {
  it("parses '## layer', the how line and bullet tools", () => {
    const md = `Intro text before any heading is ignored.

## Cloud
Event-driven systems on **AWS** at work.
- AWS
- Lambda, SQS
- Lambda

## AI
- LLMs
- [MCP](https://modelcontextprotocol.io)

### Product
Ship it.`;
    expect(parseToolkit(md)).toEqual([
      { name: "Cloud", how: "Event-driven systems on AWS at work.", tools: ["AWS", "Lambda", "SQS"] },
      { name: "AI", how: "", tools: ["LLMs", "MCP"] },
      { name: "Product", how: "Ship it.", tools: [] },
    ]);
  });

  it("returns no layers without headings (the section then falls back to project tags)", () => {
    expect(parseToolkit("Just a paragraph.\n\n- a list")).toEqual([]);
    expect(parseToolkit("")).toEqual([]);
  });

  it("finds the Credly link in a certificate's summary", () => {
    expect(firstHttps("Verify on [Credly](https://www.credly.com/badges/abc) today")).toBe("https://www.credly.com/badges/abc");
    expect(firstHttps("Badge: https://credly.com/x/y")).toBe("https://credly.com/x/y");
    expect(firstHttps("no link http://insecure.example")).toBeUndefined();
  });

  it("lifts layers off one by one, then shows the badges", () => {
    const total = toolkitScroll(3, 2);
    expect(total).toBeCloseTo(0.5 + 2.1 + 0.6);
    const start = toolkitState(0, 3, 2);
    expect(start.active).toBe(0);
    expect(start.certs).toBe(0);
    const end = toolkitState(1, 3, 2);
    expect(end.lift).toEqual([1, 1, 1]);
    expect(end.active).toBe(2);
    expect(end.certs).toBe(1);
    const mid = toolkitState((0.5 + 0.7 * 1.2) / total, 3, 2);
    expect(mid.active).toBe(1);
    expect(mid.lift[1]).toBe(1);
    expect(mid.lift[2]).toBeLessThan(1);
    expect(toolkitState(1, 2, 0).certs).toBe(0);
  });

  it("stacks tight, then spreads each layer above the last", () => {
    expect(layerZ(0, [0, 0, 0])).toBe(0);
    expect(layerZ(2, [0, 0, 0])).toBe(28);
    expect(layerZ(2, [1, 1, 1])).toBe(192);
  });
});
