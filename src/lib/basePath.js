// 静态导出部署到子路径（如 GitHub Pages 的 /<repo>/）时，
// next.config 的 basePath 会自动给 <Link>/<Image>/_next 前缀，
// 但客户端字面量 fetch("/x")、<img src="/x">、inline url('/x') 不会自动加。
// 用 NEXT_PUBLIC_BASE_PATH（构建期注入）手动前缀。

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

// 给本地绝对路径加前缀；外部 URL(http)原样返回
export function withBase(p) {
  if (!p) return p;
  if (/^https?:\/\//.test(p) || p.startsWith("//")) return p;
  return p.startsWith("/") ? BASE_PATH + p : BASE_PATH + "/" + p;
}
