"use client"

import Image, { type ImageProps } from "next/image"
import { useState } from "react"

import { canOptimize } from "@/lib/images"

/**
 * next/image for photos whose URL comes from the Google Sheet: optimises local
 * and Google Drive images, passes other hosts through untouched, and renders
 * `fallback` instead of a broken image when the URL is empty or fails to load.
 */
export function SmartImage({
  src,
  alt,
  fallback = null,
  ...props
}: Omit<ImageProps, "src"> & {
  src: string | null
  fallback?: React.ReactNode
}) {
  const [failed, setFailed] = useState<string | null>(null)

  if (!src || failed === src) return <>{fallback}</>
  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      unoptimized={!canOptimize(src)}
      onError={() => setFailed(src)}
    />
  )
}
