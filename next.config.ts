import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Add more hosts if needed (e.g., 'res.cloudinary.com')
    ],
  },
}

export default nextConfig