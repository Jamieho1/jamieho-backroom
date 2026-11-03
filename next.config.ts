import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    const csp = "default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self'; worker-src 'none'; frame-ancestors 'none'";
    return [{source:"/desktop-art/:path*",headers:[{key:"Cache-Control",value:"public, max-age=31536000, immutable"}]},{ source: "/runner/:path*", headers: [{ key: "Content-Security-Policy", value: csp }, { key: "X-Content-Type-Options", value: "nosniff" }] }];
  },
};

export default nextConfig;
