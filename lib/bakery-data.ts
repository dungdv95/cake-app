export type CategoryId = "mi" | "ngot" | "kem"
export type FilterId = "all" | CategoryId

export const categoryLabels: Record<FilterId, string> = {
  all: "Tất cả",
  mi: "Bánh mì",
  ngot: "Bánh ngọt",
  kem: "Bánh kem",
}

export const filters: FilterId[] = ["all", "mi", "ngot", "kem"]

export const tileClass: Record<CategoryId, string> = {
  mi: "bg-tile-bread",
  ngot: "bg-tile-pastry",
  kem: "bg-tile-cake",
}

export type Product = {
  id: string
  cat: CategoryId
  name: string
  desc: string
  price: number
  /** Image URL (Google Drive or other); null = coloured tile only. */
  image: string | null
}

export function formatPrice(vnd: number) {
  return new Intl.NumberFormat("vi-VN").format(vnd) + "đ"
}
