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

export const CUSTOM_DESIGN_ID = "mau-rieng"

/** Always shown last, after the designs from the sheet; enables photo upload. */
export const customDesign: CakeDesign = {
  id: CUSTOM_DESIGN_ID,
  name: "Theo mẫu riêng",
  desc: "Mô tả ý tưởng ở ô ghi chú, tiệm sẽ báo giá.",
  priceFrom: null,
  image: null,
}

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
