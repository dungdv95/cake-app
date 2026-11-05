import type { Metadata } from "next"
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

export const metadata: Metadata = {
  title: "Tiệm bánh Bơ & Bột",
  description:
    "Bánh mì giòn vỏ, bánh ngọt kiểu Pháp và bánh kem làm theo yêu cầu — nướng mỗi sáng tại tiệm.",
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
