import Image from "next/image"

const points = [
  { title: "Nướng tại chỗ", text: "Mỗi mẻ bánh ra lò ngay trong ngày." },
  {
    title: "Bơ thật, sữa thật",
    text: "Bơ lạt, kem tươi, trứng gà ta. Không dùng bơ thực vật hay hương liệu.",
  },
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
        <div className="flex flex-col gap-3 text-[1.05rem] text-cocoa-soft">
          <p>
            Bơ &amp; Bột bắt đầu từ năm 2019, trong căn bếp nhỏ của hai vợ chồng
            mê làm bánh. Từ vài mẻ croissant nướng tặng hàng xóm, tiệm dần có
            thêm khách quen ghé mỗi sáng.
          </p>
          <p>
            Đến giờ tiệm vẫn giữ nếp cũ: nhồi bột từ 4 giờ sáng, ủ bột chậm qua
            đêm cho thơm, và chỉ bán bánh ra lò trong ngày. Bánh không kịp bán
            hết, tối đó tiệm mang tặng chứ không để sang hôm sau.
          </p>
        </div>
        <div className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
          {points.map((pt) => (
            <div
              key={pt.title}
              className="flex flex-col gap-1 border-t-2 border-cocoa pt-3.5"
            >
              <span className="font-display text-[1.15rem] font-bold">
                {pt.title}
              </span>
              <span className="text-[0.95rem] text-cocoa-soft">{pt.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
