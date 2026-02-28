
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// .env.local 로드
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Supabase credentials missing.')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 설정
const BUCKET_NAME = 'product-images'
const EXCEL_FILE = 'crawled_products.xlsx'
const IMAGE_DIR = 'images' // 프로젝트 루트 기준

async function uploadLocalFile(filePath: string, filename: string): Promise<string | null> {
    try {
        const fileBuffer = fs.readFileSync(filePath)

        // 확장자 기반 Content-Type 추론
        const ext = path.extname(filename).toLowerCase()
        let contentType = 'image/jpeg'
        if (ext === '.png') contentType = 'image/png'
        if (ext === '.gif') contentType = 'image/gif'
        if (ext === '.webp') contentType = 'image/webp'

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filename, fileBuffer, {
                contentType: contentType,
                upsert: true
            })

        if (error) {
            console.error(`Failed to upload to Supabase: ${filename}`, error.message)
            return null
        }

        const { data: publicUrlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filename)

        return publicUrlData.publicUrl

    } catch (error) {
        console.error(`Error reading local file: ${filePath}`, error.message)
        return null
    }
}

async function migrateImages() {
    const excelPath = path.join(__dirname, '..', EXCEL_FILE)
    const imageDirPath = path.join(__dirname, '..', IMAGE_DIR)

    if (!fs.existsSync(excelPath)) {
        console.error(`Excel file not found: ${excelPath}`)
        return
    }

    if (!fs.existsSync(imageDirPath)) {
        console.error(`Image directory not found: ${imageDirPath}`)
        console.error(`Please create a folder named "${IMAGE_DIR}" in the project root.`)
        return
    }

    console.log(`Reading Excel: ${excelPath}`)
    const workbook = XLSX.readFile(excelPath)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(sheet)

    console.log(`Found ${data.length} items. Starting migration...`)

    // 1. 카테고리/서브카테고리 맵 생성
    const categoryMap = new Map<string, number>()
    const subCategoryMap = new Map<string, number>()

    for (const row of data as any[]) {
        // 카테고리
        let catName = row['category'] || row['Category'] || row['카테고리'] || 'Uncategorized'
        if (!categoryMap.has(catName)) {
            const { data: catData } = await supabase.from('categories').select('id').eq('name', catName).single()
            if (catData) {
                categoryMap.set(catName, catData.id)
            } else {
                const { data: newCat } = await supabase.from('categories').insert({ name: catName }).select().single()
                if (newCat) categoryMap.set(catName, newCat.id)
            }
        }

        // 서브 카테고리
        let subCatName = row['subCategory'] || row['SubCategory'] || row['brand'] || row['브랜드'] || 'General'
        const catId = categoryMap.get(catName)
        if (catId) {
            const subCatKey = `${catId}-${subCatName}`
            if (!subCategoryMap.has(subCatKey)) {
                const { data: subData } = await supabase.from('sub_categories').select('id').eq('category_id', catId).eq('name', subCatName).single()
                if (subData) {
                    subCategoryMap.set(subCatKey, subData.id)
                } else {
                    const { data: newSub } = await supabase.from('sub_categories').insert({ category_id: catId, name: subCatName }).select().single()
                    if (newSub) subCategoryMap.set(subCatKey, newSub.id)
                }
            }
        }
    }

    // 2. 이미지 파일 처리
    for (const row of data as any[]) {
        try {
            const title = row['title'] || row['Title'] || row['상품명'] || 'No Title'
            console.log(`Processing: ${title}`)

            const catName = row['category'] || row['Category'] || row['카테고리'] || 'Uncategorized'
            const catId = categoryMap.get(catName)
            if (!catId) continue;

            const subCatName = row['subCategory'] || row['SubCategory'] || row['brand'] || row['브랜드'] || 'General'
            const subId = subCategoryMap.get(`${catId}-${subCatName}`)
            if (!subId) continue;

            const imageFilesStr = row['image_files'] || row['image_url'] || row['image'] || row['Image'] || ''
            let rawNames: string[] = []
            if (typeof imageFilesStr === 'string') {
                rawNames = imageFilesStr.split(',').map(u => u.trim()).filter(u => u.length > 0)
            }

            const newImageUrls: string[] = []

            for (const rawName of rawNames) {
                // URL 형태라면 파일명만 추출
                let filename = path.basename(rawName).split('?')[0]

                // 검색 경로 우선순위:
                // 1. images/downloaded_images/{Category}/{Filename}
                // 2. images/{Category}/{Filename}
                // 3. images/{Filename}
                const possiblePaths = [
                    path.join(imageDirPath, 'downloaded_images', catName, filename),
                    path.join(imageDirPath, catName, filename),
                    path.join(imageDirPath, filename)
                ]

                let localFilePath = ''
                for (const p of possiblePaths) {
                    if (fs.existsSync(p)) {
                        localFilePath = p
                        break
                    }
                }

                if (localFilePath) {
                    console.log(`  Found local file: ${localFilePath}`)

                    // Supabase Storage 경로: Category/Filename
                    // URL safe를 위해 슬래시 등만 치환
                    const safeCatName = catName.replace(/\//g, '_')
                    const uploadPath = `${safeCatName}/${Date.now()}_${filename}`

                    const publicUrl = await uploadLocalFile(localFilePath, uploadPath)
                    if (publicUrl) {
                        newImageUrls.push(publicUrl)
                    }
                } else {
                    console.warn(`  File not found in expected paths for: ${filename} (Category: ${catName})`)
                }
            }

            // DB Insert
            const specs = {
                brand: row['brand'] || row['브랜드'],
                price: row['price_raw'] || row['price'] || row['가격']
            }

            await supabase.from('products').insert({
                sub_id: subId,
                name: title,
                description: row['full_text'] || row['description'] || '',
                external_url: row['external_url'] || '',
                // img_urls가 없어도 빈 배열로 insert
                img_urls: newImageUrls,
                specs: specs
            })

        } catch (err) {
            console.error('Error processing row:', err)
        }
    }

    console.log('Migration completed!')
}

migrateImages().catch(console.error)
