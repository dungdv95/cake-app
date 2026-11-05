"use server"

import { cakeSizes, type OrderField, type OrderState } from "@/lib/order"

const TIME_ZONE = "Asia/Ho_Chi_Minh"

export async function submitOrder(
  _prev: OrderState,
  formData: FormData
): Promise<OrderState> {
  // Honeypot: real visitors never see or fill this field.
  if (String(formData.get("website") ?? "").trim() !== "") {
    return {
      status: "success",
      message: "Cảm ơn bạn! Tiệm sẽ gọi lại sớm để chốt mẫu bánh.",
    }
  }

  const fields = {
    ten: String(formData.get("ten") ?? "").trim(),
    sdt: String(formData.get("sdt") ?? "").trim(),
    ngay: String(formData.get("ngay") ?? "").trim(),
    co: String(formData.get("co") ?? "").trim(),
    ghichu: String(formData.get("ghichu") ?? "").trim(),
  } satisfies Record<OrderField, string>

  const errors: Partial<Record<OrderField, string>> = {}

  if (fields.ten.length < 2 || fields.ten.length > 80) {
    errors.ten = "Vui lòng nhập họ tên."
  }

  const phone = fields.sdt.replace(/[\s.\-()]/g, "")
  if (!/^(\+?84|0)\d{9}$/.test(phone)) {
    errors.sdt = "Số điện thoại chưa đúng (ví dụ 0912 345 678)."
  }

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
  }).format(new Date())
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.ngay)) {
    errors.ngay = "Vui lòng chọn ngày nhận bánh."
  } else if (fields.ngay < today) {
    errors.ngay = "Ngày nhận bánh không được ở quá khứ."
  }

  if (!(cakeSizes as readonly string[]).includes(fields.co)) {
    errors.co = "Vui lòng chọn cỡ bánh."
  }

  if (fields.ghichu.length > 1000) {
    errors.ghichu = "Ghi chú tối đa 1000 ký tự."
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Vui lòng kiểm tra lại thông tin.",
      errors,
      fields,
    }
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    console.error("[order] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID is not set")
    return {
      status: "error",
      message:
        "Hệ thống đặt bánh đang bảo trì. Vui lòng gọi trực tiếp cho tiệm.",
      fields,
    }
  }

  const [y, m, d] = fields.ngay.split("-")
  const text = [
    "🎂 <b>Đơn đặt bánh kem mới</b>",
    "",
    `<b>Khách:</b> ${escapeHtml(fields.ten)}`,
    `<b>SĐT:</b> ${escapeHtml(phone)}`,
    `<b>Ngày nhận:</b> ${d}/${m}/${y}`,
    `<b>Cỡ bánh:</b> ${escapeHtml(fields.co)}`,
    `<b>Vị & lời chúc:</b> ${fields.ghichu ? escapeHtml(fields.ghichu) : "—"}`,
  ].join("\n")

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      }
    )
    if (!res.ok) {
      console.error("[order] Telegram error", res.status, await res.text())
      throw new Error("telegram")
    }
  } catch {
    return {
      status: "error",
      message:
        "Chưa gửi được yêu cầu. Bạn thử lại sau ít phút hoặc gọi trực tiếp cho tiệm nhé.",
      fields,
    }
  }

  return {
    status: "success",
    message: "Cảm ơn bạn! Tiệm sẽ gọi lại sớm để chốt mẫu bánh.",
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}
