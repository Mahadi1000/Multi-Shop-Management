/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      // Handle subdomain routes - this allows subdomain.localhost to work
      {
        source: '/',
        destination: '/',
        has: [
          {
            type: 'host',
            value: '(?<subdomain>.*)\\.localhost(:\\d+)?',
          },
        ],
      },
    ]
  },
}

export default nextConfig
