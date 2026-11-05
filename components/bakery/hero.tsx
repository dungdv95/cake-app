import Image from "next/image"

import { formatPrice, products } from "@/lib/bakery-data"

const featured = products[0]

export function Hero() {
  return (
    <section
      id="top"
      className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-center gap-14 px-6 pt-[72px] pb-[88px]"
    >
      <div className="flex flex-col gap-6">
        <span className="self-start rounded-full bg-blush px-3.5 py-1.5 text-sm font-semibold text-berry">
          Ra lò mỗi sáng từ 6:00
        </span>
        <h1 className="font-display text-[clamp(2.75rem,6vw,4.75rem)] leading-[1.02] font-extrabold tracking-[-0.035em]">
          Bánh nướng mỗi ngày, thơm từ đầu ngõ.
        </h1>
        <p className="max-w-[30rem] text-[1.15rem] text-cocoa-soft">
          Bánh mì giòn vỏ, bánh ngọt kiểu Pháp và bánh kem làm theo yêu cầu —
          nhồi bột, nướng và trang trí ngay tại tiệm.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="#menu"
            className="rounded-full bg-cocoa px-7 py-3.5 font-semibold text-cream hover:bg-cocoa/90"
          >
            Xem thực đơn
          </a>
          <a
            href="#dat-banh"
            className="rounded-full border-2 border-cocoa px-[26px] py-3 font-semibold text-cocoa hover:bg-cocoa hover:text-cream"
          >
            Đặt bánh kem
          </a>
        </div>
      </div>

      <div className="relative min-h-[440px]">
        <div className="absolute inset-[0_40px_40px_0] overflow-hidden rounded-[48px_48px_200px_48px] bg-sun">
          <Image
            src="/images/hero-croissant.jpg"
            alt="Những chiếc croissant bơ vừa ra lò được rắc bột"
            fill
            preload
            sizes="(min-width: 1200px) 560px, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute right-0 bottom-0 flex flex-col gap-1 rounded-3xl border border-line bg-cream px-6 py-5 shadow-[0_12px_32px_rgba(42,24,16,0.10)]">
          <span className="text-[0.8rem] font-semibold tracking-[0.08em] text-berry uppercase">
            Bánh của ngày
          </span>
          <span className="font-display text-[1.35rem] font-bold">
            {featured.name}
          </span>
          <span className="text-cocoa-soft">{formatPrice(featured.price)}</span>
        </div>
      </div>
    </section>
  )
}
