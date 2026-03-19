"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

interface ProductOption {
  id: string
  name: string
  image_url: string
  category: string
  subCategory: string
}

interface EditorialLinkedProduct {
  id: string
  editorial_block_id: string
  product_id: string
  sort_order: number
  product: ProductOption | null
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
  const [productOptions, setProductOptions] = useState<ProductOption[]>([])
  const [linkedProductsByBlock, setLinkedProductsByBlock] = useState<Record<string, EditorialLinkedProduct[]>>({})
  const [pendingProductByBlock, setPendingProductByBlock] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchProductOptions = async () => {
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        img_urls,
        sub_categories (
          name,
          categories (
            name
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      toast({
        variant: "destructive",
        title: "상품 목록 로딩 실패",
        description: error.message,
      })
      return
    }

    const mapped = ((data || []) as any[]).map((item) => ({
      id: item.id,
      name: item.name,
      image_url: item.img_urls?.[0] || "/placeholder.svg",
      category: item.sub_categories?.categories?.name || "기타",
      subCategory: item.sub_categories?.name || "",
    }))
    setProductOptions(mapped)
  }

  const fetchLinkedProducts = async (targetBlockIds?: string[]) => {
    const blockIds = targetBlockIds || blocks.map((block) => block.id)
    if (blockIds.length === 0) {
      if (!targetBlockIds) setLinkedProductsByBlock({})
      return
    }

    const { data, error } = await supabase
      .from("editorial_block_products")
      .select(`
        id,
        editorial_block_id,
        product_id,
        sort_order,
        products (
          id,
          name,
          img_urls,
          sub_categories (
            name,
            categories (
              name
            )
          )
        )
      `)
      .in("editorial_block_id", blockIds)
      .order("sort_order", { ascending: true })

    if (error) {
      toast({
        variant: "destructive",
        title: "에디토리얼 상품 로딩 실패",
        description: "editorial_block_products 테이블 생성이 필요합니다. SQL 가이드를 실행해주세요.",
      })
      return
    }

    const grouped: Record<string, EditorialLinkedProduct[]> = {}
    blockIds.forEach((id) => {
      grouped[id] = []
    })

    ;((data || []) as any[]).forEach((item) => {
      const product = item.products
      const mapped: EditorialLinkedProduct = {
        id: item.id,
        editorial_block_id: item.editorial_block_id,
        product_id: item.product_id,
        sort_order: item.sort_order,
        product: product
          ? {
              id: product.id,
              name: product.name,
              image_url: product.img_urls?.[0] || "/placeholder.svg",
              category: product.sub_categories?.categories?.name || "기타",
              subCategory: product.sub_categories?.name || "",
            }
          : null,
      }
      grouped[item.editorial_block_id] = [...(grouped[item.editorial_block_id] || []), mapped]
    })

    if (targetBlockIds) {
      setLinkedProductsByBlock((prev) => ({
        ...prev,
        ...grouped,
      }))
      return
    }

    setLinkedProductsByBlock(grouped)
  }

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

    const rows = (data as EditorialBlock[]) || []
    setBlocks(rows)
    await fetchLinkedProducts(rows.map((row) => row.id))
    setIsLoading(false)
  }

  useEffect(() => {
    fetchProductOptions()
    fetchBlocks()
  }, [])

  const updateBlockField = (id: string, key: keyof EditorialBlock, value: string | number | boolean) => {
    setBlocks((prev) => prev.map((block) => (block.id === id ? { ...block, [key]: value } : block)))
  }

  const handleAdd = async () => {
    setIsAdding(true)
    const nextOrder = blocks.length > 0 ? Math.max(...blocks.map((b) => b.sort_order)) + 1 : 1

    const { data, error } = await (supabase.from("editorial_blocks") as any)
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
    const { error } = await (supabase.from("editorial_blocks") as any)
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
    setLinkedProductsByBlock((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    toast({ title: "삭제 완료", description: "에디토리얼 블록이 삭제되었습니다." })
  }

  const handleAddProductToBlock = async (blockId: string) => {
    const productId = pendingProductByBlock[blockId]
    if (!productId) {
      toast({ variant: "destructive", title: "선택 필요", description: "추가할 상품을 먼저 선택해주세요." })
      return
    }

    const existing = linkedProductsByBlock[blockId] || []
    if (existing.some((item) => item.product_id === productId)) {
      toast({ variant: "destructive", title: "중복 상품", description: "이미 연결된 상품입니다." })
      return
    }

    const nextOrder = existing.length > 0 ? Math.max(...existing.map((item) => item.sort_order)) + 1 : 1
    const { error } = await (supabase.from("editorial_block_products") as any).insert({
      editorial_block_id: blockId,
      product_id: productId,
      sort_order: nextOrder,
    })

    if (error) {
      toast({ variant: "destructive", title: "상품 추가 실패", description: error.message })
      return
    }

    await fetchLinkedProducts([blockId])
    setPendingProductByBlock((prev) => ({ ...prev, [blockId]: "" }))
    toast({ title: "상품 추가 완료", description: "에디토리얼에 상품이 연결되었습니다." })
  }

  const handleRemoveLinkedProduct = async (linkId: string, blockId: string) => {
    const { error } = await supabase.from("editorial_block_products").delete().eq("id", linkId)
    if (error) {
      toast({ variant: "destructive", title: "상품 제거 실패", description: error.message })
      return
    }

    setLinkedProductsByBlock((prev) => ({
      ...prev,
      [blockId]: (prev[blockId] || []).filter((item) => item.id !== linkId),
    }))
    toast({ title: "상품 제거 완료", description: "에디토리얼 상품 연결이 해제되었습니다." })
  }

  const handleEditorialImageUpload = async (blockId: string, file?: File) => {
    if (!file) return
    setUploadingBlockId(blockId)
    try {
      const ext = file.name.split(".").pop() || "jpg"
      const path = `editorial_${blockId}_${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file)
      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(path)
      updateBlockField(blockId, "image_url", publicUrl)
      toast({ title: "이미지 업로드 완료", description: "저장 버튼을 누르면 반영됩니다." })
    } catch (error: any) {
      toast({ variant: "destructive", title: "이미지 업로드 실패", description: error.message })
    } finally {
      setUploadingBlockId(null)
    }
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
                    <div className="flex items-center gap-2 pt-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleEditorialImageUpload(block.id, e.target.files?.[0])}
                        className="h-10"
                      />
                      {uploadingBlockId === block.id && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground">업로드 후 저장 버튼을 눌러야 최종 반영됩니다.</p>
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

                <div className="space-y-3 rounded-md border border-border/70 bg-muted/20 p-4">
                  <Label className="text-sm">연결 상품</Label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Select
                      value={pendingProductByBlock[block.id] || ""}
                      onValueChange={(value: string) =>
                        setPendingProductByBlock((prev) => ({
                          ...prev,
                          [block.id]: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="상품 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {productOptions.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            [{product.category}] {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button type="button" variant="outline" onClick={() => handleAddProductToBlock(block.id)}>
                      <Plus className="mr-2 h-4 w-4" />
                      상품 추가
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {(linkedProductsByBlock[block.id] || []).length === 0 ? (
                      <p className="text-xs text-muted-foreground">연결된 상품이 없습니다.</p>
                    ) : (
                      (linkedProductsByBlock[block.id] || []).map((linked) => (
                        <div key={linked.id} className="flex items-center gap-3 rounded-md border border-border bg-background p-2">
                          <img
                            src={linked.product?.image_url || "/placeholder.svg"}
                            alt={linked.product?.name || "상품 이미지"}
                            className="h-14 w-14 rounded-sm object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{linked.product?.name || "삭제된 상품"}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {linked.product?.category || "기타"}
                              {linked.product?.subCategory ? ` / ${linked.product.subCategory}` : ""}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveLinkedProduct(linked.id, block.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
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
