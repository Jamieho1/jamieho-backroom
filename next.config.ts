import type { NextConfig } from "next";
import { PASSLOOP_URL } from "./lib/passloop";

/** Old interview and desktop-app addresses now live on PassLoop (docs/interview.md). All are 308s that keep the query string. */
const pass = (source: string, path: string, has?: { type: "query"; key: string; value?: string }[]) => ({ source, destination: `${PASSLOOP_URL}${path}`, permanent: true as const, ...(has ? { has } : {}) });

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      // Content hub (H2): Articles and Resources became /content. Post and guide pages (/articles/<slug>, /guides/<slug>) stay.
      { source: "/articles", destination: "/content", permanent: true as const },
      { source: "/resources", destination: "/content/guides", permanent: true as const },
      { source: "/guides", destination: "/content/guides", permanent: true as const },
      // The bare /interview rule is separate: a lone `/:path*` produced an empty Location.
      pass("/interview", "/"),
      pass("/interview/:path*", "/:path*"),
      pass("/notes", "/dsa/notes"),
      pass("/practices", "/dsa/practice"),
      pass("/practices/:problem", "/problems/:problem"),
      pass("/behavioral", "/behavioral"),
      pass("/desktop", "/problems/:problem", [{ type: "query", key: "app", value: "practice" }, { type: "query", key: "problem", value: "(?<problem>\\d+)" }]),
      pass("/desktop", "/dsa/practice", [{ type: "query", key: "app", value: "practice" }]),
      pass("/desktop", "/dsa/notes", [{ type: "query", key: "app", value: "notes" }]),
      pass("/desktop", "/behavioral", [{ type: "query", key: "app", value: "behavioral" }]),
    ];
  },
  async headers() {
    return [{source:"/media-sw.js",headers:[{key:"Cache-Control",value:"no-cache"},{key:"Service-Worker-Allowed",value:"/"}]},{source:"/desktop-art/:path*",headers:[{key:"Cache-Control",value:"public, max-age=31536000, immutable"}]}];
  },
};

export default nextConfig;
