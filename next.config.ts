import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // Photos linked from the Google Sheet as Google Drive links
    // (converted to lh3.googleusercontent.com in lib/images.ts).
    remotePatterns: [new URL("https://lh3.googleusercontent.com/d/**")],
  },
  experimental: {
    serverActions: {
      // Cake order form can carry up to 3 reference photos (compressed in the
      // browser to ~1 MB each). Keep below Vercel's 4.5 MB request limit.
      bodySizeLimit: "4mb",
    },
  },
}

export default nextConfig
