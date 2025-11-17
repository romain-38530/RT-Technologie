/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [],
  env: {
    NEXT_PUBLIC_API_CORE_ORDERS: process.env.NEXT_PUBLIC_API_CORE_ORDERS || 'http://localhost:3001',
    NEXT_PUBLIC_API_PLANNING: process.env.NEXT_PUBLIC_API_PLANNING || 'http://localhost:3004',
    NEXT_PUBLIC_API_ECMR: process.env.NEXT_PUBLIC_API_ECMR || 'http://localhost:3009',
    NEXT_PUBLIC_API_TRACKING: process.env.NEXT_PUBLIC_API_TRACKING || 'http://localhost:3008',
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
