
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'

// 환경 변수 로드 (로컬 실행을 위해 직접 로드하거나 .env 파일을 사용해야 함)
// 이 스크립트를 npx ts-node로 실행할 때 .env.local을 로드하기 위해 dotenv 패키지가 필요합니다.
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase credentials missing in .env.local')
  console.error('Please make sure you have created the .env.local file with your new project keys.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function importExcelData() {
  const excelPath = path.join(__dirname, '..', 'crawled_products.xlsx')

  if (!fs.existsSync(excelPath)) {
    console.error(`Error: File not found at ${excelPath}`)
    console.error('Please make sure your Excel file is named "crawled_products.xlsx" and is in the root directory.')
    return
  }

  console.log(`Reading Excel file from: ${excelPath}`)
  const workbook = XLSX.readFile(excelPath)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(sheet)

  console.log(`Found ${data.length} rows in Excel.`)

  if (data.length === 0) {
    console.log('Excel file is empty.')
    return
  }

  // 매핑용 맵
  const categoryMap = new Map<string, number>()
  const subCategoryMap = new Map<string, number>()

  console.log('Syncing categories and sub-categories...')

  for (const row of data as any[]) {
    // 1. Category
    // 엑셀 컬럼명이 다양할 수 있으므로 여러 가능성을 체크
    let catName = row['category'] || row['Category'] || row['카테고리'] || 'Uncategorized'

    if (!categoryMap.has(catName)) {
      // 이미 존재하는지 확인
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', catName)
        .single()

      let catId
      if (catData) {
        catId = catData.id
      } else {
        const { data: newCat, error: insertError } = await supabase
          .from('categories')
          .insert({ name: catName, order: 0 })
          .select()
          .single()

        if (insertError) {
          console.error(`Error creating category ${catName}:`, insertError)
          continue
        }
        catId = newCat.id
      }
      categoryMap.set(catName, catId)
    }

    // 2. Sub Category
    let subCatName = row['subCategory'] || row['SubCategory'] || row['brand'] || row['브랜드'] || 'General'
    const catId = categoryMap.get(catName)!
    const subCatKey = `${catId}-${subCatName}`

    if (!subCategoryMap.has(subCatKey)) {
      const { data: subData } = await supabase
        .from('sub_categories')
        .select('id')
        .eq('category_id', catId)
        .eq('name', subCatName)
        .single()

      let subId
      if (subData) {
        subId = subData.id
      } else {
        const { data: newSub, error: insertSubError } = await supabase
          .from('sub_categories')
          .insert({ category_id: catId, name: subCatName })
          .select()
          .single()

        if (insertSubError) {
          console.error(`Error creating sub-category ${subCatName}:`, insertSubError)
          continue
        }
        subId = newSub.id
      }
      subCategoryMap.set(subCatKey, subId)
    }
  }

  // 3. Products
  console.log('Inserting products...')
  let successCount = 0

  for (const row of data as any[]) {
    try {
      const catName = row['category'] || row['Category'] || row['카테고리'] || 'Uncategorized'
      const catId = categoryMap.get(catName)

      if (!catId) continue;

      const subCatName = row['subCategory'] || row['SubCategory'] || row['brand'] || row['브랜드'] || 'General'
      const subCatKey = `${catId}-${subCatName}`
      const subId = subCategoryMap.get(subCatKey)

      if (!subId) {
        console.warn(`Skipping row due to missing sub-category (should not happen):`, row)
        continue
      }

      const title = row['title'] || row['Title'] || row['상품명'] || 'No Title'
      const description = row['full_text'] || row['description'] || row['Description'] || row['상품설명'] || (row['full_text'] || '')
      const externalUrl = row['external_url'] || row['detail_url'] || row['link'] || row['Link'] || ''

      // 이미지 처리: 'image_files' 컬럼이 콤마로 구분된 문자열임 (cafe_crawler.py 기준)
      // 만약 image_files가 없으면 다른 컬럼을 fallback으로 사용
      const imageFilesStr = row['image_files'] || row['image_url'] || row['image'] || row['Image'] || ''

      let imgUrls: string[] = []
      if (typeof imageFilesStr === 'string' && imageFilesStr.trim().length > 0) {
        // 콤마로 분리하고 공백 제거 (빈 문자열 필터링)
        imgUrls = imageFilesStr.split(',').map(url => url.trim()).filter(url => url.length > 0)
      } else if (Array.isArray(imageFilesStr)) {
        imgUrls = imageFilesStr
      }

      // 추가 정보 (스펙 등)
      const specs = {
        brand: row['brand'] || row['브랜드'],
        price: row['price_raw'] || row['price'] || row['가격']
      }

      await supabase.from('products').insert({
        sub_id: subId,
        name: title,
        description: description,
        external_url: externalUrl,
        img_urls: imgUrls,
        specs: specs,
      })
      successCount++
    } catch (err) {
      console.error('Error inserting product:', err)
    }
  }

  console.log(`Import completed. Successfully imported ${successCount} products.`)
}

importExcelData().catch(console.error)
