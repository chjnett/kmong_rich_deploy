"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

interface PageProps {
    params: Promise<{ id: string }>
}

export default function NoticeEditPage({ params }: PageProps) {
    const { id } = use(params)
    const isNew = id === "new"
    const router = useRouter()
    const { toast } = useToast()

    const [isLoading, setIsLoading] = useState(!isNew)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        is_active: true,
        start_date: "",
        end_date: "",
    })

    useEffect(() => {
        if (!isNew) {
            fetchNotice()
        }
    }, [id, isNew])

    const fetchNotice = async () => {
        const { data, error } = await supabase
            .from('notices')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            toast({
                variant: "destructive",
                title: "로딩 실패",
                description: error.message,
            })
            router.push("/admin/dashboard/notices")
            return
        }

        setFormData({
            title: data.title,
            content: data.content,
            is_active: data.is_active,
            start_date: data.start_date ? data.start_date.split('T')[0] : "",
            end_date: data.end_date ? data.end_date.split('T')[0] : "",
        })
        setIsLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title.trim() || !formData.content.trim()) {
            toast({
                variant: "destructive",
                title: "입력 오류",
                description: "제목과 내용을 모두 입력해주세요.",
            })
            return
        }

        setIsSaving(true)

        const payload = {
            title: formData.title,
            content: formData.content,
            is_active: formData.is_active,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
        }

        try {
            if (isNew) {
                const { error } = await supabase.from('notices').insert(payload)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('notices')
                    .update(payload)
                    .eq('id', id)
                if (error) throw error
            }

            toast({
                title: isNew ? "등록 성공" : "수정 성공",
                description: "공지사항이 저장되었습니다.",
            })
            router.push("/admin/dashboard/notices")
            router.refresh()
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "저장 실패",
                description: error.message,
            })
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="h-8 w-8 animate-spin text-[#c9a962]" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] pb-20">
            {/* Header */}
            <header className="sticky top-0 z-10 border-b border-[#262626] bg-[#0a0a0a]/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-5xl items-center justify-between p-4 lg:px-8">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="ghost" size="icon" className="text-[#a3a3a3] hover:text-[#f5f5f5]">
                            <Link href="/admin/dashboard/notices">
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <h1 className="text-lg font-medium text-[#f5f5f5]">
                            {isNew ? "새 공지사항 등록" : "공지사항 수정"}
                        </h1>
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="bg-[#c9a962] text-[#000000] hover:bg-[#d4b870]"
                    >
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        저장
                    </Button>
                </div>
            </header>

            {/* Form Content */}
            <main className="mx-auto max-w-5xl p-4 lg:p-8">
                <div className="space-y-8">
                    <div className="space-y-4 rounded-lg border border-[#262626] bg-[#111111] p-6">
                        <h2 className="text-lg font-medium text-[#f5f5f5]">기본 정보</h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[#a3a3a3]">제목</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="border-[#262626] bg-[#0a0a0a] text-[#f5f5f5]"
                                    placeholder="공지사항 제목을 입력하세요"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[#a3a3a3]">내용</Label>
                                <Textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                    className="min-h-[200px] border-[#262626] bg-[#0a0a0a] text-[#f5f5f5]"
                                    placeholder="공지사항 내용을 입력하세요"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[#a3a3a3]">시작일 (선택)</Label>
                                    <Input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                                        className="border-[#262626] bg-[#0a0a0a] text-[#f5f5f5] w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[#a3a3a3]">종료일 (선택)</Label>
                                    <Input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                                        className="border-[#262626] bg-[#0a0a0a] text-[#f5f5f5] w-full"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border border-[#262626] p-4">
                                <div>
                                    <Label className="text-[#f5f5f5]">활성화</Label>
                                    <p className="text-xs text-[#737373]">
                                        활성화하면 사용자에게 팝업으로 표시됩니다
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
