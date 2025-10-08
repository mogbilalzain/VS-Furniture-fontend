/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:8000/api',
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      // Allow all localhost traffic
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      // Production domains
      {
        protocol: 'https',
        hostname: 'miminnovations.com',
      },
      {
        protocol: 'https',
        hostname: 'api.vsfurniture.com',
      },
      // Allow any HTTPS domain
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Image optimization settings
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  devIndicators: {
    buildActivity: false,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
}

export default nextConfig