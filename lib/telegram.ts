// Server-only helpers for sending orders to the shop's Telegram chat.
// Imported only from server actions (app/actions/*), never from client components.

import net from "node:net"

// Node gives each IPv4/IPv6 connection attempt only 250 ms before moving on. On
// slower links to api.telegram.org (~200 ms+ from Vietnam) that aborts a working
// IPv4 connection and then fails on IPv6. Allow 1 s per attempt instead.
if (net.getDefaultAutoSelectFamilyAttemptTimeout() < 1000) {
  net.setDefaultAutoSelectFamilyAttemptTimeout(1000)
}

export type SendResult = "ok" | "not-configured" | "failed"

/**
 * Sends an HTML message to the shop chat. If `photos` are given, they follow as
 * an album replying to that message. A failed photo upload is logged but does not
 * fail the order, since the text (which says how many photos to expect) arrived.
 */
export async function sendTelegram(
  html: string,
  photos: File[] = []
): Promise<SendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    console.error("[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID is not set")
    return "not-configured"
  }

  const call = async (method: string, body: FormData | object) => {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      ...(body instanceof FormData
        ? { body }
        : {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }),
      signal: AbortSignal.timeout(method === "sendMessage" ? 10_000 : 30_000),
      cache: "no-store",
    })
    const json = (await res.json().catch(() => null)) as {
      ok?: boolean
      result?: { message_id?: number }
      description?: string
    } | null
    if (!res.ok || !json?.ok) {
      throw new Error(
        `${method} ${res.status}: ${json?.description ?? "unknown error"}`
      )
    }
    return json.result
  }

  let messageId: number | undefined
  try {
    const result = await call("sendMessage", {
      chat_id: chatId,
      text: html,
      parse_mode: "HTML",
    })
    messageId = (result as { message_id?: number } | undefined)?.message_id
  } catch (err) {
    console.error("[telegram] send failed", err)
    return "failed"
  }

  // Retry once: uploads are larger and more likely to hit a network hiccup.
  for (let attempt = 1; photos.length > 0 && attempt <= 2; attempt++) {
    try {
      const form = new FormData()
      form.append("chat_id", chatId)
      if (messageId)
        form.append(
          "reply_parameters",
          JSON.stringify({ message_id: messageId })
        )
      if (photos.length === 1) {
        form.append("photo", photos[0], photos[0].name || "mau.jpg")
        await call("sendPhoto", form)
      } else {
        form.append(
          "media",
          JSON.stringify(
            photos.map((_, i) => ({ type: "photo", media: `attach://p${i}` }))
          )
        )
        photos.forEach((p, i) =>
          form.append(`p${i}`, p, p.name || `mau-${i + 1}.jpg`)
        )
        await call("sendMediaGroup", form)
      }
      break
    } catch (err) {
      console.error(`[telegram] photo upload failed (attempt ${attempt})`, err)
    }
  }

  return "ok"
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
