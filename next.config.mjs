/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['placeholder.com'],
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/:tenant/dashboard',
        destination: '/app/(tenant)/dashboard',
        permanent: true,
      },
      {
        source: '/:tenant/bookings',
        destination: '/app/(tenant)/bookings',
        permanent: true,
      },
      {
        source: '/:tenant/clients',
        destination: '/app/(tenant)/clients',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
