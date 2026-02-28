"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

interface Notice {
    id: string
    title: string
    content: string
    is_active: boolean
    start_date: string | null
    end_date: string | null
    created_at: string
}

export default function NoticesPage() {
    const [notices, setNotices] = useState<Notice[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        fetchNotices()
    }, [])

    const fetchNotices = async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('notices')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            toast({
                variant: "destructive",
                title: "로딩 실패",
                description: error.message,
            })
        } else {
            setNotices(data || [])
        }
        setIsLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("정말 이 공지사항을 삭제하시겠습니까?")) return

        const { error } = await supabase
            .from('notices')
            .delete()
            .eq('id', id)

        if (error) {
            toast({
                variant: "destructive",
                title: "삭제 실패",
                description: error.message,
            })
        } else {
            toast({
                title: "삭제 성공",
                description: "공지사항이 삭제되었습니다.",
            })
            fetchNotices()
        }
    }

    const toggleActive = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('notices')
            .update({ is_active: !currentStatus })
            .eq('id', id)

        if (error) {
            toast({
                variant: "destructive",
                title: "업데이트 실패",
                description: error.message,
            })
        } else {
            toast({
                title: "업데이트 성공",
                description: `공지사항이 ${!currentStatus ? '활성화' : '비활성화'}되었습니다.`,
            })
            fetchNotices()
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-6 lg:p-10">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-light text-[#f5f5f5]">공지사항 관리</h1>
                        <p className="text-[#737373]">팝업 공지사항을 등록하고 관리하세요.</p>
                    </div>
                    <Button asChild className="bg-[#c9a962] text-[#000000] hover:bg-[#d4b870]">
                        <Link href="/admin/dashboard/notices/new">
                            <Plus className="mr-2 h-4 w-4" />
                            공지사항 등록
                        </Link>
                    </Button>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-[#c9a962]" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notices.map((notice) => (
                            <div
                                key={notice.id}
                                className="rounded-lg border border-[#262626] bg-[#111111] p-6 transition-all hover:border-[#c9a962]/50"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-medium text-[#f5f5f5]">
                                                {notice.title}
                                            </h3>
                                            <span
                                                className={`px-2 py-1 text-xs rounded ${notice.is_active
                                                        ? 'bg-green-900/30 text-green-400'
                                                        : 'bg-gray-800 text-gray-400'
                                                    }`}
                                            >
                                                {notice.is_active ? '활성' : '비활성'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[#737373] line-clamp-2 mb-3">
                                            {notice.content}
                                        </p>
                                        <p className="text-xs text-[#525252]">
                                            등록일: {new Date(notice.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => toggleActive(notice.id, notice.is_active)}
                                            className="text-[#a3a3a3] hover:text-[#f5f5f5]"
                                        >
                                            {notice.is_active ? '비활성화' : '활성화'}
                                        </Button>
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="ghost"
                                            className="text-[#a3a3a3] hover:text-[#f5f5f5]"
                                        >
                                            <Link href={`/admin/dashboard/notices/${notice.id}`}>
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(notice.id)}
                                            className="text-[#a3a3a3] hover:text-red-500"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && notices.length === 0 && (
                    <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-[#262626] text-[#737373]">
                        <p className="mb-4">등록된 공지사항이 없습니다.</p>
                        <Button asChild variant="outline" className="border-[#262626]">
                            <Link href="/admin/dashboard/notices/new">첫 공지사항 등록하기</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
