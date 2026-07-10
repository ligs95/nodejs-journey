const fs = require('fs/promises')
const path = require('path')

const args = process.argv.slice(2)

const ext = '.md'

const dir = args[0]

async function main () {
    const lines = ['# 文档索引', '', '']
    const files = await fs.readdir(dir, {
        recursive: true
    })
    console.log(files)
    const mdFiles = files.filter(file => file.endsWith(ext))
    console.log(mdFiles)
    for(let i = 0; i < mdFiles.length; i++) {
        const file = mdFiles[i]
        const filePath = path.resolve(dir, file)
        const content = await fs.readFile(filePath, 'utf8')
        
        const match = content.match(/^#\s+(.+)/m);
        const link = path.relative(dir, filePath)
        lines.push(`- [${match ? match[1].trim() : path.basename(filePath, '.md')}](${link})`)
    }
    console.log(lines.join('\n'))
    const content = lines.join('\n')
    await fs.writeFile(path.resolve(dir, 'README.md'), content)
} 

main()