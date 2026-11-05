import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Cake order form can carry up to 3 reference photos (compressed in the
      // browser to ~1 MB each). Keep below Vercel's 4.5 MB request limit.
      bodySizeLimit: "4mb",
    },
  },
}

export default nextConfig
