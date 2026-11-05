"use client"

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react"

import { products } from "@/lib/bakery-data"
import { MAX_QTY, type CartLine } from "@/lib/checkout"

// ---------- Store (kept in localStorage so the cart survives reloads) ----------

const KEY = "bo-bot-cart"
const EMPTY: CartLine[] = []
let lines: CartLine[] = EMPTY
let loaded = false
const listeners = new Set<() => void>()

function sanitize(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return EMPTY
  return value.flatMap((l) => {
    const id = Number(l?.id)
    const qty = Math.min(MAX_QTY, Math.floor(Number(l?.qty)))
    return products.some((p) => p.id === id) && qty > 0 ? [{ id, qty }] : []
  })
}

function load() {
  if (loaded) return
  loaded = true
  try {
    lines = sanitize(JSON.parse(localStorage.getItem(KEY) ?? "[]"))
  } catch {
    lines = EMPTY
  }
}

function commit(next: CartLine[]) {
  lines = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Private mode / storage full: the cart still works for this visit.
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  load()
  listeners.add(listener)
  // Keep several open tabs in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return
    loaded = false
    load()
    listener()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

function getSnapshot() {
  load()
  return lines
}

const getServerSnapshot = () => EMPTY

const actions = {
  add(id: number, qty = 1) {
    const found = lines.find((l) => l.id === id)
    commit(
      found
        ? lines.map((l) =>
            l.id === id ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l
          )
        : [...lines, { id, qty: Math.min(MAX_QTY, qty) }]
    )
  },
  setQty(id: number, qty: number) {
    if (qty <= 0) return actions.remove(id)
    commit(
      lines.map((l) =>
        l.id === id ? { ...l, qty: Math.min(MAX_QTY, qty) } : l
      )
    )
  },
  remove(id: number) {
    commit(lines.filter((l) => l.id !== id))
  },
  clear() {
    commit(EMPTY)
  },
}

// ---------- React API ----------

type CartContextValue = typeof actions & {
  lines: CartLine[]
  items: (CartLine & { product: (typeof products)[number] })[]
  count: number
  subtotal: number
  open: boolean
  setOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )
  const [open, setOpen] = useState(false)

  const value = useMemo<CartContextValue>(() => {
    const items = current.flatMap((l) => {
      const product = products.find((p) => p.id === l.id)
      return product ? [{ ...l, product }] : []
    })
    return {
      ...actions,
      lines: current,
      items,
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal: items.reduce((s, i) => s + i.qty * i.product.price, 0),
      open,
      setOpen,
    }
  }, [current, open])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>")
  return ctx
}
