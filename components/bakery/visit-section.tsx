import { Clock, MapPin, Phone } from "lucide-react"

export function VisitSection() {
  return (
    <section
      id="ghe-tiem"
      className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 py-24"
    >
      <h2 className="reveal font-display text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-extrabold tracking-[-0.03em]">
        Ghé tiệm nhé
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-6">
        <Card
          icon={
            <MapPin className="size-7" strokeWidth={1.8} aria-hidden="true" />
          }
          title="Địa chỉ"
        >
          <p className="text-cocoa-soft">
            Thôn Yên Thịnh - Xã Bắc Lũng - Tp. Bắc Ninh
          </p>
          <a
            href="#ghe-tiem"
            className="font-semibold text-berry hover:text-berry-dark"
          >
            Xem bản đồ
          </a>
        </Card>
        <Card
          icon={
            <Clock className="size-7" strokeWidth={1.8} aria-hidden="true" />
          }
          title="Giờ mở cửa"
        >
          <p className="text-cocoa-soft">
            Thứ 2 – Thứ 6: [GIỜ]
            <br />
            Thứ 7 – Chủ nhật: [GIỜ]
          </p>
        </Card>
        <Card
          icon={
            <Phone className="size-7" strokeWidth={1.8} aria-hidden="true" />
          }
          title="Liên hệ"
        >
          <p className="text-cocoa-soft">
            [SỐ ĐIỆN THOẠI]
            <br />
            [ZALO / FANPAGE]
          </p>
        </Card>
      </div>
    </section>
  )
}

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="reveal flex flex-col gap-2.5 rounded-[28px] bg-butter p-7">
      {icon}
      <h3 className="font-display text-[1.2rem] font-bold">{title}</h3>
      {children}
    </div>
  )
}
