const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_PLANNING_API: process.env.NEXT_PUBLIC_PLANNING_API || 'http://localhost:3004',
    NEXT_PUBLIC_ECMR_API: process.env.NEXT_PUBLIC_ECMR_API || 'http://localhost:3009',
    NEXT_PUBLIC_ORDERS_API: process.env.NEXT_PUBLIC_ORDERS_API || 'http://localhost:3001',
  },
};

module.exports = withPWA(nextConfig);
