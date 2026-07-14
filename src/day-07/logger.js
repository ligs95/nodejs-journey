// 实现一个请求日志函数，记录每个请求的：
// - 方法、URL、状态码
// - 响应时间（毫秒）
// - 请求体大小
// - 响应体大小

// 输出格式：`[2024-01-15T10:30:00] GET /api/users 200 45ms 0B → 1.2KB`
const http = require("http");

// 格式化字节大小为人类可读格式
function formatSize(bytes) {
  if (bytes === 0) return "0B";
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}KB`;
}

function logger(handler) {
  return (req, res) => {
    const start = Date.now();
    const { method, url } = req;

    // 追踪请求体大小
    let reqBodySize = 0;
    req.on("data", (chunk) => {
      reqBodySize += chunk.length;
    });

    // 保存原始方法的引用
    const originalWriteHead = res.writeHead;
    const originalWrite = res.write;
    const originalEnd = res.end;

    let statusCode = 200;
    let resBodySize = 0;

    // 拦截 writeHead 以捕获实际状态码
    res.writeHead = function (code, ...args) {
      statusCode = code;
      return originalWriteHead.call(res, code, ...args);
    };

    // 拦截 write 以追踪流式写入的响应体大小
    res.write = function (chunk, ...args) {
      if (chunk) {
        resBodySize += Buffer.isBuffer(chunk)
          ? chunk.length
          : Buffer.byteLength(chunk);
      }
      return originalWrite.call(res, chunk, ...args);
    };

    // 拦截 end 以追踪最终响应体大小并打印日志
    res.end = function (chunk, ...args) {
      const duration = Date.now() - start;
      if (chunk) {
        resBodySize += Buffer.isBuffer(chunk)
          ? chunk.length
          : Buffer.byteLength(chunk);
      }
      console.log(
        `[${new Date().toISOString()}] ${method} ${url} ${statusCode} ${duration}ms ${formatSize(reqBodySize)} → ${formatSize(resBodySize)}`,
      );
      return originalEnd.call(res, chunk, ...args);
    };

    handler(req, res);
  };
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const body = Buffer.concat(chunks).toString();
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve(body);
      }
    });
    req.on("error", reject);
  });
}
const handler = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Welcome to the API",
        timestamp: new Date().toISOString(),
      }),
    );
  } else if (url.pathname === "/api/users" && req.method === "GET") {
    const users = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" },
    ];
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(users));
  } else if (url.pathname === "/api/users" && req.method === "POST") {
    const body = await parseBody(req);
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "User created", data: body }));
  } else if (
    url.pathname === "/api/users" &&
    req.method !== "GET" &&
    req.method !== "POST"
  ) {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  }
};

const server = http.createServer(logger(handler));
server.listen(3000, () => {
  console.log("🚀 服务器运行在 http://localhost:3000");
  console.log("");
  console.log("测试接口:");
  console.log("  curl http://localhost:3000/");
  console.log("  curl http://localhost:3000/api/users");
  console.log(
    '  curl -X POST -H "Content-Type: application/json" -d \'{"name":"Dave"}\' http://localhost:3000/api/users',
  );
  console.log("  curl http://localhost:3000/api/unknown");
});
