/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [],
  env: {
    NEXT_PUBLIC_API_CORE_ORDERS: process.env.NEXT_PUBLIC_API_CORE_ORDERS || 'http://localhost:3001',
    NEXT_PUBLIC_API_PLANNING: process.env.NEXT_PUBLIC_API_PLANNING || 'http://localhost:3004',
    NEXT_PUBLIC_API_NOTIFICATIONS: process.env.NEXT_PUBLIC_API_NOTIFICATIONS || 'http://localhost:3002',
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
