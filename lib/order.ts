// Shared between the order form (client) and the submit action (server).

export const cakeSizes = [
  "16 cm · 4–6 người",
  "20 cm · 8–10 người",
  "24 cm · 12–15 người",
] as const

export type OrderField = "ten" | "sdt" | "ngay" | "co" | "ghichu"

export type OrderState = {
  status: "idle" | "success" | "error"
  message?: string
  errors?: Partial<Record<OrderField, string>>
  /** Echo of what the user typed, so the form keeps it after a failed submit. */
  fields?: Partial<Record<OrderField, string>>
}

export const initialOrderState: OrderState = { status: "idle" }
