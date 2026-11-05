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
  id: number
  cat: CategoryId
  name: string
  desc: string
  price: number
  image: string
}

// Photos: Unsplash (free license), stored in /public/images.
export const products: Product[] = [
  {
    id: 1,
    cat: "mi",
    name: "Croissant bơ",
    desc: "Nhiều lớp bột ngàn lớp, vỏ giòn, ruột mềm thơm bơ.",
    price: 35000,
    image: "/images/croissant-bo.jpg",
  },
  {
    id: 2,
    cat: "mi",
    name: "Bánh mì hoa cúc",
    desc: "Mềm xốp, ngọt nhẹ, hợp ăn sáng với trà hay cà phê.",
    price: 45000,
    image: "/images/banh-mi-hoa-cuc.jpg",
  },
  {
    id: 3,
    cat: "mi",
    name: "Bánh mì bơ tỏi",
    desc: "Phết bơ tỏi phô mai, nướng vàng thơm lừng.",
    price: 30000,
    image: "/images/banh-mi-bo-toi.jpg",
  },
  {
    id: 4,
    cat: "ngot",
    name: "Tart trứng",
    desc: "Đế giòn, nhân trứng sữa béo mịn, ăn nóng là ngon nhất.",
    price: 18000,
    image: "/images/tart-trung.jpg",
  },
  {
    id: 5,
    cat: "ngot",
    name: "Su kem",
    desc: "Vỏ su mỏng, nhân kem vani mát lạnh.",
    price: 15000,
    image: "/images/su-kem.jpg",
  },
  {
    id: 6,
    cat: "ngot",
    name: "Bông lan trứng muối",
    desc: "Cốt bông lan mềm, sốt bơ, chà bông và trứng muối.",
    price: 65000,
    image: "/images/bong-lan-trung-muoi.jpg",
  },
  {
    id: 7,
    cat: "kem",
    name: "Bánh kem dâu",
    desc: "Cốt vani, kem tươi và dâu tây tươi.",
    price: 350000,
    image: "/images/banh-kem-dau.jpg",
  },
  {
    id: 8,
    cat: "kem",
    name: "Tiramisu",
    desc: "Kem mascarpone, cà phê và bột cacao.",
    price: 55000,
    image: "/images/tiramisu.jpg",
  },
]

export function formatPrice(vnd: number) {
  return new Intl.NumberFormat("vi-VN").format(vnd) + "đ"
}
