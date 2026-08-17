/** @type {import('next').NextConfig} */

// 静态导出部署：GitHub Pages 默认服务在 /<repo>/ 子路径，
// 用 NEXT_PUBLIC_BASE_PATH 注入前缀（本地/CI 默认 /XIAO_Landing_Page，
// 日后上 seeedstudio.com 根域名时设为空串、子路径时设对应前缀）。
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/XIAO_Landing_Page";

const nextConfig = {
  /* esptool-js 未声明 type:module 但源码为 ESM，需显式转译以供浏览器打包 */
  transpilePackages: ["esptool-js"],

  // 静态 HTML 导出（供 GitHub Pages 托管，无 Node 运行时）
  output: "export",

  // 子路径前缀：Next 自动给 _next/<Link>/<Image> 加，客户端字面量用 withBase() 手动加
  basePath,
  assetPrefix: basePath,

  // GitHub Pages 静态目录友好：/res → /res/index.html
  trailingSlash: true,

  // 静态导出不支持 next/image 优化
  images: { unoptimized: true },
};

export default nextConfig;
