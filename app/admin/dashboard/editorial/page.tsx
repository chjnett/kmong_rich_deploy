"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

interface EditorialBlock {
  id: string
  title: string
  subtitle: string
  body: string
  image_url?: string | null
  link_url?: string | null
  sort_order: number
  is_active: boolean
}

const createDraftBlock = (sortOrder: number) => ({
  title: "새 에디토리얼",
  subtitle: "서브 타이틀",
  body: "내용을 입력하세요.",
  image_url: "/placeholder.jpg",
  link_url: "",
  sort_order: sortOrder,
  is_active: true,
})

export default function EditorialPage() {
  const [blocks, setBlocks] = useState<EditorialBlock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const { toast } = useToast()

  const fetchBlocks = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("editorial_blocks")
      .select("*")
      .order("sort_order", { ascending: true })

    if (error) {
      toast({
        variant: "destructive",
        title: "로딩 실패",
        description: "editorial_blocks 테이블을 먼저 생성해주세요.",
      })
      setIsLoading(false)
      return
    }

    setBlocks((data as EditorialBlock[]) || [])
    setIsLoading(false)
  }

  useEffect(() => {
    fetchBlocks()
  }, [])

  const updateBlockField = (id: string, key: keyof EditorialBlock, value: string | number | boolean) => {
    setBlocks((prev) => prev.map((block) => (block.id === id ? { ...block, [key]: value } : block)))
  }

  const handleAdd = async () => {
    setIsAdding(true)
    const nextOrder = blocks.length > 0 ? Math.max(...blocks.map((b) => b.sort_order)) + 1 : 1

    const { data, error } = await supabase
      .from("editorial_blocks")
      .insert(createDraftBlock(nextOrder))
      .select("*")
      .single()

    if (error) {
      toast({ variant: "destructive", title: "추가 실패", description: error.message })
    } else if (data) {
      setBlocks((prev) => [...prev, data as EditorialBlock].sort((a, b) => a.sort_order - b.sort_order))
      toast({ title: "추가 완료", description: "새 에디토리얼 블록이 생성되었습니다." })
    }

    setIsAdding(false)
  }

  const handleSave = async (block: EditorialBlock) => {
    setSavingId(block.id)
    const { error } = await supabase
      .from("editorial_blocks")
      .update({
        title: block.title,
        subtitle: block.subtitle,
        body: block.body,
        image_url: block.image_url || "/placeholder.jpg",
        link_url: block.link_url || "#",
        sort_order: block.sort_order,
        is_active: block.is_active,
      })
      .eq("id", block.id)

    if (error) {
      toast({ variant: "destructive", title: "저장 실패", description: error.message })
    } else {
      toast({ title: "저장 완료", description: "에디토리얼 블록이 저장되었습니다." })
      setBlocks((prev) => [...prev].sort((a, b) => a.sort_order - b.sort_order))
    }

    setSavingId(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("이 에디토리얼 블록을 삭제할까요?")) return

    const { error } = await supabase.from("editorial_blocks").delete().eq("id", id)
    if (error) {
      toast({ variant: "destructive", title: "삭제 실패", description: error.message })
      return
    }

    setBlocks((prev) => prev.filter((block) => block.id !== id))
    toast({ title: "삭제 완료", description: "에디토리얼 블록이 삭제되었습니다." })
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="icon">
                <Link href="/admin/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">에디토리얼 관리</h1>
            </div>
            <p className="text-sm text-muted-foreground">메인 페이지 EDITORIAL 카드 문구를 수정합니다.</p>
          </div>

          <Button onClick={handleAdd} disabled={isAdding} className="bg-foreground text-background">
            {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            블록 추가
          </Button>
        </div>

        {isLoading ? (
          <div className="flex h-56 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.map((block) => (
              <article key={block.id} className="space-y-4 rounded-lg border border-border bg-card p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>서브 타이틀</Label>
                    <Input
                      value={block.subtitle}
                      onChange={(e) => updateBlockField(block.id, "subtitle", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>제목</Label>
                    <Input
                      value={block.title}
                      onChange={(e) => updateBlockField(block.id, "title", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>내용</Label>
                  <Textarea
                    className="min-h-[96px]"
                    value={block.body}
                    onChange={(e) => updateBlockField(block.id, "body", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>이미지 URL</Label>
                    <Input
                      value={block.image_url || ""}
                      onChange={(e) => updateBlockField(block.id, "image_url", e.target.value)}
                      placeholder="https://... 또는 /public-image.jpg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>클릭 링크</Label>
                    <Input
                      value={block.link_url || ""}
                      onChange={(e) => updateBlockField(block.id, "link_url", e.target.value)}
                      placeholder="비워두면 /editorial/{id} 상세로 이동"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>노출 순서</Label>
                    <Input
                      type="number"
                      value={block.sort_order}
                      onChange={(e) => updateBlockField(block.id, "sort_order", Number(e.target.value) || 1)}
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="flex w-full items-center justify-between rounded-md border border-border px-4 py-2.5">
                      <Label className="text-sm">활성화</Label>
                      <Switch
                        checked={block.is_active}
                        onCheckedChange={(checked) => updateBlockField(block.id, "is_active", checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => handleDelete(block.id)} className="text-muted-foreground">
                    <Trash2 className="mr-2 h-4 w-4" />
                    삭제
                  </Button>
                  <Button onClick={() => handleSave(block)} disabled={savingId === block.id}>
                    {savingId === block.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    저장
                  </Button>
                </div>
              </article>
            ))}

            {blocks.length === 0 && (
              <div className="rounded-lg border-2 border-dashed border-border bg-muted/10 px-6 py-12 text-center text-sm text-muted-foreground">
                등록된 에디토리얼 블록이 없습니다. "블록 추가"로 시작하세요.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
