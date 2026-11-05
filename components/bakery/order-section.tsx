"use client"

import Image from "next/image"
import { useActionState, useState } from "react"
import { Check, Sparkles } from "lucide-react"

import { submitOrder } from "@/app/actions/order"
import { formatPrice } from "@/lib/bakery-data"
import { PhotoPicker, type PickedPhoto } from "./photo-picker"
import {
  cakeDesigns,
  cakeSizes,
  CUSTOM_DESIGN_ID,
  initialOrderState,
  type OrderField,
} from "@/lib/order"
import { cn } from "@/lib/utils"

const steps = [
  "Chọn mẫu bánh, gửi ngày nhận, cỡ bánh, vị và lời chúc.",
  "Tiệm gọi lại để chốt mẫu và báo giá.",
  "Nhận bánh tại tiệm hoặc giao tận nơi.",
]

const fieldClass =
  "min-h-11 box-border rounded-[14px] border-[1.5px] border-sand bg-white px-3.5 py-3 font-normal text-cocoa outline-none focus-visible:border-berry focus-visible:ring-2 focus-visible:ring-berry/30 aria-invalid:border-berry"
const labelClass = "flex flex-col gap-1.5 text-[0.9rem] font-semibold"

export function OrderSection() {
  const [photos, setPhotos] = useState<PickedPhoto[]>([])
  const [selected, setSelected] = useState("")

  const [state, formAction, pending] = useActionState(
    async (prev: typeof initialOrderState, formData: FormData) => {
      // Attach the compressed photos (custom design only).
      formData.delete("anh")
      if (formData.get("mau") === CUSTOM_DESIGN_ID) {
        photos.forEach((p) => formData.append("anh", p.file))
      }
      const result = await submitOrder(prev, formData)
      if (result.status === "success") {
        photos.forEach((p) => URL.revokeObjectURL(p.url))
        setPhotos([])
        setSelected("")
      }
      return result
    },
    initialOrderState
  )
  const f = state.fields ?? {}

  // Props shared by every input: keep typed values after an error, flag invalid fields.
  const field = (name: OrderField) => ({
    name,
    defaultValue: f[name],
    "aria-invalid": state.errors?.[name] ? true : undefined,
    "aria-describedby": state.errors?.[name] ? `${name}-error` : undefined,
  })

  return (
    <section id="dat-banh" className="bg-cocoa px-6 py-24 text-cream">
      <div className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-14">
        <div className="reveal flex flex-col gap-6">
          <span className="font-semibold text-sun">Đặt bánh kem</span>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-extrabold tracking-[-0.03em]">
            Kể cho tiệm nghe về dịp của bạn.
          </h2>
          <ol className="flex flex-col gap-[18px]">
            {steps.map((s, i) => (
              <li key={s} className="flex items-start gap-4">
                <span className="flex size-10 flex-none items-center justify-center rounded-full bg-sun font-bold text-cocoa">
                  {i + 1}
                </span>
                <span className="pt-[7px]">{s}</span>
              </li>
            ))}
          </ol>
          <p className="text-latte">Vui lòng đặt trước ít nhất 1 ngày.</p>
        </div>

        <form
          action={formAction}
          noValidate
          className="reveal flex flex-col gap-[18px] rounded-[32px] bg-cream p-8 text-cocoa"
        >
          {/* Honeypot for spam bots — hidden from people and screen readers */}
          <div
            aria-hidden="true"
            className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
          >
            <label>
              Website
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>

          <fieldset
            className="flex flex-col gap-2"
            aria-describedby={state.errors?.mau ? "mau-error" : undefined}
          >
            <legend className="mb-2 text-[0.9rem] font-semibold">
              Chọn mẫu bánh
            </legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {cakeDesigns.map((d) => (
                <label
                  key={d.id}
                  className="group relative flex cursor-pointer flex-col overflow-hidden rounded-[18px] border-2 border-transparent bg-white transition-colors hover:border-sand has-checked:border-berry has-focus-visible:ring-2 has-focus-visible:ring-berry/40"
                >
                  <input
                    type="radio"
                    name="mau"
                    value={d.id}
                    defaultChecked={f.mau === d.id}
                    onChange={() => setSelected(d.id)}
                    className="sr-only"
                  />
                  <span className="relative block aspect-square bg-blush">
                    {d.image ? (
                      <Image
                        src={d.image}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 160px, 45vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center">
                        <Sparkles
                          className="size-9 text-berry"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                      </span>
                    )}
                    <span className="absolute top-2 right-2 hidden size-7 items-center justify-center rounded-full bg-berry text-white shadow group-has-checked:flex">
                      <Check className="size-4" aria-hidden="true" />
                    </span>
                  </span>
                  <span className="flex flex-col gap-0.5 p-2.5">
                    <span className="text-[0.9rem] leading-tight font-semibold">
                      {d.name}
                    </span>
                    <span className="text-[0.8rem] font-normal text-cocoa-soft">
                      {d.priceFrom
                        ? `từ ${formatPrice(d.priceFrom)}`
                        : "Báo giá sau"}
                    </span>
                    <span className="sr-only">{d.desc}</span>
                  </span>
                </label>
              ))}
            </div>
            <FieldError name="mau" error={state.errors?.mau} />
            {selected === CUSTOM_DESIGN_ID && (
              <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                <PhotoPicker
                  photos={photos}
                  onChange={setPhotos}
                  error={state.errors?.anh}
                />
              </div>
            )}
            <p className="text-[0.8rem] text-cocoa-soft">
              Giá tham khảo cho cỡ 16 cm, tiệm báo giá chính xác khi gọi lại.
            </p>
          </fieldset>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            <label className={labelClass}>
              Họ tên
              <input
                type="text"
                required
                autoComplete="name"
                placeholder="Nguyễn Văn A"
                className={fieldClass}
                {...field("ten")}
              />
              <FieldError name="ten" error={state.errors?.ten} />
            </label>
            <label className={labelClass}>
              Số điện thoại
              <input
                type="tel"
                required
                autoComplete="tel"
                inputMode="tel"
                placeholder="09xx xxx xxx"
                className={fieldClass}
                {...field("sdt")}
              />
              <FieldError name="sdt" error={state.errors?.sdt} />
            </label>
            <label className={labelClass}>
              Ngày nhận bánh
              <input
                type="date"
                required
                className={fieldClass}
                {...field("ngay")}
              />
              <FieldError name="ngay" error={state.errors?.ngay} />
            </label>
            <label className={labelClass}>
              Cỡ bánh
              <select className={fieldClass} {...field("co")}>
                {cakeSizes.map((size) => (
                  <option key={size}>{size}</option>
                ))}
              </select>
              <FieldError name="co" error={state.errors?.co} />
            </label>
          </div>
          <label className={labelClass}>
            Vị bánh &amp; lời chúc
            <textarea
              rows={4}
              maxLength={1000}
              placeholder="Ví dụ: cốt vani, kem dâu, ghi “Mừng sinh nhật Mẹ”. Chọn mẫu riêng thì mô tả ý tưởng ở đây."
              className={`${fieldClass} resize-y`}
              {...field("ghichu")}
            />
            <FieldError name="ghichu" error={state.errors?.ghichu} />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="min-h-12 cursor-pointer rounded-full bg-berry px-7 py-3.5 font-semibold text-white hover:bg-berry-dark disabled:cursor-wait disabled:opacity-70"
          >
            {pending ? "Đang gửi…" : "Gửi yêu cầu đặt bánh"}
          </button>
          <p
            role="status"
            className={cn(
              "rounded-2xl px-4 py-3 text-center font-medium empty:hidden",
              state.status === "success" && "bg-tile-bread text-cocoa",
              state.status === "error" && "bg-blush text-berry-dark"
            )}
          >
            {pending ? "" : state.message}
          </p>
        </form>
      </div>
    </section>
  )
}

function FieldError({ name, error }: { name: OrderField; error?: string }) {
  if (!error) return null
  return (
    <span
      id={`${name}-error`}
      className="text-[0.85rem] font-medium text-berry"
    >
      {error}
    </span>
  )
}
