"use client"

const watchBrands = [
  "롤렉스",
  "파텍필립",
  "IWC",
  "위블로",
  "까르띠에",
  "오데마피게",
  "오메가",
  "몽블랑",
  "브라이틀링",
  "태그호이어",
  "바쉐론콘스탄틴",
  "파네라이",
  "샤넬",
  "구찌",
  "쇼파드",
  "에르메스",
  "반클리프",
  "브레게",
  "불가리",
  "루이비통",
  "피아제",
]

const fashionBrands = [
  "샤넬",
  "루이비통",
  "셀린느",
  "에르메스",
  "펜디",
  "구찌",
  "프라다",
  "디올",
  "고야드",
  "입생로랑",
  "미우미우",
  "발렌시아가",
  "버버리",
  "로에베",
  "보테가",
]

function MarqueeRow({
  brands,
  direction = "left",
  speed = 36,
  accentEvery = 3,
}: {
  brands: string[]
  direction?: "left" | "right"
  speed?: number
  accentEvery?: number
}) {
  const duplicated = [...brands, ...brands]

  return (
    <div className="brand-flow-row">
      <div
        className={`brand-flow-track ${direction === "right" ? "brand-flow-reverse" : ""}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {duplicated.map((brand, idx) => (
          <span
            key={`${brand}-${idx}`}
            className={`brand-flow-item ${idx % accentEvery === 0 ? "brand-flow-accent" : ""}`}
          >
            {brand}
          </span>
        ))}
      </div>
    </div>
  )
}

export function BrandFlowStrip() {
  return (
    <section className="brand-flow-wrap" aria-label="브랜드 흐름 배너">
      <MarqueeRow brands={watchBrands} direction="left" speed={38} accentEvery={4} />
      <MarqueeRow brands={fashionBrands} direction="right" speed={30} accentEvery={2} />
    </section>
  )
}
