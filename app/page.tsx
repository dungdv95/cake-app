import { CartDrawer } from "@/components/bakery/cart-drawer"
import { MobileCartBar } from "@/components/bakery/cart-button"
import { Hero } from "@/components/bakery/hero"
import { MenuSection } from "@/components/bakery/menu-section"
import { OrderSection } from "@/components/bakery/order-section"
import { SiteHeader } from "@/components/bakery/site-header"
import { StorySection } from "@/components/bakery/story-section"
import { VisitSection } from "@/components/bakery/visit-section"
import { CartProvider } from "@/lib/cart"
import { getCakeDesigns, getProducts } from "@/lib/catalog"

// Re-read the Google Sheets at most every 5 minutes (see lib/catalog.ts).
export const revalidate = 300

export default async function Page() {
  const [products, designs] = await Promise.all([
    getProducts(),
    getCakeDesigns(),
  ])

  return (
    <CartProvider products={products}>
      <div className="min-h-svh bg-cream text-cocoa">
        <SiteHeader />
        <main>
          <Hero featured={products[0]} />
          <MenuSection products={products} />
          <StorySection />
          <OrderSection designs={designs} />
          <VisitSection />
        </main>
        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-3 px-6 py-7 text-[0.9rem] text-cocoa-soft">
            <span className="font-display text-[1.1rem] font-extrabold text-cocoa">
              Bơ &amp; Bột
            </span>
            <span>© 2026 Tiệm bánh Bơ &amp; Bột</span>
          </div>
        </footer>
        <CartDrawer />
        <MobileCartBar />
      </div>
    </CartProvider>
  )
}
