"use server"

import { formatPrice } from "@/lib/bakery-data"
import {
  cakeSizes,
  CUSTOM_DESIGN_ID,
  MAX_PHOTO_BYTES,
  MAX_PHOTOS,
  PHOTO_TYPES,
  type OrderField,
  type OrderState,
} from "@/lib/order"
import { getCakeDesigns } from "@/lib/catalog"
import {
  escapeHtml,
  formatDateVN,
  isIsoDate,
  normalizePhone,
  sendErrorMessage,
  sendTelegram,
  todayVN,
} from "@/lib/telegram"

const THANKS = "Cảm ơn bạn! Tiệm sẽ gọi lại sớm để chốt mẫu bánh."

/** Custom cake request form (section "Đặt bánh kem"). */
export async function submitOrder(
  _prev: OrderState,
  formData: FormData
): Promise<OrderState> {
  // Honeypot: real visitors never see or fill this field.
  if (String(formData.get("website") ?? "").trim() !== "") {
    return { status: "success", message: THANKS }
  }

  const fields = {
    mau: String(formData.get("mau") ?? "").trim(),
    ten: String(formData.get("ten") ?? "").trim(),
    sdt: String(formData.get("sdt") ?? "").trim(),
    ngay: String(formData.get("ngay") ?? "").trim(),
    co: String(formData.get("co") ?? "").trim(),
    ghichu: String(formData.get("ghichu") ?? "").trim(),
  } satisfies Partial<Record<OrderField, string>>

  const errors: Partial<Record<OrderField, string>> = {}

  const design = (await getCakeDesigns()).find((d) => d.id === fields.mau)
  if (!design) {
    errors.mau = "Vui lòng chọn một mẫu bánh."
  }
  const isCustom = design?.id === CUSTOM_DESIGN_ID
  if (isCustom && fields.ghichu.length < 5) {
    errors.ghichu = "Vui lòng mô tả mẫu bánh bạn muốn."
  }

  // Reference photos: only for a custom design.
  const photos = isCustom
    ? formData
        .getAll("anh")
        .filter((v): v is File => v instanceof File && v.size > 0)
    : []
  if (photos.length > MAX_PHOTOS) {
    errors.anh = `Tối đa ${MAX_PHOTOS} ảnh.`
  } else if (photos.some((p) => !PHOTO_TYPES.includes(p.type))) {
    errors.anh = "Chỉ nhận ảnh JPG, PNG hoặc WebP."
  } else if (photos.some((p) => p.size > MAX_PHOTO_BYTES)) {
    errors.anh = "Ảnh quá lớn, vui lòng chọn ảnh khác."
  }

  if (fields.ten.length < 2 || fields.ten.length > 80) {
    errors.ten = "Vui lòng nhập họ tên."
  }

  const phone = normalizePhone(fields.sdt)
  if (!phone) {
    errors.sdt = "Số điện thoại chưa đúng (ví dụ 0912 345 678)."
  }

  if (!isIsoDate(fields.ngay)) {
    errors.ngay = "Vui lòng chọn ngày nhận bánh."
  } else if (fields.ngay < todayVN()) {
    errors.ngay = "Ngày nhận bánh không được ở quá khứ."
  }

  if (!(cakeSizes as readonly string[]).includes(fields.co)) {
    errors.co = "Vui lòng chọn cỡ bánh."
  }

  if (fields.ghichu.length > 1000) {
    errors.ghichu = "Ghi chú tối đa 1000 ký tự."
  }

  if (Object.keys(errors).length > 0 || !phone || !design) {
    return {
      status: "error",
      message: "Vui lòng kiểm tra lại thông tin.",
      errors,
      fields,
    }
  }

  const text = [
    "🎂 <b>Yêu cầu bánh kem theo mẫu</b>",
    "",
    `<b>Khách:</b> ${escapeHtml(fields.ten)}`,
    `<b>SĐT:</b> ${escapeHtml(phone)}`,
    `<b>Ngày nhận:</b> ${formatDateVN(fields.ngay)}`,
    `<b>Mẫu:</b> ${design.name}${design.priceFrom ? ` (từ ${formatPrice(design.priceFrom)})` : " — báo giá sau"}`,
    ...(photos.length > 0
      ? [`<b>Ảnh mẫu:</b> ${photos.length} ảnh (gửi ngay bên dưới)`]
      : []),
    `<b>Cỡ bánh:</b> ${escapeHtml(fields.co)}`,
    `<b>Vị & lời chúc:</b> ${fields.ghichu ? escapeHtml(fields.ghichu) : "—"}`,
  ].join("\n")

  const result = await sendTelegram(text, photos)
  if (result !== "ok") {
    return { status: "error", message: sendErrorMessage[result], fields }
  }
  return { status: "success", message: THANKS }
}
