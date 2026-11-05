import type { SVGProps } from "react"

export function CakeLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 14c0-4 3.6-7 8-7s8 3 8 7" />
      <path d="M3 14h18v2a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z" />
      <path d="M9 7.5 10 11M15 7.5 14 11" />
    </svg>
  )
}
