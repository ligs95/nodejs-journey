// 为 `Router` 添加以下功能：
// - 支持查询参数（`?page=1&limit=10`）
// - 支持路由分组/前缀（如 `/api/v1/todos`）
// - 添加 `PATCH` 方法支持

import http from "node:http";

/**
 * @typedef {import('node:http').IncomingMessage & {
 *   body?: unknown,
 *   params?: object,
 *   query?: object
 * }} Req
 */

// ============ 简易路由器 ============

class Router {
  constructor(prefix = "") {
    this.routes = [];
    this.prefix = prefix;
  }

  _addRoute(method, path, handler) {
    this.routes.push({ method, path: this.prefix + path, handler });
  }

  get(path, handler) {
    this._addRoute("GET", path, handler);
  }

  post(path, handler) {
    this._addRoute("POST", path, handler);
  }

  put(path, handler) {
    this._addRoute("PUT", path, handler);
  }

  delete(path, handler) {
    this._addRoute("DELETE", path, handler);
  }

  patch(path, handler) {
    this._addRoute("PATCH", path, handler);
  }

  // 匹配路由
  match(method, urlOrPathname) {
    const [pathname, queryString = ""] = urlOrPathname.split("?");
    const query = Object.fromEntries(new URLSearchParams(queryString));

    for (const route of this.routes) {
      if (route.method !== method) continue;

      const params = this._matchPath(route.path, pathname);
      if (params !== null) {
        return { handler: route.handler, params, query };
      }
    }
    return null;
  }

  // 路径匹配（支持 :id 参数）
  _matchPath(routePath, requestPath) {
    const routeParts = routePath.split("/").filter(Boolean);
    const requestParts = requestPath.split("/").filter(Boolean);

    if (routeParts.length !== requestParts.length) return null;

    const params = {};

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(":")) {
        // 动态参数
        const paramName = routeParts[i].slice(1);
        params[paramName] = requestParts[i];
      } else if (routeParts[i] !== requestParts[i]) {
        return null;
      }
    }

    return params;
  }
}

// ============ JSON 请求体解析器 ============

function parseJSON(req) {
  return new Promise((resolve, reject) => {
    // 检查 Content-Type
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("application/json")) {
      resolve(null);
      return;
    }

    const chunks = [];
    let totalSize = 0;
    const MAX_SIZE = 1024 * 1024; // 1MB 限制

    req.on("data", (chunk) => {
      totalSize += chunk.length;
      if (totalSize > MAX_SIZE) {
        req.destroy();
        reject(new Error("请求体过大"));
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf-8");
      if (!raw) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("无效的 JSON 格式"));
      }
    });

    req.on("error", reject);
  });
}

// ============ 数据存储（内存） ============

let todos = [
  {
    id: 1,
    title: "学习 Node.js",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "写 REST API",
    completed: false,
    createdAt: new Date().toISOString(),
  },
];
let nextId = 3;

// ============ 路由定义 ============

const router = new Router();

// 获取所有 TODO
router.get("/api/todos", (req, res) => {
  sendJSON(res, 200, { data: todos, total: todos.length });
});

// 获取单个 TODO
router.get("/api/todos/:id", (req, res) => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id));
  if (!todo) {
    return sendJSON(res, 404, { error: "TODO 不存在" });
  }
  sendJSON(res, 200, { data: todo });
});

// 创建 TODO
router.post("/api/todos", async (req, res) => {
  const { title } = req.body || {};
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return sendJSON(res, 400, { error: "title 是必填项且不能为空" });
  }

  const todo = {
    id: nextId++,
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  todos.push(todo);
  sendJSON(res, 201, { data: todo });
});

// 更新 TODO
router.put("/api/todos/:id", async (req, res) => {
  const index = todos.findIndex((t) => t.id === parseInt(req.params.id));
  if (index === -1) {
    return sendJSON(res, 404, { error: "TODO 不存在" });
  }

  const { title, completed } = req.body || {};
  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) {
      return sendJSON(res, 400, { error: "title 必须是有效的字符串" });
    }
    todos[index].title = title.trim();
  }
  if (completed !== undefined) todos[index].completed = Boolean(completed);
  todos[index].updatedAt = new Date().toISOString();

  sendJSON(res, 200, { data: todos[index] });
});

// 部分更新 TODO（PATCH）
router.patch("/api/todos/:id", async (req, res) => {
  const index = todos.findIndex((t) => t.id === parseInt(req.params.id));
  if (index === -1) {
    return sendJSON(res, 404, { error: "TODO 不存在" });
  }

  const { title, completed } = req.body || {};
  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) {
      return sendJSON(res, 400, { error: "title 必须是有效的字符串" });
    }
    todos[index].title = title.trim();
  }
  if (completed !== undefined) todos[index].completed = Boolean(completed);
  todos[index].updatedAt = new Date().toISOString();

  sendJSON(res, 200, { data: todos[index] });
});

// 删除 TODO
router.delete("/api/todos/:id", (req, res) => {
  const index = todos.findIndex((t) => t.id === parseInt(req.params.id));
  if (index === -1) {
    return sendJSON(res, 404, { error: "TODO 不存在" });
  }
  todos.splice(index, 1);
  sendJSON(res, 204);
});

// ============ 辅助函数 ============

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  if (data) {
    res.end(JSON.stringify(data, null, 2));
  } else {
    res.end();
  }
}

// ============ 服务器 ============

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // 解析请求体
  try {
    (/** @type {Req} */ (req)).body = await parseJSON(req);
  } catch (error) {
    return sendJSON(res, 400, { error: error.message });
  }

  // 匹配路由
  const match = router.match(req.method, url.pathname + url.search);

  if (match) {
    (/** @type {Req} */ (req)).params = match.params;
    (/** @type {Req} */ (req)).query = match.query;
    try {
      await match.handler(req, res);
    } catch (error) {
      console.error("Handler error:", error);
      sendJSON(res, 500, { error: "服务器内部错误" });
    }
  } else {
    sendJSON(res, 404, { error: `Cannot ${req.method} ${url.pathname}` });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log("可用的 API:");
  console.log("  GET    /api/todos");
  console.log("  GET    /api/todos/:id");
  console.log("  POST   /api/todos");
  console.log("  PUT    /api/todos/:id");
  console.log("  PATCH  /api/todos/:id");
  console.log("  DELETE /api/todos/:id");
});
