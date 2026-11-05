"use client"

import Image from "next/image"
import { useState } from "react"
import { ImagePlus, Loader2, X } from "lucide-react"

import { MAX_PHOTO_BYTES, MAX_PHOTOS } from "@/lib/order"

export type PickedPhoto = { id: string; file: File; url: string }

const MAX_SIDE = 1600

/** Shrinks a photo to JPEG ≤ MAX_SIDE px and ≤ MAX_PHOTO_BYTES, so uploads stay small. */
async function compress(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  })
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("no canvas")
  ctx.fillStyle = "#fff" // transparent PNGs → white, not black
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  let quality = 0.82
  let blob: Blob | null = null
  do {
    blob = await new Promise<Blob | null>((r) =>
      canvas.toBlob(r, "image/jpeg", quality)
    )
    quality -= 0.12
  } while (blob && blob.size > MAX_PHOTO_BYTES && quality > 0.4)

  if (!blob || blob.size > MAX_PHOTO_BYTES) throw new Error("too large")
  const name = file.name.replace(/\.[^.]+$/, "") || "mau"
  return new File([blob], `${name}.jpg`, { type: "image/jpeg" })
}

export function PhotoPicker({
  photos,
  onChange,
  error,
}: {
  photos: PickedPhoto[]
  onChange: (photos: PickedPhoto[]) => void
  error?: string
}) {
  const [busy, setBusy] = useState(false)
  const [localError, setLocalError] = useState<string>()
  const slotsLeft = MAX_PHOTOS - photos.length

  async function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return
    setLocalError(undefined)
    const picked = Array.from(list).filter((f) => f.type.startsWith("image/"))
    if (picked.length > slotsLeft)
      setLocalError(`Chỉ nhận tối đa ${MAX_PHOTOS} ảnh.`)

    setBusy(true)
    const added: PickedPhoto[] = []
    for (const file of picked.slice(0, slotsLeft)) {
      try {
        const small = await compress(file)
        added.push({
          id: crypto.randomUUID(),
          file: small,
          url: URL.createObjectURL(small),
        })
      } catch {
        setLocalError(
          `Không đọc được ảnh “${file.name}”. Bạn thử ảnh JPG hoặc PNG khác nhé.`
        )
      }
    }
    setBusy(false)
    if (added.length) onChange([...photos, ...added])
  }

  function remove(id: string) {
    const target = photos.find((p) => p.id === id)
    if (target) URL.revokeObjectURL(target.url)
    onChange(photos.filter((p) => p.id !== id))
  }

  const message = localError ?? error

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[0.9rem] font-semibold">
        Ảnh mẫu tham khảo{" "}
        <span className="font-normal text-cocoa-soft">
          (tuỳ chọn, tối đa {MAX_PHOTOS} ảnh)
        </span>
      </span>
      <div className="grid grid-cols-3 gap-3">
        {photos.map((p, i) => (
          <div
            key={p.id}
            className="relative aspect-square overflow-hidden rounded-[14px] bg-white"
          >
            <Image
              src={p.url}
              alt={`Ảnh mẫu ${i + 1}`}
              fill
              unoptimized
              sizes="160px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => remove(p.id)}
              aria-label={`Xoá ảnh mẫu ${i + 1}`}
              className="absolute top-1 right-1 flex size-9 cursor-pointer items-center justify-center rounded-full bg-cocoa/80 text-cream hover:bg-cocoa"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ))}
        {slotsLeft > 0 && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[14px] border-2 border-dashed border-sand bg-white text-center text-[0.8rem] font-semibold text-cocoa-soft transition-colors hover:border-berry hover:text-berry has-focus-visible:ring-2 has-focus-visible:ring-berry/40">
            {busy ? (
              <Loader2 className="size-6 animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus className="size-6" aria-hidden="true" />
            )}
            {busy ? "Đang xử lý…" : "Thêm ảnh"}
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={busy}
              className="sr-only"
              onChange={(e) => {
                void handleFiles(e.target.files)
                e.target.value = "" // allow picking the same file again
              }}
            />
          </label>
        )}
      </div>
      {message && (
        <span id="anh-error" className="text-[0.85rem] font-medium text-berry">
          {message}
        </span>
      )}
    </div>
  )
}
