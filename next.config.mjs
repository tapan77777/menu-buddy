// next.config.js

/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';
import runtimeCaching from 'next-pwa/cache.js';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  images: {
    domains: ['example.com', 'res.cloudinary.com'],
  },
  // Any other Next.js configs go here
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: isDev,
  runtimeCaching,
})(nextConfig);

export default pwaConfig;
