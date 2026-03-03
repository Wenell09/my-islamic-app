import type { NextConfig } from "next"
import withPWA from "next-pwa"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
    ],
  },
}

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
})(nextConfig)