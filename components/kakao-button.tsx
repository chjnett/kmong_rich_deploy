"use client"

import { MessageCircle } from "lucide-react"

export function KakaoButton() {
  const handleClick = () => {
    // Replace with actual KakaoTalk channel URL
    window.open("https://open.kakao.com/o/shJstlgi", "_blank")
  }

  return (
    <button
      onClick={handleClick}
      className="group fixed right-6 bottom-8 z-50 flex items-center gap-2 rounded-full bg-[#FEE500] px-4 py-3 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
      aria-label="카카오톡 문의하기"
    >
      <MessageCircle className="h-5 w-5 text-[#3A1D1D]" fill="#3A1D1D" />
      <span className="text-sm font-semibold text-[#3A1D1D]">
        문의하기
      </span>
    </button>
  )
}
