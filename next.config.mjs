/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';
import runtimeCaching from 'next-pwa/cache.js';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: isDev,
  runtimeCaching,
})(nextConfig);

export default pwaConfig;
