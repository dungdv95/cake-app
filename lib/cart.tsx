"use client"

import { createContext, useContext, useEffect, useMemo } from "react"

import type { Product } from "@/lib/bakery-data"
import type { CartLine } from "@/lib/checkout"
import { useCartStore } from "@/stores/cart-store"

// Cart state lives in the Zustand store (stores/cart-store.ts). This file joins
// it with the current menu (from the Google Sheet) to get names, prices and totals.

const ProductsContext = createContext<Product[] | null>(null)

export function CartProvider({
  products,
  children,
}: {
  /** Current menu; lines for items no longer on it are ignored. */
  products: Product[]
  children: React.ReactNode
}) {
  useEffect(() => {
    // Load the saved cart, and keep several open tabs in sync.
    void useCartStore.persist.rehydrate()
    const onStorage = (e: StorageEvent) => {
      if (e.key === useCartStore.persist.getOptions().name) {
        void useCartStore.persist.rehydrate()
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  return (
    <ProductsContext.Provider value={products}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useCart() {
  const products = useContext(ProductsContext)
  if (!products) throw new Error("useCart must be used inside <CartProvider>")

  const rawLines = useCartStore((s) => s.lines)
  const open = useCartStore((s) => s.open)
  const add = useCartStore((s) => s.add)
  const setQty = useCartStore((s) => s.setQty)
  const remove = useCartStore((s) => s.remove)
  const clear = useCartStore((s) => s.clear)
  const setOpen = useCartStore((s) => s.setOpen)

  const derived = useMemo(() => {
    const items = rawLines.flatMap((l) => {
      const product = products.find((p) => p.id === l.id)
      return product ? [{ ...l, product }] : []
    })
    return {
      items,
      // Only lines still on the menu (these are what checkout sends).
      lines: items.map(({ id, qty }): CartLine => ({ id, qty })),
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal: items.reduce((s, i) => s + i.qty * i.product.price, 0),
    }
  }, [rawLines, products])

  return { ...derived, open, setOpen, add, setQty, remove, clear }
}
