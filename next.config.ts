import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['react-simple-maps'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
