"use client"

import { useRef, useState } from "react"
import { Check, Plus } from "lucide-react"

import {
  categoryLabels,
  filters,
  formatPrice,
  tileClass,
  type FilterId,
  type Product,
} from "@/lib/bakery-data"
import { useCart } from "@/lib/cart"
import { cn } from "@/lib/utils"

import { CakeLogo } from "./icons"
import { SmartImage } from "./smart-image"

export function MenuSection({ products }: { products: Product[] }) {
  const [cat, setCat] = useState<FilterId>("all")
  const shown = products.filter((p) => cat === "all" || p.cat === cat)

  return (
    <section id="menu" className="bg-butter px-6 py-[88px]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
        <div className="reveal flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-berry">Thực đơn</span>
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-extrabold tracking-[-0.03em]">
              Hôm nay có gì trong lò?
            </h2>
          </div>
          <div
            role="group"
            aria-label="Lọc theo loại bánh"
            className="flex flex-wrap gap-2"
          >
            {filters.map((f) => {
              const on = f === cat
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setCat(f)}
                  className={cn(
                    "min-h-11 cursor-pointer rounded-full border-2 border-cocoa px-5 py-2.5 font-semibold transition-colors",
                    on
                      ? "bg-cocoa text-cream"
                      : "bg-transparent text-cocoa hover:bg-cocoa/10"
                  )}
                >
                  {categoryLabels[f]}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(250px,100%),1fr))] gap-6">
          {shown.map((p) => (
            <article
              key={p.id}
              className="reveal flex flex-col gap-3.5 rounded-[28px] bg-cream p-3.5"
            >
              <div
                className={cn(
                  "relative aspect-[4/3] overflow-hidden rounded-[20px]",
                  tileClass[p.cat]
                )}
              >
                <SmartImage
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="(min-width: 1200px) 280px, (min-width: 640px) 45vw, 100vw"
                  className="object-cover"
                  fallback={
                    <span className="flex h-full items-center justify-center">
                      <CakeLogo className="size-14 text-cocoa/60" />
                    </span>
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5 px-2 pb-2">
                <span className="text-[0.78rem] font-semibold tracking-[0.08em] text-berry uppercase">
                  {categoryLabels[p.cat]}
                </span>
                <h3 className="font-display text-xl leading-[1.2] font-bold">
                  {p.name}
                </h3>
                <p className="text-[0.95rem] text-cocoa-soft">{p.desc}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-semibold">{formatPrice(p.price)}</span>
                  <AddToCartButton id={p.id} name={p.name} />
                </div>
              </div>
            </article>
          ))}
        </div>
        {shown.length === 0 && (
          <p className="rounded-[28px] bg-cream px-6 py-10 text-center text-cocoa-soft">
            Hôm nay loại bánh này tạm hết, bạn xem các loại khác nhé.
          </p>
        )}
      </div>
    </section>
  )
}

function AddToCartButton({ id, name }: { id: string; name: string }) {
  const { add, lines } = useCart()
  const [justAdded, setJustAdded] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const inCart = lines.find((l) => l.id === id)?.qty ?? 0

  function handleClick() {
    add(id)
    setJustAdded(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <div className="flex items-center gap-2">
      {inCart > 0 && (
        <span className="rounded-full bg-tile-bread px-2.5 py-1 text-xs font-semibold">
          {inCart} trong giỏ
        </span>
      )}
      <button
        type="button"
        onClick={handleClick}
        aria-label={`Thêm ${name} vào giỏ`}
        className={cn(
          "flex size-11 cursor-pointer items-center justify-center rounded-full text-cream transition-colors active:scale-95",
          justAdded ? "bg-berry" : "bg-cocoa hover:bg-cocoa/90"
        )}
      >
        {justAdded ? (
          <Check className="size-5 animate-in zoom-in-50" aria-hidden="true" />
        ) : (
          <Plus className="size-5" aria-hidden="true" />
        )}
      </button>
      <span role="status" className="sr-only">
        {justAdded ? `Đã thêm ${name} vào giỏ` : ""}
      </span>
    </div>
  )
}
