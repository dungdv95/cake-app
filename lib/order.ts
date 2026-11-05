// Shared between the order form (client) and the submit action (server).

export const cakeSizes = [
  "16 cm · 4–6 người",
  "20 cm · 8–10 người",
  "24 cm · 12–15 người",
] as const

export type CakeDesign = {
  id: string
  name: string
  desc: string
  /** Starting price for the smallest size; null = quoted after the call. */
  priceFrom: number | null
  image: string | null
}

// Photos: Unsplash (free license), stored in /public/images/mau.
export const cakeDesigns: CakeDesign[] = [
  {
    id: "socola-chay",
    name: "Socola chảy",
    desc: "Cốt socola, sốt ganache chảy, bắt kem bơ.",
    priceFrom: 380000,
    image: "/images/mau/socola-chay.jpg",
  },
  {
    id: "kem-tuoi-berry",
    name: "Kem tươi dâu rừng",
    desc: "Kem tươi trắng, dâu tây và việt quất.",
    priceFrom: 350000,
    image: "/images/mau/kem-tuoi-berry.jpg",
  },
  {
    id: "naked-hoa-tuoi",
    name: "Naked cake hoa tươi",
    desc: "Phủ kem mỏng, trang trí hoa và quả mọng.",
    priceFrom: 420000,
    image: "/images/mau/naked-hoa-tuoi.jpg",
  },
  {
    id: "ombre-bat-bong",
    name: "Ombre bắt bông",
    desc: "Kem bơ chuyển màu, bắt bông từng tầng.",
    priceFrom: 400000,
    image: "/images/mau/ombre-bat-bong.jpg",
  },
  {
    id: "pastel-sinh-nhat",
    name: "Pastel sinh nhật",
    desc: "Tông hồng, cốm màu, hợp tiệc của bé.",
    priceFrom: 450000,
    image: "/images/mau/pastel-sinh-nhat.jpg",
  },
  {
    id: "mau-rieng",
    name: "Theo mẫu riêng",
    desc: "Mô tả ý tưởng ở ô ghi chú, tiệm sẽ báo giá.",
    priceFrom: null,
    image: null,
  },
]

export const CUSTOM_DESIGN_ID = "mau-rieng"

/** Reference photos for a custom design (compressed in the browser before upload). */
export const MAX_PHOTOS = 3
export const MAX_PHOTO_BYTES = 1_200_000
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"]

export type OrderField =
  "mau" | "anh" | "ten" | "sdt" | "ngay" | "co" | "ghichu"

export type OrderState = {
  status: "idle" | "success" | "error"
  message?: string
  errors?: Partial<Record<OrderField, string>>
  /** Echo of what the user typed, so the form keeps it after a failed submit. */
  fields?: Partial<Record<OrderField, string>>
}

export const initialOrderState: OrderState = { status: "idle" }
