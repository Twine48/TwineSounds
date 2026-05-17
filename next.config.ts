import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'loanpro-4b6d6.firebasestorage.app',
      },
    ],
  },
  headers: async () => [
    {
      source: '/sw.js',
      headers: [
        {
          key: 'Service-Worker-Allowed',
          value: '/',
        },
        {
          key: 'Cache-Control',
          value: 'no-cache',
        },
      ],
    },
  ],
};

export default nextConfig;
