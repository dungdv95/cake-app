import { CakeLogo } from "./icons"

const links = [
  { href: "#menu", label: "Thực đơn" },
  { href: "#chuyen", label: "Câu chuyện" },
  { href: "#dat-banh", label: "Đặt bánh kem" },
  { href: "#ghe-tiem", label: "Ghé tiệm" },
]

export function SiteHeader() {
  return (
    <header className="z-50 md:sticky md:top-0 border-b border-line bg-cream/85 backdrop-blur-md supports-[backdrop-filter]:bg-cream/75">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-[18px]">
        <a href="#top" className="flex items-center gap-2.5 text-cocoa">
          <span className="flex size-10 items-center justify-center rounded-full bg-sun">
            <CakeLogo className="size-[22px]" />
          </span>
          <span className="font-display text-[1.4rem] font-extrabold tracking-[-0.02em]">
            Bơ &amp; Bột
          </span>
        </a>
        <nav
          aria-label="Điều hướng chính"
          className="flex flex-wrap items-center gap-x-6 gap-y-1 font-medium"
        >
          {links.map((l) => (
            <a key={l.href} href={l.href} className="py-2.5 text-cocoa hover:text-berry">
              {l.label}
            </a>
          ))}
          <a
            href="#dat-banh"
            className="rounded-full bg-cocoa px-5 py-2.5 font-semibold text-cream hover:bg-cocoa/90"
          >
            Đặt bánh
          </a>
        </nav>
      </div>
    </header>
  )
}
