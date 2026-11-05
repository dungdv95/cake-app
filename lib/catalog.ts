// Server-only: loads the menu and cake designs from one Google Sheet tab.
//
// Columns: id, loai, ten, mota, gia, anh, hien, type
//   type = "menu" (or empty) → item in "Thực đơn"   (loai: mi / ngot / kem)
//   type = "mau"             → design in "Chọn mẫu bánh" (gia = "từ …" price,
//                              empty = "Báo giá sau"; loai is ignored)
// Header names are matched loosely ("Mô tả" = "mota", "Loại" = "loai").
//
// The link can be overridden with MENU_SHEET_URL: either the normal sheet link
// (shared "Anyone with the link") or a "Publish to web → CSV" link; the tab is
// picked by its gid (the number after #gid= in the URL).
// Data is re-read at most every 5 minutes. If the sheet can't be read, the last
// good data is used; with none, the page render fails so Next keeps serving the
// previous version of the page (and a deploy fails instead of publishing an
// empty menu).

import type { CategoryId, Product } from "@/lib/bakery-data"
import { resolveImage } from "@/lib/images"
import { customDesign, type CakeDesign } from "@/lib/order"

const SHEET_URL =
  process.env.MENU_SHEET_URL ||
  "https://docs.google.com/spreadsheets/d/1D5wW5ultf9gpHzrmqmJhwynVQTRjn4YnCC3vloSz414/edit#gid=0"

export const CATALOG_REVALIDATE_SECONDS = 300

// ---------- Public API ----------

export async function getProducts(): Promise<Product[]> {
  const products = await loadItems("menu", "menu", toProduct)
  if (products.length === 0) throw new Error("[catalog:menu] no valid rows")
  return products
}

/** Designs from the sheet, plus the "Theo mẫu riêng" option at the end. */
export async function getCakeDesigns(): Promise<CakeDesign[]> {
  const designs = await loadItems("designs", "mau", toDesign)
  return [...designs.filter((d) => d.id !== customDesign.id), customDesign]
}

// ---------- Row → object ----------

type Row = Record<string, string>
type RowType = "menu" | "mau"

const categoryAliases: Record<string, CategoryId> = {
  mi: "mi",
  "banh mi": "mi",
  ngot: "ngot",
  "banh ngot": "ngot",
  kem: "kem",
  "banh kem": "kem",
}

/** Empty / "menu" / "thuc don" → menu; "mau" / "mau banh" → design. */
function rowType(row: Row): RowType | null {
  const t = normalize(row.type)
  if (!t || t === "menu" || t === "thuc don") return "menu"
  if (t === "mau" || t === "mau banh") return "mau"
  return null
}

function toProduct(row: Row, index: number): Product | null {
  const name = row.ten?.trim()
  const cat = categoryAliases[normalize(row.loai)]
  const price = parsePrice(row.gia)
  if (!name || !cat || price === null || price <= 0) return null
  return {
    id: row.id?.trim() || `row-${index + 2}`,
    cat,
    name,
    desc: row.mota?.trim() ?? "",
    price,
    image: resolveImage(row.anh),
  }
}

function toDesign(row: Row, index: number): CakeDesign | null {
  const name = row.ten?.trim()
  if (!name) return null
  return {
    id: row.id?.trim() || `mau-${index + 2}`,
    name,
    desc: row.mota?.trim() ?? "",
    priceFrom: parsePrice(row.gia || row.giatu),
    image: resolveImage(row.anh),
  }
}

// ---------- Loading ----------

const lastGood = new Map<string, unknown[]>()

/** Reads the sheet (fetch is cached and shared by both callers) and maps one kind of row. */
async function loadItems<T extends { id: string }>(
  key: string,
  type: RowType,
  toItem: (row: Row, index: number) => T | null
): Promise<T[]> {
  try {
    const res = await fetch(toCsvUrl(SHEET_URL), {
      next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["catalog"] },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    if (/^\s*<(!doctype|html)/i.test(text)) {
      throw new Error("got an HTML page — is the sheet shared / published?")
    }

    const items: T[] = []
    const seen = new Set<string>()
    parseCsv(text).forEach((row, i) => {
      const line = i + 2 // header is line 1
      if (!Object.values(row).some((v) => v.trim())) return // blank line
      const kind = rowType(row)
      if (kind === null && type === "menu") {
        console.warn(
          `[catalog] skipped line ${line}: unknown type "${row.type}"`
        )
      }
      if (kind !== type || isHidden(row.hien)) return

      const item = toItem(row, i)
      if (!item) {
        console.warn(
          `[catalog:${key}] skipped line ${line}: missing or invalid fields`
        )
        return
      }
      if (seen.has(item.id)) {
        console.warn(
          `[catalog:${key}] skipped line ${line}: duplicate id "${item.id}"`
        )
        return
      }
      seen.add(item.id)
      items.push(item)
    })

    lastGood.set(key, items)
    return items
  } catch (err) {
    const previous = lastGood.get(key) as T[] | undefined
    if (!previous) {
      throw new Error(`[catalog:${key}] could not load sheet`, { cause: err })
    }
    console.error(
      `[catalog:${key}] could not load sheet, using last data:`,
      err
    )
    return previous
  }
}

/** Normal sheet link → CSV export of the tab in #gid=…; CSV links pass through. */
function toCsvUrl(url: string) {
  if (/output=csv|format=csv/.test(url)) return url
  const m = url.match(/docs\.google\.com\/spreadsheets\/d\/([\w-]+)/)
  if (m && m[1] !== "e") {
    const gid = url.match(/[#&?]gid=(\d+)/)?.[1] ?? "0"
    return `https://docs.google.com/spreadsheets/d/${m[1]}/export?format=csv&gid=${gid}`
  }
  if (url.includes("/pubhtml")) {
    return (
      url.replace("/pubhtml", "/pub") +
      (url.includes("?") ? "&" : "?") +
      "output=csv"
    )
  }
  return url
}

// ---------- Parsing helpers ----------

/** "35.000đ", "35,000", "35000" → 35000; empty or invalid → null */
function parsePrice(raw: string | undefined) {
  const digits = (raw ?? "").replace(/[^\d]/g, "")
  return digits ? Number(digits) : null
}

/** Lowercase, strip Vietnamese accents and extra spaces: "Bánh Mì" → "banh mi" */
function normalize(s: string | undefined) {
  return (s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

/** Column "hien": empty / x / có = show; không / no / 0 / false / ẩn / hết = hide. */
function isHidden(raw: string | undefined) {
  return ["khong", "no", "0", "false", "an", "het"].includes(normalize(raw))
}

/** Small RFC 4180 CSV parser (quoted fields, commas and newlines inside quotes). */
function parseCsv(text: string): Row[] {
  const records: string[][] = []
  let field = ""
  let record: string[] = []
  let quoted = false
  const src = text.replace(/^﻿/, "")

  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        field += '"'
        i++
      } else if (c === '"') {
        quoted = false
      } else {
        field += c
      }
    } else if (c === '"') {
      quoted = true
    } else if (c === ",") {
      record.push(field)
      field = ""
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++
      record.push(field)
      records.push(record)
      record = []
      field = ""
    } else {
      field += c
    }
  }
  if (field || record.length) {
    record.push(field)
    records.push(record)
  }

  const [header, ...body] = records
  if (!header) return []
  // "Giá từ", "gia_tu", "GIA TU" → "giatu"
  const keys = header.map((h) => normalize(h).replace(/[^a-z0-9]/g, ""))
  return body.map((cells) =>
    Object.fromEntries(keys.map((k, i) => [k, cells[i] ?? ""]))
  )
}
