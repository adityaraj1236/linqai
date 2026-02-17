/** @type {import('next').NextConfig} */
const nextConfig = {
  // Silence Turbopack warning — Next.js 16 uses Turbopack by default
  turbopack: {},

  // Externals for server-side Node modules (Turbopack handles these automatically)
  serverExternalPackages: ['fluent-ffmpeg', '@ffmpeg-installer/ffmpeg'],

  // Increase body size limit for API routes (video uploads)
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },

  // Correct config for API route body size in Next.js 16 Turbopack
  middlewareClientMaxBodySize: 100 * 1024 * 1024, // 100MB in bytes
};

module.exports = nextConfig;