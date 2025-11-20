/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/orders/:path*',
        destination: `${process.env.CORE_ORDERS_URL || 'http://localhost:3001'}/carrier/:path*`,
      },
      {
        source: '/api/planning/:path*',
        destination: `${process.env.PLANNING_URL || 'http://localhost:3004'}/planning/:path*`,
      },
      {
        source: '/api/ecpmr/:path*',
        destination: `${process.env.ECPMR_URL || 'http://localhost:3009'}/ecpmr/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
