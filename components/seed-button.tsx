"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export function SeedButton() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSeed = async () => {
        if (!confirm("기존 데이터를 모두 삭제하고 초기 데이터를 다시 입력하시겠습니까? (This will RESET all data)")) return

        setLoading(true)
        try {
            const res = await fetch("/api/seed")
            const data = await res.json()

            if (data.success) {
                alert("데이터 초기화 완료!")
                router.refresh()
            } else {
                alert("실패: " + data.error)
            }
        } catch (e) {
            alert("오류 발생")
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleSeed}
            disabled={loading}
            className="flex items-center gap-2 rounded bg-red-900/50 px-4 py-2 text-sm text-red-100 hover:bg-red-800 disabled:opacity-50"
        >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "데이터 생성 중..." : "⚠️ 데이터 리셋 & 재생성 (Seed)"}
        </button>
    )
}
