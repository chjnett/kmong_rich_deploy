
import * as XLSX from 'xlsx'
import * as path from 'path'
import * as fs from 'fs'

const EXCEL_FILE = 'crawled_products.xlsx'
const excelPath = path.join(__dirname, '..', EXCEL_FILE)

if (!fs.existsSync(excelPath)) {
    console.log(`❌ Excel file not found: ${excelPath}`)
    process.exit(1)
}

const workbook = XLSX.readFile(excelPath)
const sheet = workbook.Sheets[workbook.SheetNames[0]]
const data = XLSX.utils.sheet_to_json(sheet)

console.log(`✅ Excel loaded. Total rows: ${data.length}`)
if (data.length > 0) {
    console.log('--- First Row Sample ---')
    console.log(data[0])
    console.log('------------------------')

    // Check image columns
    const row = data[0] as any
    const imgVal = row['image_files'] || row['image_url'] || row['image'] || row['Image']
    console.log(`Image Column Value: "${imgVal}"`)
} else {
    console.log('Excel is empty.')
}
