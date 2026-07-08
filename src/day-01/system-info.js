const os = require('node:os')

function formatBytes(bytes) {
  const mb = (bytes / 1024 / 1024).toFixed(2);
  return `${mb} MB`;
}

function formatUptime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours}h ${minutes}m ${secs}s`;
}

console.log("NodeJS 版本：", process.version);

console.log("操作系统类型：", os.platform());
console.log("操作系统版本：", os.version());

console.log('CPU 架构：', os.arch())

console.log('文件位置：', __dirname)

console.log('当前用户主目录：', os.homedir())
console.log('当前工作目录：', process.cwd())


console.log('内存相关：')
console.log('总内存：', formatBytes(os.totalmem()))
console.log('剩余内存：', formatBytes(os.freemem()))


console.log('进程运行时间：', formatUptime(process.uptime()))
console.log('系统运行时间：', formatUptime(os.uptime()))