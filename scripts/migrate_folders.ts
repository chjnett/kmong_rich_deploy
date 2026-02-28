
import { createClient } from '@supabase/supabase-js'
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
const ROOT_CATEGORY = '시계' // DB용 (한국어)
const ROOT_CATEGORY_ENG = 'Watch' // Storage용 (영어)

// 폴더명 -> 브랜드명 (한국어) 매핑
const BRAND_MAPPING: { [key: string]: string } = {
    'downloaded_images': '롤렉스',
    'downloaded_images_1': '파텍필립',
    'downloaded_images_2': 'IWC',
    'downloaded_images_3': '위블로',
    'downloaded_images_4': '까르띠에',
    'downloaded_images_5': '오데마피게',
    'downloaded_images_6': '오메가',
    'downloaded_images_7': '몽블랑',
    'downloaded_images_8': '브라이틀링',
    'downloaded_images_9': '태그호이어',
    'downloaded_images_10': '바세론 콘스탄틴',
    'downloaded_images_11': '파네라이',
    'downloaded_images_12': '샤넬',
    'downloaded_images_13': '구찌',
    'downloaded_images_14': '에르메스',
    'downloaded_images_15': '반클리프 아펠',
    'downloaded_images_16': '브레게',
    'downloaded_images_17': '불가리'
}

// 브랜드명 (한국어) -> 브랜드명 (영어/Storage용) 매핑
const BRAND_ENG_MAPPING: { [key: string]: string } = {
    '롤렉스': 'Rolex',
    '파텍필립': 'PatekPhilippe',
    'IWC': 'IWC',
    '위블로': 'Hublot',
    '까르띠에': 'Cartier',
    '오데마피게': 'AudemarsPiguet',
    '오메가': 'Omega',
    '몽블랑': 'Montblanc',
    '브라이틀링': 'Breitling',
    '태그호이어': 'TagHeuer',
    '바세론 콘스탄틴': 'VacheronConstantin',
    '파네라이': 'Panerai',
    '샤넬': 'Chanel',
    '구찌': 'Gucci',
    '에르메스': 'Hermes',
    '반클리프 아펠': 'VanCleefArpels',
    '브레게': 'Breguet',
    '불가리': 'Bulgari'
}

async function uploadLocalFile(filePath: string, uploadPath: string): Promise<string | null> {
    try {
        const fileBuffer = fs.readFileSync(filePath)

        // 확장자 기반 Content-Type 추론
        const ext = path.extname(filePath).toLowerCase()
        let contentType = 'image/jpeg'
        if (ext === '.png') contentType = 'image/png'
        if (ext === '.gif') contentType = 'image/gif'
        if (ext === '.webp') contentType = 'image/webp'

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(uploadPath, fileBuffer, {
                contentType: contentType,
                upsert: true
            })

        if (error) {
            console.error(`Failed to upload to Supabase: ${uploadPath}`, error.message)
            return null
        }

        const { data: publicUrlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(uploadPath)

        return publicUrlData.publicUrl

    } catch (error) {
        console.error(`Error reading local file: ${filePath}`, error.message)
        return null
    }
}

async function getCategoryId(catName: string): Promise<number | null> {
    const { data } = await supabase.from('categories').select('id').eq('name', catName).single()
    if (data) return data.id

    // 없으면 생성
    const { data: newCat, error } = await supabase.from('categories').insert({ name: catName }).select().single()
    if (error) {
        console.error(`Error creating category ${catName}:`, error.message)
        return null
    }
    return newCat.id
}

async function getSubCategoryId(catId: number, subName: string): Promise<number | null> {
    const { data } = await supabase.from('sub_categories').select('id').eq('category_id', catId).eq('name', subName).single()
    if (data) return data.id

    // 없으면 생성
    const { data: newSub, error } = await supabase.from('sub_categories').insert({ category_id: catId, name: subName }).select().single()
    if (error) {
        console.error(`Error creating sub-category ${subName}:`, error.message)
        return null
    }
    return newSub.id
}

async function migrateFolderStructure() {
    const projectRoot = path.join(__dirname, '..')
    const imagesRoot = path.join(projectRoot, 'images')

    if (!fs.existsSync(imagesRoot)) {
        console.error(`Images root not found: ${imagesRoot}`)
        return
    }

    // images 폴더 내의 downloaded_images* 폴더를 찾아서 정렬
    const targetDirs = fs.readdirSync(imagesRoot)
        .filter(name => name.startsWith('downloaded_images'))
        .sort((a, b) => {
            const numA = a === 'downloaded_images' ? 0 : parseInt(a.split('_').pop() || '0')
            const numB = b === 'downloaded_images' ? 0 : parseInt(b.split('_').pop() || '0')
            return numA - numB
        })

    console.log(`Found ${targetDirs.length} brand folders.`)

    for (const relativeDirName of targetDirs) {
        const brandName = BRAND_MAPPING[relativeDirName]
        if (!brandName) {
            console.log(`⚠️ Skipping unknown folder: ${relativeDirName}`)
            continue
        }

        console.log(`\n📂 Processing: ${relativeDirName} -> Brand: ${brandName}`)

        const rootDir = path.join(imagesRoot, relativeDirName)
        if (!fs.existsSync(rootDir)) continue

        // 1. 카테고리 ID (시계 - 한국어)
        const catId = await getCategoryId(ROOT_CATEGORY)
        if (!catId) continue

        // 2. 서브 카테고리 ID (브랜드 - 한국어)
        const subId = await getSubCategoryId(catId, brandName)
        if (!subId) continue

        // 3. 상품 폴더 순회
        const products = fs.readdirSync(rootDir).filter(f => fs.statSync(path.join(rootDir, f)).isDirectory())

        for (const prodFolderName of products) {
            console.log(`  📦 Product: ${prodFolderName}`)

            const prodPath = path.join(rootDir, prodFolderName)
            const imageFiles = fs.readdirSync(prodPath).filter(f => {
                const l = f.toLowerCase()
                return l.endsWith('.jpg') || l.endsWith('.jpeg') || l.endsWith('.png') || l.endsWith('.webp')
            })

            if (imageFiles.length === 0) {
                console.warn(`    ⚠️ No images found in ${prodFolderName}`)
                continue
            }

            // 이미지 업로드
            const uploadedUrls: string[] = []
            for (const imgFile of imageFiles) {
                const localPath = path.join(prodPath, imgFile)

                // Supabase Storage 경로: EnglishCategory/EnglishBrand/Product/Image
                // 한글 경로가 "Invalid key" 오류를 일으키므로 영어로 변환하여 업로드
                const brandEng = BRAND_ENG_MAPPING[brandName] || 'Other'

                // Storage용 Safe Name: 한글, 공백, 특수문자를 모두 '_'로 치환
                // 예: "14_RO61 변경 판" -> "14_RO61_____"
                // 이렇게 하면 충돌 가능성이 미세하게 있지만, 현재 데이터셋에서는 거의 없을 것으로 판단됨.
                const storageProdName = prodFolderName.replace(/[^a-zA-Z0-9.\-_]/g, '_')

                // 이미지 파일명도 동일하게 처리
                const storageImgName = imgFile.replace(/[^a-zA-Z0-9.\-_]/g, '_')

                const uploadPath = `${ROOT_CATEGORY_ENG}/${brandEng}/${storageProdName}/${Date.now()}_${storageImgName}`

                const url = await uploadLocalFile(localPath, uploadPath)
                if (url) uploadedUrls.push(url)
            }

            if (uploadedUrls.length > 0) {
                // DB 저장 (중복 체크)
                const { data: existing } = await supabase.from('products').select('id').eq('name', prodFolderName).single()

                const dbPayload = {
                    sub_id: subId,
                    name: prodFolderName,
                    description: `${brandName} ${prodFolderName} (자동 등록됨)`,
                    external_url: '',
                    img_urls: uploadedUrls,
                    specs: { price: "문의" }
                }

                if (existing) {
                    const { error } = await supabase.from('products').update(dbPayload).eq('id', existing.id)
                    if (error) console.error(`    ❌ DB Update Error:`, error.message)
                    else console.log(`    ✅ Product updated`)
                } else {
                    const { error } = await supabase.from('products').insert(dbPayload)
                    if (error) console.error(`    ❌ DB Insert Error:`, error.message)
                    else console.log(`    ✅ Product created`)
                }
            }
        }
    }

    console.log('\nMigration completed! 🎉')
}

migrateFolderStructure().catch(console.error)
