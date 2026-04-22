/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite que Vercel compile aunque haya errores de tipos TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
  // Permite que Vercel compile aunque haya warnings de ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
