const fs = require('fs/promises')
const { resolve, dirname, parse } = require('path')

const args = process.argv.slice(2);

const ignores = ['.git', 'node_modules']

const pathArg = args[0]
const depthArg = args.find((arg) => arg.startsWith('--depth='))
let depth = 1
if(depthArg) {
    depth = Number(depthArg.split('=')[1])
}else {
    depth = 1
}

const fullPath = resolve(__dirname, pathArg)

async function tree(path, maxDepth) {
    let result = ``
    async function parseTree (path, isLast, depth) {
        if(depth >= maxDepth) return
        const stats = await fs.stat(path);
            const name = parse(path).base
        let flag = isLast ? `└──` : `├──`
        if(depth <= 0) flag = ''
        let left = ''
        for(let i=0;i<depth-1;i++) {
            left += '│   '
        }
        if(ignores.includes(name)) return
        if(stats.isDirectory()) {
            result += `\n` + left + flag + name + '/'
            const files = await fs.readdir(path)
            for(let i = 0; i < files.length; i++) {
                const file = files[i]
                const filePath = resolve(path, file)
                await parseTree(filePath, i === files.length - 1 , depth + 1)
            }
        }else {
            result +=  `\n` + left + `${flag}${name}`
        }
    }
    await parseTree(path, true, 0)
    return result
}

tree(fullPath, depth).then(res => {
    console.log(res)
})