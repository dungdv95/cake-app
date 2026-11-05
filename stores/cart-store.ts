import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { MAX_QTY, type CartLine } from "@/lib/checkout"

type CartState = {
  /** Items in the cart (persisted to localStorage). */
  lines: CartLine[]
  /** Whether the cart drawer is open (not persisted). */
  open: boolean

  add: (id: string, qty?: number) => void
  setQty: (id: string, qty: number) => void
  remove: (id: string) => void
  clear: () => void
  setOpen: (open: boolean) => void
}

const clampQty = (qty: number) =>
  Math.min(MAX_QTY, Math.max(0, Math.floor(qty)))

/** Drops malformed lines (e.g. edited by hand in devtools or from an old version). */
function sanitize(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((l) => {
    const id = l?.id == null ? "" : String(l.id)
    const qty = clampQty(Number(l?.qty))
    return id && qty > 0 ? [{ id, qty }] : []
  })
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      open: false,

      add: (id, qty = 1) =>
        set(({ lines }) => {
          const found = lines.find((l) => l.id === id)
          return {
            lines: found
              ? lines.map((l) =>
                  l.id === id ? { ...l, qty: clampQty(l.qty + qty) } : l
                )
              : [...lines, { id, qty: clampQty(qty) }],
          }
        }),

      setQty: (id, qty) => {
        if (qty <= 0) return get().remove(id)
        set(({ lines }) => ({
          lines: lines.map((l) =>
            l.id === id ? { ...l, qty: clampQty(qty) } : l
          ),
        }))
      },

      remove: (id) =>
        set(({ lines }) => ({ lines: lines.filter((l) => l.id !== id) })),

      clear: () => set({ lines: [] }),

      setOpen: (open) => set({ open }),
    }),
    {
      name: "bo-bot-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ lines }) => ({ lines }),
      // Carts saved before the Zustand switch have no version: start them clean.
      migrate: (persisted) => ({
        lines: sanitize((persisted as { lines?: unknown } | undefined)?.lines),
      }),
      merge: (persisted, current) => ({
        ...current,
        lines: sanitize((persisted as { lines?: unknown } | undefined)?.lines),
      }),
      // The page is server-rendered with an empty cart; <CartProvider> loads the
      // saved cart after mount so server and client HTML match.
      skipHydration: true,
    }
  )
)
