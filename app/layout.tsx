import type { Metadata, Viewport } from "next"
import {
  Be_Vietnam_Pro,
  Bricolage_Grotesque,
  Geist_Mono,
} from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const bodyFont = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
})

const displayFont = Bricolage_Grotesque({
  subsets: ["latin", "vietnamese"],
  axes: ["opsz"],
  variable: "--font-display",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

// Absolute base for share links/thumbnails. Set NEXT_PUBLIC_SITE_URL once you
// have a custom domain; on Vercel it falls back to the production URL.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")

const description =
  "Bánh mì giòn vỏ, bánh ngọt kiểu Pháp và bánh kem làm theo yêu cầu — nướng mỗi sáng tại tiệm. Đặt bánh online, nhận tại tiệm hoặc giao tận nơi."

// Icons (app/favicon.ico, app/icon.svg, app/apple-icon.png) and the share image
// (app/opengraph-image.tsx) are picked up automatically by Next.js.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tiệm bánh Bơ & Bột — Bánh nướng mỗi ngày",
    template: "%s · Bơ & Bột",
  },
  description,
  applicationName: "Bơ & Bột",
  keywords: [
    "tiệm bánh",
    "bánh mì",
    "bánh ngọt",
    "bánh kem",
    "bánh sinh nhật",
    "croissant",
    "đặt bánh online",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    siteName: "Bơ & Bột",
    title: "Tiệm bánh Bơ & Bột — Bánh nướng mỗi ngày, thơm từ đầu ngõ",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Tiệm bánh Bơ & Bột",
    description,
  },
  appleWebApp: { title: "Bơ & Bột", statusBarStyle: "default" },
  formatDetection: { telephone: true },
}

export const viewport: Viewport = {
  themeColor: "#FFFCF5",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={cn(
        "font-sans antialiased",
        bodyFont.variable,
        displayFont.variable,
        fontMono.variable
      )}
    >
      <body>
        {/* The bakery design is light-only, so lock the theme. */}
        <ThemeProvider forcedTheme="light">{children}</ThemeProvider>
      </body>
    </html>
  )
}
