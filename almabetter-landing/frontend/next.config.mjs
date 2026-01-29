import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  reactStrictMode: true,
  // Disable Webpack's persistent filesystem cache to avoid PackFileCacheStrategy OOM
  webpack: (config) => {
    config.cache = false;
    return config;
  },
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
      {
        // Proxy uploads requests to the backend secure route so frontend links work without changing stored URLs
        source: '/uploads/:path*',
        destination: 'http://localhost:5000/secure-uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
