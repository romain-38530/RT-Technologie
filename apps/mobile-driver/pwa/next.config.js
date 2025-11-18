const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.tomtom\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'tomtom-api-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /^http:\/\/localhost:300[0-9]\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'backend-api-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 60 * 60 // 1 hour
        }
      }
    }
  ]
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  experimental: {
    optimizeCss: true
  }
};

module.exports = withPWA(nextConfig);
