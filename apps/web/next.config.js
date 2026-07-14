/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Reduces first-load compilation time by allowing more workers
  experimental: {
    // Pre-warm common routes at dev server start so first visit is instant
    workerThreads: false,
    cpus: 1,
  },

  images: {
    domains: [
      'maps.googleapis.com',
      'lh3.googleusercontent.com',
      'ui-avatars.com',
      'images.unsplash.com',
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
