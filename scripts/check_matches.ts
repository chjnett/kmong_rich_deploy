
import * as XLSX from 'xlsx'
import * as path from 'path'
import * as fs from 'fs'

const EXCEL_FILE = 'crawled_products.xlsx'
const IMAGE_DIR = 'images'

const excelPath = path.join(__dirname, '..', EXCEL_FILE)
const imageDirPath = path.join(__dirname, '..', IMAGE_DIR)

console.log(`Checking matching files...`)
console.log(`Excel: ${excelPath}`)
console.log(`Images: ${imageDirPath}`)

if (!fs.existsSync(excelPath)) {
    console.error(`❌ Excel file missing!`)
    process.exit(1)
}
if (!fs.existsSync(imageDirPath)) {
    console.error(`❌ Images folder missing!`)
    process.exit(1)
}

// 1. Get local files
const localFiles = new Set(fs.readdirSync(imageDirPath))
console.log(`found ${localFiles.size} files in 'images/' folder.`)

// 2. Parsel Excel
const workbook = XLSX.readFile(excelPath)
const sheet = workbook.Sheets[workbook.SheetNames[0]]
const data = XLSX.utils.sheet_to_json(sheet)
console.log(`Found ${data.length} rows in Excel.`)

let matchCount = 0
let missingCount = 0
let missingExamples: string[] = []

// 3. Compare
for (const row of data as any[]) {
    const startStr = row['image_files'] || row['image_url'] || row['image'] || row['Image'] || ''

    if (!startStr) continue;

    let rawList: string[] = []
    if (typeof startStr === 'string') {
        rawList = startStr.split(',').map(s => s.trim()).filter(s => s.length > 0)
    }

    for (const raw of rawList) {
        // Extract filename assume: /path/to/file.jpg or https://.../file.jpg
        const filename = path.basename(raw).split('?')[0]

        if (localFiles.has(filename)) {
            matchCount++
        } else {
            missingCount++
            if (missingExamples.length < 5) missingExamples.push(filename)
        }
    }
}

console.log(`\n--- Summary ---`)
console.log(`✅ Matched Images: ${matchCount}`)
console.log(`❌ Missing Images: ${missingCount}`)

if (missingCount > 0) {
    console.log(`\nmissing examples (first 5):`)
    missingExamples.forEach(m => console.log(` - ${m} (looked for this filename in 'images/' but didn't find it)`))
    console.log(`\nTip: Ensure filenames in Excel match the files in the folder exactly!`)
}

if (matchCount === 0 && missingCount > 0) {
    console.error(`\n⚠️ CRITICAL: No matches found! Your Excel filenames might be totally different from your local files.`)
}
