const fs = require("node:fs")
const path = require("node:path")
const { Transform } = require("node:stream")
const { pipeline } = require("node:stream/promises")

const args = process.argv.slice(2)

const src = args[0]
const dest = args[1]

if (!src || !dest) {
    console.error("用法: node csv-to-json.js <输入CSV> <输出JSON>")
    process.exit(1)
}

const srcPath = path.resolve(process.cwd(), src)
const destPath = path.resolve(process.cwd(), dest)

if (!fs.existsSync(srcPath)) {
    console.error(`${srcPath} 不存在`)
    process.exit(1)
}

const reader = fs.createReadStream(srcPath, {
    encoding: 'utf-8',
    highWaterMark: 64 * 1024
})

let isFirstChunk = true
let keys = []
let isFirstItem = true

// 简易 CSV 行解析：处理引号包裹的字段
function parseCSVLine(line) {
    const result = []
    let current = ''
    let inQuotes = false
    for (const ch of line) {
        if (ch === '"') {
            inQuotes = !inQuotes
        } else if (ch === ',' && !inQuotes) {
            result.push(current.trim())
            current = ''
        } else {
            current += ch
        }
    }
    result.push(current.trim())
    return result
}

const transform = new Transform({
    transform(chunk, _encoding, callback) {
        const lines = chunk.toString().split('\n')

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]

            // 跳过空行
            if (line.trim() === '') continue

            if (isFirstChunk && i === 0) {
                // 第一行为表头
                keys = parseCSVLine(line)
                this.push('[\n')
                isFirstChunk = false
                continue
            }

            const values = parseCSVLine(line)
            const obj = {}
            keys.forEach((key, index) => {
                obj[key] = values[index] ?? ''
            })

            // 跳过全空行
            if (Object.values(obj).every(v => v === '')) continue

            if (isFirstItem) {
                isFirstItem = false
            } else {
                this.push(',\n')
            }
            this.push(JSON.stringify(obj))
        }
        callback()
    },
    flush(callback) {
        this.push('\n]')
        callback()
    }
})

pipeline(reader, transform, fs.createWriteStream(destPath))
    .then(() => console.log(`转换完成: ${destPath}`))
    .catch(err => console.error("转换失败:", err))