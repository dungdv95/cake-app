import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

// Share thumbnail for Facebook, Zalo, Messenger, X… (1200×630).
export const alt = "Tiệm bánh Bơ & Bột — Bánh nướng mỗi ngày, thơm từ đầu ngõ."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const root = process.cwd()
const [display, body, photo, icon] = await Promise.all([
  readFile(join(root, "assets/fonts/BricolageGrotesque-ExtraBold.ttf")),
  readFile(join(root, "assets/fonts/BeVietnamPro-Medium.ttf")),
  readFile(join(root, "public/images/hero-croissant.jpg"), "base64"),
  readFile(join(root, "app/icon.svg"), "base64"),
])

const C = {
  cream: "#FFFCF5",
  cocoa: "#2A1810",
  cocoaSoft: "#5A4334",
  berry: "#B0234F",
  blush: "#FFF0F4",
  sun: "#FFD95A",
}

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: C.cream,
        fontFamily: "Be Vietnam Pro",
        color: C.cocoa,
      }}
    >
      {/* Text column */}
      <div
        style={{
          width: 640,
          padding: "64px 0 64px 72px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <img
            src={`data:image/svg+xml;base64,${icon}`}
            width={72}
            height={72}
            alt=""
          />
          <span
            style={{
              fontFamily: "Bricolage Grotesque",
              fontSize: 44,
              letterSpacing: -1,
            }}
          >
            Bơ &amp; Bột
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <span
            style={{
              alignSelf: "flex-start",
              background: C.blush,
              color: C.berry,
              fontSize: 24,
              padding: "8px 20px",
              borderRadius: 999,
            }}
          >
            Ra lò mỗi sáng từ 6:00
          </span>
          <span
            style={{
              fontFamily: "Bricolage Grotesque",
              fontSize: 72,
              lineHeight: 1.02,
              letterSpacing: -2.5,
            }}
          >
            Bánh nướng mỗi ngày, thơm từ đầu ngõ.
          </span>
        </div>

        <span style={{ fontSize: 26, color: C.cocoaSoft }}>
          Bánh mì · Bánh ngọt · Bánh kem theo yêu cầu
        </span>
      </div>

      {/* Photo, with the same leaf-shaped corners as the hero */}
      <div style={{ flex: 1, display: "flex", padding: "40px 40px 40px 8px" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            background: C.sun,
            overflow: "hidden",
            borderRadius: "48px 48px 180px 48px",
          }}
        >
          <img
            src={`data:image/jpeg;base64,${photo}`}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Bricolage Grotesque",
          data: display,
          weight: 800,
          style: "normal",
        },
        { name: "Be Vietnam Pro", data: body, weight: 500, style: "normal" },
      ],
    }
  )
}
