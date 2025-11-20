/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@rt/chatbot-widget'],
  env: {
    NEXT_PUBLIC_AFFRET_IA_URL: process.env.AFFRET_IA_URL || 'http://localhost:3005',
  },
};
module.exports = nextConfig;
