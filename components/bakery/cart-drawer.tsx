"use client"

import Image from "next/image"
import { useActionState, useState } from "react"
import {
  ArrowLeft,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react"
import { cn } from "cn"

import { submitCartOrder } from "@/app/actions/checkout"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatPrice } from "@/lib/bakery-data"
import { useCart } from "@/lib/cart"
import {
  fulfilmentLabels,
  initialCheckoutState,
  MAX_QTY,
  type CheckoutField,
  type FulfilmentId,
} from "@/lib/checkout"

const fieldClass =
  "min-h-11 w-full box-border rounded-[14px] border-[1.5px] border-sand bg-white px-3.5 py-2.5 font-normal text-cocoa outline-none focus-visible:border-berry focus-visible:ring-2 focus-visible:ring-berry/30 aria-invalid:border-berry"
const labelClass = "flex flex-col gap-1.5 text-[0.9rem] font-semibold"
const primaryBtn =
  "flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-berry px-7 py-3 font-semibold text-white hover:bg-berry-dark disabled:cursor-wait disabled:opacity-70"
const iconBtn =
  "flex size-11 flex-none cursor-pointer items-center justify-center rounded-full text-cocoa hover:bg-cocoa/10"

type Step = "cart" | "checkout"

export function CartDrawer() {
  const { open, setOpen } = useCart()
  const [step, setStep] = useState<Step>("cart")

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setStep("cart") // also resets a finished checkout
      }}
    >
      <SheetContent
        side="right"
        showCloseButton={false}
        className="gap-0 border-line bg-cream p-0 font-sans text-base text-cocoa data-[side=right]:w-full data-[side=right]:sm:max-w-md"
      >
        {step === "cart" ? (
          <CartView onCheckout={() => setStep("checkout")} />
        ) : (
          <CheckoutView onBack={() => setStep("cart")} />
        )}
      </SheetContent>
    </Sheet>
  )
}

function DrawerHeader({
  title,
  description,
  onBack,
}: {
  title: string
  description?: string
  onBack?: () => void
}) {
  return (
    <div className="flex items-center gap-2 border-b border-line px-4 py-3">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Quay lại giỏ hàng"
          className={iconBtn}
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
      )}
      <div className={cn("flex min-w-0 flex-1 flex-col", !onBack && "pl-2")}>
        <SheetTitle className="font-display text-xl font-extrabold text-cocoa">
          {title}
        </SheetTitle>
        {description && (
          <SheetDescription className="text-sm text-cocoa-soft">
            {description}
          </SheetDescription>
        )}
      </div>
      <SheetClose aria-label="Đóng giỏ hàng" className={iconBtn}>
        <X className="size-5" aria-hidden="true" />
      </SheetClose>
    </div>
  )
}

// ---------------- Step 1: cart ----------------

function CartView({ onCheckout }: { onCheckout: () => void }) {
  const { items, count, subtotal, setQty, remove, setOpen } = useCart()

  if (items.length === 0) {
    return (
      <>
        <DrawerHeader title="Giỏ hàng" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-butter">
            <ShoppingBag
              className="size-9 text-cocoa-soft"
              aria-hidden="true"
            />
          </span>
          <p className="font-display text-xl font-bold">Giỏ hàng đang trống</p>
          <p className="text-cocoa-soft">
            Chọn vài chiếc bánh trong thực đơn nhé.
          </p>
          <a
            href="#menu"
            onClick={() => setOpen(false)}
            className="rounded-full bg-cocoa px-6 py-3 font-semibold text-cream hover:bg-cocoa/90"
          >
            Xem thực đơn
          </a>
        </div>
      </>
    )
  }

  return (
    <>
      <DrawerHeader title="Giỏ hàng" description={`${count} món`} />
      <ul className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {items.map(({ id, qty, product }) => (
          <li key={id} className="flex gap-3 rounded-[20px] bg-white/70 p-2.5">
            <div className="relative size-20 flex-none overflow-hidden rounded-[14px] bg-butter">
              <Image
                src={product.image}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-start justify-between gap-2">
                <span className="font-display leading-tight font-bold">
                  {product.name}
                </span>
                <button
                  type="button"
                  onClick={() => remove(id)}
                  aria-label={`Xoá ${product.name} khỏi giỏ`}
                  className="-m-2 flex size-10 flex-none cursor-pointer items-center justify-center rounded-full text-cocoa-soft hover:bg-blush hover:text-berry"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
              <span className="text-sm text-cocoa-soft">
                {formatPrice(product.price)}
              </span>
              <div className="mt-auto flex items-center justify-between gap-2">
                <div className="flex items-center rounded-full border-[1.5px] border-sand bg-white">
                  <button
                    type="button"
                    onClick={() => setQty(id, qty - 1)}
                    aria-label={`Bớt một ${product.name}`}
                    className="flex size-9 cursor-pointer items-center justify-center rounded-full hover:bg-cocoa/10"
                  >
                    <Minus className="size-4" aria-hidden="true" />
                  </button>
                  <span
                    className="w-7 text-center font-semibold tabular-nums"
                    aria-live="polite"
                  >
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(id, qty + 1)}
                    disabled={qty >= MAX_QTY}
                    aria-label={`Thêm một ${product.name}`}
                    className="flex size-9 cursor-pointer items-center justify-center rounded-full hover:bg-cocoa/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                  </button>
                </div>
                <span className="font-semibold tabular-nums">
                  {formatPrice(qty * product.price)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-3 border-t border-line bg-butter px-4 py-4">
        <div className="flex items-baseline justify-between">
          <span className="text-cocoa-soft">Tạm tính</span>
          <span className="font-display text-2xl font-extrabold tabular-nums">
            {formatPrice(subtotal)}
          </span>
        </div>
        <p className="text-sm text-cocoa-soft">
          Phí giao hàng (nếu có) tiệm sẽ báo khi gọi xác nhận.
        </p>
        <button type="button" onClick={onCheckout} className={primaryBtn}>
          Đặt hàng
        </button>
      </div>
    </>
  )
}

// ---------------- Step 2: checkout ----------------

function CheckoutView({ onBack }: { onBack: () => void }) {
  const { lines, count, subtotal, clear, setOpen } = useCart()
  const [state, formAction, pending] = useActionState(
    async (prev: typeof initialCheckoutState, formData: FormData) => {
      const result = await submitCartOrder(prev, formData)
      if (result.status === "success") clear()
      return result
    },
    initialCheckoutState
  )
  const f = state.fields ?? {}
  const [nhan, setNhan] = useState<FulfilmentId>(
    (f.nhan as FulfilmentId) || "tai-tiem"
  )

  if (state.status === "success") {
    return (
      <>
        <DrawerHeader title="Đặt hàng thành công" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <CheckCircle2 className="size-16 text-berry" aria-hidden="true" />
          <p className="font-display text-2xl font-extrabold">Cảm ơn bạn!</p>
          <p className="text-cocoa-soft">
            Tiệm đã nhận đơn{" "}
            <strong className="text-cocoa">#{state.code}</strong> và sẽ gọi lại
            để xác nhận trong ít phút.
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full bg-cocoa px-6 py-3 font-semibold text-cream hover:bg-cocoa/90"
          >
            Xong
          </button>
        </div>
      </>
    )
  }

  const field = (name: CheckoutField) => ({
    name,
    defaultValue: f[name],
    "aria-invalid": state.errors?.[name] ? true : undefined,
    "aria-describedby": state.errors?.[name] ? `co-${name}-error` : undefined,
  })

  return (
    <>
      <DrawerHeader
        title="Thông tin đặt hàng"
        description={`${count} món · ${formatPrice(subtotal)}`}
        onBack={onBack}
      />
      <form
        action={formAction}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
          <input type="hidden" name="items" value={JSON.stringify(lines)} />
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

          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-[0.9rem] font-semibold">
              Cách nhận hàng
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(fulfilmentLabels) as FulfilmentId[]).map((id) => (
                <label
                  key={id}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center justify-center rounded-full border-2 px-3 text-center text-[0.9rem] font-semibold transition-colors has-focus-visible:ring-2 has-focus-visible:ring-berry/40",
                    nhan === id
                      ? "border-cocoa bg-cocoa text-cream"
                      : "border-cocoa/30 hover:border-cocoa"
                  )}
                >
                  <input
                    type="radio"
                    name="nhan"
                    value={id}
                    checked={nhan === id}
                    onChange={() => setNhan(id)}
                    className="sr-only"
                  />
                  {fulfilmentLabels[id]}
                </label>
              ))}
            </div>
            <FieldError name="nhan" error={state.errors?.nhan} />
          </fieldset>

          {nhan === "giao-hang" && (
            <label className={labelClass}>
              Địa chỉ giao hàng
              <textarea
                rows={2}
                required
                autoComplete="street-address"
                placeholder="Số nhà, đường, phường, quận"
                className={cn(fieldClass, "resize-y")}
                {...field("diachi")}
              />
              <FieldError name="diachi" error={state.errors?.diachi} />
            </label>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>
              {nhan === "giao-hang" ? "Ngày giao" : "Ngày nhận"}
              <input
                type="date"
                required
                className={fieldClass}
                {...field("ngay")}
              />
              <FieldError name="ngay" error={state.errors?.ngay} />
            </label>
            <label className={labelClass}>
              <span>
                Giờ{" "}
                <span className="font-normal text-cocoa-soft">(tuỳ chọn)</span>
              </span>
              <input type="time" className={fieldClass} {...field("gio")} />
              <FieldError name="gio" error={state.errors?.gio} />
            </label>
          </div>

          <label className={labelClass}>
            <span>
              Ghi chú{" "}
              <span className="font-normal text-cocoa-soft">(tuỳ chọn)</span>
            </span>
            <textarea
              rows={3}
              maxLength={1000}
              placeholder="Ví dụ: ít ngọt, gói quà, gọi trước khi giao…"
              className={cn(fieldClass, "resize-y")}
              {...field("ghichu")}
            />
            <FieldError name="ghichu" error={state.errors?.ghichu} />
          </label>
        </div>

        <div className="flex flex-col gap-3 border-t border-line bg-butter px-4 py-4">
          <div className="flex items-baseline justify-between">
            <span className="text-cocoa-soft">
              Tạm tính · thanh toán khi nhận
            </span>
            <span className="font-display text-2xl font-extrabold tabular-nums">
              {formatPrice(subtotal)}
            </span>
          </div>
          {state.status === "error" && !pending && (
            <p
              role="alert"
              className="rounded-2xl bg-blush px-4 py-2.5 text-center text-sm font-medium text-berry-dark"
            >
              {state.message}
            </p>
          )}
          <button
            type="submit"
            disabled={pending || lines.length === 0}
            className={primaryBtn}
          >
            {pending ? "Đang gửi đơn…" : "Xác nhận đặt hàng"}
          </button>
        </div>
      </form>
    </>
  )
}

function FieldError({ name, error }: { name: CheckoutField; error?: string }) {
  if (!error) return null
  return (
    <span
      id={`co-${name}-error`}
      className="text-[0.85rem] font-medium text-berry"
    >
      {error}
    </span>
  )
}
