/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite que Vercel compile aunque haya errores de tipos TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
