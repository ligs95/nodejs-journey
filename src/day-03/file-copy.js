const fs = require('fs/promises')
const path = require('path')
const readline = require('readline');

const args = process.argv.slice(2)

const srcPath = args[0]
const destPath = args[1]

function ask (question) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question(question, (answer) => {
            resolve(answer)
        });  
    })
}

async function copyDictionary(srcPath, destPath) {
    let fileCount = 0
    let dirCount = 0
    try {
        const stat = await fs.stat(destPath)
        if(stat.isDirectory()) {
            const answer = await ask('该目录已存在,是否覆盖?(y/n)')
            if(answer === 'y') {
                await fs.rm(destPath, { recursive: true })
            }else {
                process.exit(1)
            }
        }
    } catch (error) {
        console.log('目标目录不存在，将自动创建')
    } 
    async function parseTree(src, dest) {
        const stat = await fs.stat(src)
        if(stat.isDirectory()) {
            await fs.mkdir(dest)
            dirCount++
            const files = await fs.readdir(src)
            for(let i = 0; i < files.length; i++) {
                const file = files[i]
                const srcFile = path.resolve(src, file)
                const destFile = path.resolve(dest, file)
                await parseTree(srcFile, destFile)
            }
        }else {
            fileCount++
            fs.copyFile(src, dest)
        }
        console.log(`已复制 ${fileCount} 个文件，${dirCount} 个目录`)
    }
    await parseTree(srcPath, destPath)
}
async function copyFile(srcPath, destPath) {
    try {
        const stat = await fs.stat(destPath)
        if(stat.isFile()) {
            const answer = await ask('该文件已存在,是否覆盖?(y/n)')
            if(answer === 'y') {
                await fs.rm(destPath, { recursive: true })
            }else {
                process.exit(1)
            }
        }
    } catch (error) {
    } 
    await fs.copyFile(srcPath, destPath)   
}

async function copy(srcPath, destPath) {
    try {
        const startTime = Date.now()
        const stat = await fs.stat(srcPath)
        const isDirectory = stat.isDirectory()
        if(isDirectory) {
            await copyDictionary(srcPath, destPath)
        } else {
            await copyFile(srcPath, destPath);
        }   
        const endTime = Date.now()
        console.log(`复制完成，耗时 ${endTime - startTime}ms`)
        process.exit(0)
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`错误: 源路径不存在 — ${srcPath}`);
        } else if (error.code === 'EACCES') {
            console.error(`错误: 权限不足 — ${error.path}`);
        } else {
            console.error(`错误: ${error.message}`);
        }
        process.exit(1);
    }
}

copy(srcPath, destPath)