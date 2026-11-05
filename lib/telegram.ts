// Server-only helpers for sending orders to the shop's Telegram chat.
// Imported only from server actions (app/actions/*), never from client components.

export type SendResult = "ok" | "not-configured" | "failed"

export async function sendTelegram(html: string): Promise<SendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    console.error("[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID is not set")
    return "not-configured"
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: html,
          parse_mode: "HTML",
        }),
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      }
    )
    if (!res.ok) {
      console.error("[telegram] send failed", res.status, await res.text())
      return "failed"
    }
    return "ok"
  } catch (err) {
    console.error("[telegram] send failed", err)
    return "failed"
  }
}

export const sendErrorMessage: Record<Exclude<SendResult, "ok">, string> = {
  "not-configured":
    "Hệ thống đặt hàng đang bảo trì. Vui lòng gọi trực tiếp cho tiệm.",
  failed:
    "Chưa gửi được đơn. Bạn thử lại sau ít phút hoặc gọi trực tiếp cho tiệm nhé.",
}

export function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/** Strips spaces/dots/dashes; returns null if it isn't a Vietnamese phone number. */
export function normalizePhone(raw: string) {
  const phone = raw.replace(/[\s.\-()]/g, "")
  return /^(\+?84|0)\d{9}$/.test(phone) ? phone : null
}

/** Today as YYYY-MM-DD in Vietnam time. */
export function todayVN() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date())
}

export function isIsoDate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s)
}

/** YYYY-MM-DD → DD/MM/YYYY */
export function formatDateVN(iso: string) {
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y}`
}
