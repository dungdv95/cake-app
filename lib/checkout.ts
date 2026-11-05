// Shared between the cart checkout form (client) and its server action.

export const MAX_QTY = 20

export type CartLine = { id: string; qty: number }

export type FulfilmentId = "tai-tiem" | "giao-hang"

export const fulfilmentLabels: Record<FulfilmentId, string> = {
  "tai-tiem": "Nhận tại tiệm",
  "giao-hang": "Giao tận nơi",
}

export type CheckoutField =
  "items" | "ten" | "sdt" | "nhan" | "diachi" | "ngay" | "gio" | "ghichu"

export type CheckoutState = {
  status: "idle" | "success" | "error"
  message?: string
  errors?: Partial<Record<CheckoutField, string>>
  fields?: Partial<Record<CheckoutField, string>>
  /** Order code shown to the customer and in the Telegram message. */
  code?: string
}

export const initialCheckoutState: CheckoutState = { status: "idle" }
