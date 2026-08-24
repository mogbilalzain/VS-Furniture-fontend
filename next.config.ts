/** @type {import('next').NextConfig} */
const nextConfig = {

  output: 'standalone',
  images: {
    remotePatterns: [
      // Production
      {
        protocol: 'https',
        hostname: 'vsme.ae',
      },
      {
        protocol: 'https',
        hostname: 'www.vsme.ae',
      },
      // Laravel dev (تأكّد أنها تطابق `php artisan serve`)
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
        port: '8001',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8001',
      },
      // الإبقاء على دومين الإنتاج القديم لأي صور قديمة مخزّنة
      {
        protocol: 'https',
        hostname: 'miminnovations.com',
      },
      // imgproxy / media CDN
      {
        protocol: 'https',
        hostname: 'media-vs.org',
      },
      {
        protocol: 'https',
        hostname: 'www.media-vs.org',
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
    removeConsole: process.env.NODE_ENV === "development",
  },
}

export default nextConfig