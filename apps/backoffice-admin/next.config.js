/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@rt/design-system', '@rt/chatbot-widget'],
  experimental: {
    esmExternals: 'loose',
  },
};
module.exports = nextConfig;
