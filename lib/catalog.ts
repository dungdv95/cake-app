// Server-only: loads the menu and cake designs from Google Sheets.
//
// Tab "Thực đơn"  columns: id, loai, ten, mota, gia, anh, hien
// Tab "Mẫu bánh"  columns: id, ten, mota, gia_tu, anh, hien
// Header names are matched loosely: "Mô tả" = "mota", "Giá từ" = "gia_tu".
//
// Links can be overridden with MENU_SHEET_URL / DESIGNS_SHEET_URL. Either the
// normal sheet link (shared "Anyone with the link") or a "Publish to web → CSV"
// link works; the tab is picked by its gid (the number after #gid= in the URL).
// Data is re-read at most every 5 minutes. If a sheet is missing or broken, the
// last good data (or the defaults in code) is used so the site never goes blank.

import {
  defaultProducts,
  type CategoryId,
  type Product,
} from "@/lib/bakery-data"
import { resolveImage } from "@/lib/images"
import { customDesign, defaultCakeDesigns, type CakeDesign } from "@/lib/order"

const SHOP_SHEET =
  "https://docs.google.com/spreadsheets/d/1D5wW5ultf9gpHzrmqmJhwynVQTRjn4YnCC3vloSz414/edit"

/** Tab "Thực đơn" (gid=0). */
const MENU_SHEET_URL = process.env.MENU_SHEET_URL || `${SHOP_SHEET}#gid=0`
/** Tab "Mẫu bánh": set its link here (or in env) once the tab exists. */
const DESIGNS_SHEET_URL = process.env.DESIGNS_SHEET_URL || ""

export const CATALOG_REVALIDATE_SECONDS = 300

// ---------- Public API ----------

export async function getProducts(): Promise<Product[]> {
  return loadSheet("menu", MENU_SHEET_URL, toProduct, defaultProducts)
}

/** Designs from the sheet, plus the "Theo mẫu riêng" option at the end. */
export async function getCakeDesigns(): Promise<CakeDesign[]> {
  const designs = await loadSheet(
    "designs",
    DESIGNS_SHEET_URL,
    toDesign,
    defaultCakeDesigns
  )
  return [...designs.filter((d) => d.id !== customDesign.id), customDesign]
}

// ---------- Row → object ----------

type Row = Record<string, string>

const categoryAliases: Record<string, CategoryId> = {
  mi: "mi",
  "banh mi": "mi",
  ngot: "ngot",
  "banh ngot": "ngot",
  kem: "kem",
  "banh kem": "kem",
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
    priceFrom: parsePrice(row.giatu),
    image: resolveImage(row.anh),
  }
}

// ---------- Loading ----------

const lastGood = new Map<string, unknown[]>()

async function loadSheet<T extends { id: string }>(
  key: string,
  url: string,
  toItem: (row: Row, index: number) => T | null,
  fallback: T[]
): Promise<T[]> {
  if (!url) return fallback

  try {
    const res = await fetch(toCsvUrl(url), {
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
      if (isHidden(row.hien)) return
      const item = toItem(row, i)
      if (!item) {
        if (Object.values(row).some((v) => v.trim())) {
          console.warn(
            `[catalog:${key}] skipped row ${i + 2}: missing or invalid fields`
          )
        }
        return
      }
      if (seen.has(item.id)) {
        console.warn(
          `[catalog:${key}] skipped row ${i + 2}: duplicate id "${item.id}"`
        )
        return
      }
      seen.add(item.id)
      items.push(item)
    })

    if (items.length === 0) throw new Error("no valid rows")
    lastGood.set(key, items)
    return items
  } catch (err) {
    console.error(`[catalog:${key}] could not load sheet, using fallback:`, err)
    return (lastGood.get(key) as T[] | undefined) ?? fallback
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
