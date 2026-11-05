import Image from "next/image"

const points = [
  { title: "Nướng tại chỗ", text: "Mỗi mẻ bánh ra lò ngay trong ngày." },
  { title: "Bơ thật, sữa thật", text: "[Nguyên liệu tiệm dùng]" },
  { title: "Làm theo yêu cầu", text: "Bánh kem sinh nhật, tiệc, quà tặng." },
]

export function StorySection() {
  return (
    <section
      id="chuyen"
      className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-center gap-14 px-6 py-24"
    >
      <div className="reveal relative min-h-[380px] overflow-hidden rounded-[200px_48px_48px_48px] bg-blush">
        <Image
          src="/images/story-baker.jpg"
          alt="Thợ làm bánh đang nhồi bột trên bàn rắc bột mì"
          fill
          sizes="(min-width: 1200px) 560px, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="reveal flex flex-col gap-5">
        <span className="font-semibold text-berry">Câu chuyện của tiệm</span>
        <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-extrabold tracking-[-0.03em]">
          Một căn bếp nhỏ, một mẻ bột mỗi sáng.
        </h2>
        <p className="text-[1.05rem] text-cocoa-soft">
          [Viết vài câu về người làm bánh, tiệm mở từ khi nào và điều khiến bánh của tiệm khác
          biệt.]
        </p>
        <div className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
          {points.map((pt) => (
            <div key={pt.title} className="flex flex-col gap-1 border-t-2 border-cocoa pt-3.5">
              <span className="font-display text-[1.15rem] font-bold">{pt.title}</span>
              <span className="text-[0.95rem] text-cocoa-soft">{pt.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
