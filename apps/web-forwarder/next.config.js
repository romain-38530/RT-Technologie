/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['@rt/chatbot-widget'],

  // Désactiver ESLint pendant le build
  eslint: {
    ignoreDuringBuilds: true,
  },

  env: {
    NEXT_PUBLIC_AFFRET_IA_URL: process.env.NEXT_PUBLIC_AFFRET_IA_URL || 'http://localhost:3010',
  },
};
module.exports = nextConfig;
