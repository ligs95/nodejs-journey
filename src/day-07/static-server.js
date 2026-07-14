// ```bash
// node static-server.js ./public 8080
// ```

// **要求**：
// - 提供指定目录下的静态文件
// - 正确设置 `Content-Type`（根据文件扩展名）
// - 处理 404（文件不存在）
// - 目录访问时自动查找 `index.html`
// - 支持 `Range` 请求（用于视频播放）

const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");

const argv = process.argv.slice(2);

const dir = argv[0];
const port = argv[1];

if (!dir || !port) {
  console.error("Usage: node static-server.js <dir> <port>");
  process.exit(1);
}

const contentTypes = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".txt": "text/plain",
  ".json": "application/json",
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
};

const root = path.resolve(dir);

const server = http.createServer((req, res) => {
  // 去掉开头的 "/static"，拼接文件路径
  const urlPath = req.url.slice("/static".length);
  // "." + urlPath 保证 path.join 把它当相对路径，避免跳到系统根目录
  const filePath = path.join(root, "." + urlPath);

  // 防止 ../ 路径遍历攻击
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  // 文件不存在 → 404
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end("Not Found");
    return;
  }

  // 目录 → 补 index.html
  if (fs.statSync(filePath).isDirectory()) {
    const indexPath = path.join(filePath, "index.html");
    if (!fs.existsSync(indexPath)) {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }
    const ext = path.extname(indexPath);
    res.writeHead(200, {
      "Content-Type": contentTypes[ext] || "application/octet-stream",
    });
    fs.createReadStream(indexPath).pipe(res);
    return;
  }

  const ext = path.extname(filePath);
  res.writeHead(200, {
    "Content-Type": contentTypes[ext] || "application/octet-stream",
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/static/`);
});
