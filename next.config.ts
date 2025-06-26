import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL('https://api.woovi-sandbox.com/**'), new URL('https://api.woovi.com/**')],
  },
};

export default nextConfig;
