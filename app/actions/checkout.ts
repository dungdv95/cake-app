"use server"

import { formatPrice, products } from "@/lib/bakery-data"
import {
  fulfilmentLabels,
  MAX_QTY,
  type CheckoutField,
  type CheckoutState,
  type FulfilmentId,
} from "@/lib/checkout"
import {
  escapeHtml,
  formatDateVN,
  isIsoDate,
  normalizePhone,
  sendErrorMessage,
  sendTelegram,
  todayVN,
} from "@/lib/telegram"

/** Cart checkout: prices are recomputed here from the menu, never trusted from the browser. */
export async function submitCartOrder(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim()

  if (get("website") !== "") {
    return { status: "success", code: "—" }
  }

  const fields = {
    ten: get("ten"),
    sdt: get("sdt"),
    nhan: get("nhan"),
    diachi: get("diachi"),
    ngay: get("ngay"),
    gio: get("gio"),
    ghichu: get("ghichu"),
  }
  const errors: Partial<Record<CheckoutField, string>> = {}

  // --- Items ---
  let lines: { name: string; qty: number; price: number }[] = []
  try {
    const raw = JSON.parse(get("items") || "[]") as unknown
    if (!Array.isArray(raw) || raw.length === 0 || raw.length > products.length)
      throw 0
    lines = raw.map((l) => {
      const p = products.find((x) => x.id === Number(l?.id))
      const qty = Number(l?.qty)
      if (!p || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) throw 0
      return { name: p.name, qty, price: p.price }
    })
  } catch {
    errors.items = "Giỏ hàng không hợp lệ, vui lòng tải lại trang."
  }

  // --- Customer ---
  if (fields.ten.length < 2 || fields.ten.length > 80)
    errors.ten = "Vui lòng nhập họ tên."
  const phone = normalizePhone(fields.sdt)
  if (!phone) errors.sdt = "Số điện thoại chưa đúng (ví dụ 0912 345 678)."

  const nhan = fields.nhan as FulfilmentId
  if (!(nhan in fulfilmentLabels)) errors.nhan = "Vui lòng chọn cách nhận hàng."
  if (
    nhan === "giao-hang" &&
    (fields.diachi.length < 8 || fields.diachi.length > 300)
  ) {
    errors.diachi = "Vui lòng nhập địa chỉ giao hàng."
  }

  if (!isIsoDate(fields.ngay)) errors.ngay = "Vui lòng chọn ngày nhận."
  else if (fields.ngay < todayVN())
    errors.ngay = "Ngày nhận không được ở quá khứ."
  if (fields.gio && !/^\d{2}:\d{2}$/.test(fields.gio))
    errors.gio = "Giờ chưa đúng."
  if (fields.ghichu.length > 1000) errors.ghichu = "Ghi chú tối đa 1000 ký tự."

  if (Object.keys(errors).length > 0 || !phone) {
    return {
      status: "error",
      message: errors.items ?? "Vui lòng kiểm tra lại thông tin.",
      errors,
      fields,
    }
  }

  // --- Send ---
  const total = lines.reduce((s, l) => s + l.qty * l.price, 0)
  const code = "BB" + Date.now().toString(36).slice(-5).toUpperCase()

  const text = [
    `🛒 <b>Đơn hàng mới #${code}</b>`,
    "",
    ...lines.map(
      (l) =>
        `• ${l.qty} × ${escapeHtml(l.name)} — ${formatPrice(l.qty * l.price)}`
    ),
    `<b>Tạm tính: ${formatPrice(total)}</b>`,
    "",
    `<b>Khách:</b> ${escapeHtml(fields.ten)}`,
    `<b>SĐT:</b> ${escapeHtml(phone)}`,
    `<b>Nhận hàng:</b> ${fulfilmentLabels[nhan]}`,
    ...(nhan === "giao-hang"
      ? [`<b>Địa chỉ:</b> ${escapeHtml(fields.diachi)}`]
      : []),
    `<b>Thời gian:</b> ${formatDateVN(fields.ngay)}${fields.gio ? ` lúc ${fields.gio}` : ""}`,
    `<b>Ghi chú:</b> ${fields.ghichu ? escapeHtml(fields.ghichu) : "—"}`,
  ].join("\n")

  const result = await sendTelegram(text)
  if (result !== "ok") {
    return { status: "error", message: sendErrorMessage[result], fields }
  }
  return { status: "success", code }
}
