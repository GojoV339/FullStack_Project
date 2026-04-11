const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'food-images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\/api\/menu\/.*/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'menu-data',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 5 * 60,
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/**',
      },
    ],
  },
};

module.exports = withPWA(nextConfig);
