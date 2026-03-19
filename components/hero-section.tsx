"use client"

import { useEffect, useState } from "react"

const kakaoSlides = [
  "/KakaoTalk_Photo_2026-03-19-19-14-56 001.jpeg",
  "/KakaoTalk_Photo_2026-03-19-19-14-56 002.jpeg",
  "/KakaoTalk_Photo_2026-03-19-19-14-56 003.jpeg",
  "/KakaoTalk_Photo_2026-03-19-19-15-14 001.jpeg",
  "/KakaoTalk_Photo_2026-03-19-19-15-14 002.jpeg",
]

export function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [slideIndex, setSlideIndex] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % kakaoSlides.length)
    }, 3200)
    return () => clearInterval(interval)
  }, [])

  const scrollToContent = () => {
    const content = document.getElementById("main-content")
    if (content) content.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative h-[74svh] w-full overflow-hidden bg-[#f3f3f1] md:h-[88vh]">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{
            width: `${kakaoSlides.length * 100}%`,
            transform: `translate3d(-${(slideIndex * 100) / kakaoSlides.length}%, 0, 0)`,
          }}
        >
          {kakaoSlides.map((src, idx) => (
            <div key={`${src}-${idx}`} className="relative h-full flex-none" style={{ width: `${100 / kakaoSlides.length}%` }}>
              <img
                src={src}
                alt={`Hero slide ${idx + 1}`}
                className={`block h-full w-full object-cover object-center transition-all duration-1000 ease-out ${isLoaded ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"}`}
                loading={idx === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-7 md:px-10 md:pb-10">
        <p className={`mb-2 text-[10px] tracking-[0.22em] text-white/85 transition-all duration-700 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
          NEW DROP 2026
        </p>
        <h1 className={`max-w-[92%] text-[33px] font-light leading-[1.06] tracking-[-0.02em] text-white transition-all delay-75 duration-700 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
          Everyday Luxury
        </h1>
        <p className={`mt-2 text-[12px] tracking-[0.08em] text-white/80 transition-all delay-150 duration-700 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
          Curated bags, watches and accessories
        </p>

        <div className={`mt-5 flex items-center gap-2 transition-all delay-200 duration-700 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
          <button
            onClick={scrollToContent}
            className="rounded-sm bg-white px-4 py-2 text-[11px] font-medium tracking-[0.14em] text-black"
          >
            SHOP NOW
          </button>
        </div>
      </div>
    </section>
  )
}
