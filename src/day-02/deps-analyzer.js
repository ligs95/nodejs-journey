const fs = require('fs')
const { resolve } = require('node:path');

const packageFileParh = resolve(__dirname, './files/package.json')

async function read() {
    // 读取 package.json 文件并检查依赖
    const res = await fs.readFileSync(packageFileParh, 'utf-8')
    const json = JSON.parse(res)
    const {devDependencies, dependencies } = json
    const devDependenciesKeys = Object.keys(devDependencies || {}).sort();
    const dependenciesKeys = Object.keys(dependencies||{}).sort()
    console.log('开发依赖列表：', devDependenciesKeys)
    console.log('生产依赖列表：', dependenciesKeys || {})

    // 检查 package-lock.json 和 pnpm-lock.json 是否存在

    const lockFiles = ['package-lock.json', 'pnpm-lock.json']
    lockFiles.forEach(name => {
        const filePath = resolve(__dirname, `./files/${name}`)
        if(fs.existsSync(filePath)) {
            console.log(`${name}文件存在`)
        }else {
            console.log(`${name}文件不存在`)
        }
    })

    console.log('统计信息:')
    console.log(`开发依赖数量: ${devDependenciesKeys.length}`)
    console.log(`生产依赖数量: ${dependenciesKeys.length}`)
    console.log(`总依赖数量: ${devDependenciesKeys.length + dependenciesKeys.length}`)
}

read()