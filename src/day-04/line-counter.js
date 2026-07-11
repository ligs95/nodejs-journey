const fs = require("node:fs");
const path = require("node:path");
const {Transform} = require('node:stream')

const src = process.argv[2];

if (!src) {
  console.error("请提供文件路径");
  process.exit(1);
}

let lineCount = 0

const filePath = path.join(__dirname, src)
const reader = fs.createReadStream(filePath, {
    'encoding': 'utf-8',
    highWaterMark: 64 * 1024
});

// 自定义 Transform：逐 chunk 统计换行符数量
const lineCounter = new Transform({
  transform(chunk, _encoding, callback) {
    const lines = chunk.toString().split('\n');
    lineCount += lines.length - 1;
    callback();
  },
  flush(callback) {
    // 全部读完，最后一行如果没有 \n 也算一行
    // 通过 push 输出结果（必须是字符串）
    this.push(`文件总行数: ${lineCount + 1}`);
    callback();
  },
});

reader.pipe(lineCounter).pipe(process.stdout);