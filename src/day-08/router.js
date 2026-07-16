// 为 `Router` 添加以下功能：
// - 支持查询参数（`?page=1&limit=10`）
// - 支持路由分组/前缀（如 `/api/v1/todos`）
// - 添加 `PATCH` 方法支持
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


module.exports = {
  Router
}