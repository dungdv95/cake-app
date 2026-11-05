"use client"

import { ShoppingBag } from "lucide-react"

import { formatPrice } from "@/lib/bakery-data"
import { useCart } from "@/lib/cart"

/** Cart icon with item count, shown in the header. */
export function CartButton() {
  const { count, setOpen } = useCart()
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={count > 0 ? `Giỏ hàng, ${count} món` : "Giỏ hàng"}
      className="relative flex size-11 cursor-pointer items-center justify-center rounded-full text-cocoa hover:bg-cocoa/10"
    >
      <ShoppingBag className="size-6" strokeWidth={1.8} aria-hidden="true" />
      {count > 0 && (
        <span
          key={count /* re-mount to replay the pop animation */}
          className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 animate-in items-center justify-center rounded-full bg-berry px-1 text-[0.7rem] font-bold text-white duration-200 zoom-in-50"
        >
          {count}
        </span>
      )}
    </button>
  )
}

/** Sticky bottom bar on phones, where the header scrolls away. */
export function MobileCartBar() {
  const { count, subtotal, open, setOpen } = useCart()
  if (count === 0 || open) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-3 md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-14 w-full animate-in cursor-pointer items-center justify-between gap-3 rounded-full bg-cocoa px-5 text-cream shadow-[0_12px_32px_rgba(42,24,16,0.35)] fade-in slide-in-from-bottom-4"
      >
        <span className="flex items-center gap-2 font-semibold">
          <ShoppingBag className="size-5" aria-hidden="true" />
          Giỏ hàng · {count} món
        </span>
        <span className="font-semibold tabular-nums">
          {formatPrice(subtotal)}
        </span>
      </button>
    </div>
  )
}
