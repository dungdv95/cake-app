// Image URL helpers, safe on both server and client.

/** Hosts allowed in next.config.ts → images.remotePatterns (resized + cached by Next). */
const OPTIMIZED_HOSTS = ["lh3.googleusercontent.com"]

/**
 * Turns what the shop typed in the sheet into an image URL:
 * - Google Drive share link  → direct image URL on lh3.googleusercontent.com
 * - any other http(s) URL    → used as is
 * - "croissant.jpg" / "mau/x.jpg" → /images/croissant.jpg (file in public/images)
 * - empty                    → null (coloured tile, no photo)
 */
export function resolveImage(raw: string | undefined | null): string | null {
  const value = (raw ?? "").trim()
  if (!value) return null

  const driveId =
    value.match(/drive\.google\.com\/file\/d\/([\w-]{10,})/)?.[1] ??
    value.match(
      /drive\.google\.com\/(?:open|uc|thumbnail)\?(?:.*&)?id=([\w-]{10,})/
    )?.[1] ??
    value.match(/docs\.google\.com\/uc\?(?:.*&)?id=([\w-]{10,})/)?.[1]
  if (driveId) return `https://lh3.googleusercontent.com/d/${driveId}`

  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith("/")) return value
  return `/images/${value.replace(/^\.?\/*(public\/)?(images\/)?/, "")}`
}

/** next/image can only optimise local files and whitelisted hosts. */
export function canOptimize(src: string) {
  if (src.startsWith("/")) return true
  try {
    return OPTIMIZED_HOSTS.includes(new URL(src).hostname)
  } catch {
    return false
  }
}
