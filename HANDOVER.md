# XIAO Landing Page — 交接文档

> 本文以 **GitHub 上的仓库**为准。本地开发目录与仓库结构存在出入，详见下文「本地 vs GitHub 仓库」。

## 1. 仓库是什么

Seeed Studio XIAO 系列的官方落地页，一个 **Next.js 静态导出（`output: "export"`）** 站点，托管在 GitHub Pages。

- 仓库：`Seeed-Projects/XIAO_Landing_Page`
- 地址：https://github.com/Seeed-Projects/XIAO_Landing_Page
- 线上：https://seeed-projects.github.io/XIAO_Landing_Page/
- 部署方式：push 到 `main` → GitHub Actions 自动构建并发布到 GitHub Pages（无需手动操作）

## 2. 技术栈

| 项 | 选型 |
|---|---|
| 框架 | Next.js 16（App Router，Turbopack） |
| UI | React + Tailwind CSS v4 |
| 模型/查看 | three.js、occt-import-js、pdfjs-dist（3D / 模型 / PDF 预览） |
| 烧录 | esptool-js（浏览器内 Web Serial 烧录 ESP 固件） |
| 压缩 | fflate |
| 导出 | `output: "export"` → 纯静态 HTML，无 Node 运行时 |

## 3. 仓库目录结构（GitHub 上）

```
.
├── .github/workflows/deploy.yml   # CI：构建 + 部署到 GitHub Pages
├── .env.development                # 本地 dev 专用（NEXT_PUBLIC_BASE_PATH）
├── next.config.js                  # basePath / output:export / 等配置
├── src/
│   └── app/                        # App Router 页面 + 组件
├── public/                         # 静态资源（会被原样复制进导出包，是页面真正引用的图片）
│   ├── home/                       #   首页用图
│   ├── home-carousel/              #   首页轮播
│   ├── xiao-products/dev_boards/  #   产品/板图（catalog、pinout 透明底板）
│   ├── firmware/                   #   flasher 服务副本（仅 .bin）
│   └── ...
├── scripts/                        # 构建期烘焙脚本（project-hub iframe、discussions）
├── firmware/                       # 固件源（README + blink.ino + .bin），按板型分
├── picture/                        # 源素材图（约 244M），页面不直接引用
├── res_in/                         # RES 源素材，页面不直接引用
└── package.json
```

> **`public/` 与 `firmware/ picture/ res_in/` 的区别**：只有 `public/` 下的文件会被站点访问到。`firmware/ picture/ res_in/` 是**源素材**（仓库内的备份 / 工作目录），应用代码**不引用**它们。页面真正用的图都在 `public/` 下。

## 4. 本地 vs GitHub 仓库（出入）

本地开发机的目录长这样：

```
…/landing_page/
├── code/frontend/      ← 这一层才是 git 仓库（仓库根 = frontend/ 的内容）
├── firmware/           ← 源（已同步进仓库根 firmware/）
├── picture/            ← 源（已同步进仓库根 picture/）
├── res_in/             ← 源（已同步进仓库根 res_in/）
└── 参考资料/            ← 不在仓库内
```

出入点：
1. **仓库根是 `frontend/` 的内容**，本地多了一层 `code/` 外壳；`参考资料/` 不入库。
2. **本地 `firmware/ picture/ res_in/` 已镜像进仓库根**，与 `src/`、`public/` 平级。
3. **`picture/` 体量大（约 244M）**：在仓库里是源素材，**不在 `public/`**，所以不会进静态导出、不影响页面、不拖慢构建。若要在页面上用其中某张图，需把它复制进 `public/` 并在代码里引用。

## 5. 本地运行

```bash
git clone https://github.com/Seeed-Projects/XIAO_Landing_Page.git
cd XIAO_Landing_Page
npm install
npm run dev
```

打开 **http://localhost:3000/XIAO_Landing_Page/**（注意带子路径前缀和末尾斜杠）。

> 访问 `http://localhost:3000/` 会 404——因为 `next.config.js` 设了 `basePath: /XIAO_Landing_Page`。

**`.env.development` 已配好**，fork 后直接 `npm run dev` 图片即可正常显示，无需额外设置环境变量。

## 6. 构建与部署

- 本地模拟生产构建：`npm run build` → 生成 `out/` 静态目录。
- 正式部署：**push 到 `main`** 即触发 `.github/workflows/deploy.yml`：
  1. `npm ci`
  2. `npm run build`（先跑 `prebuild` 烘焙 project-hub iframe、discussions）
  3. 上传 Pages artifact → 发布到 GitHub Pages
- 构建期环境变量（CI 注入，本地不需要）：
  - `NEXT_PUBLIC_BASE_PATH=/XIAO_Landing_Page`
  - `NEXT_PUBLIC_GTM_ID`、`NEXT_PUBLIC_GTM_MEASUREMENT_ID`（可选，由 GitHub Variables 提供）

## 7. 页面路由

| 路径 | 说明 |
|---|---|
| `/` | 首页（轮播、产品概览、开发者生态、合作伙伴、新闻、评价、订阅） |
| `/products/` | 产品选型（Dev Boards / Add-ons / Gadgets） |
| `/res/` | RES 资源中心（文档 / 固件 / 模型下载） |
| `/project-hub/` | 项目中心（内嵌 OSHW 站点 iframe） |
| `/playground/` | Playground 入口 |
| `/playground/pinout/` | 引脚图 Pinout |
| `/playground/esp-flasher/` | 浏览器固件烧录器 |
| `/open-roadmap/` | 开源路线图 |
| `/software-center/` | 软件中心（含 `[slug]`、`official` 子路由） |

## 8. 关键约定

### 子路径前缀 `withBase()`
站点部署在 GitHub Pages 子路径 `/XIAO_Landing_Page/`。Next 自动给 `<Link>`/`<Image>`/`_next` 加前缀，但**字面量**（`<img src="/x">`、`fetch("/x")`、CSS `url('/x')`）不会自动加。所有本地绝对路径必须用 `src/lib/basePath.js` 的 `withBase()` 包裹：

```js
import { withBase } from "../lib/basePath";
<img src={withBase("/home/foo.png")} />
```

`withBase()` 读 `NEXT_PUBLIC_BASE_PATH`：本地 dev 由 `.env.development` 提供，CI 由 workflow 注入。

### 构建期烘焙脚本（`scripts/`）
- `bake-project-hub-embed.js`：构建时抓取远程 OSHW 项目站，注入 `<base>` + 高度桥接，写 `public/project-hub-embed.html`（gitignored，CI 时重新生成）。
- `bake-discussions.js`：烘焙讨论数据。
- 两者在 `prebuild` 阶段跑，`npm run dev` 不跑（dev 时用 fallback）。

### 图片引用
- 页面图片统一放 `public/`，引用时走 `withBase()`。
- 板图在 `public/xiao-products/dev_boards/`。
- flasher 固件在 `public/firmware/<board>/*.bin`（源副本在仓库根 `firmware/`）。

## 9. 已知问题 / 注意事项

1. **部分外链图床在国内可能加载失败**：partner logo 用了 `simpleicons.org`、`icon.horse`；新闻/项目区用了 `i.ytimg.com`、`raw.githubusercontent.com` 等。这些 CDN 被墙时图位空白——**与本地配置无关**，要彻底解决需把外链图本地化到 `public/` 再改引用。
2. **dev 日志偶有 `TypeError: Cannot convert argument to a ByteString …`**：某处往 HTTP header 写了非 ASCII 字符，不影响页面渲染，可暂忽略。
3. **`picture/`（244M）已在仓库根**：clone 会慢一些，但不会进静态导出。如需给页面加图，复制具体文件到 `public/` 即可，不要整体塞进 `public/`。
4. **`next.config.js` 与 `next.config.mjs` 并存**：实际生效的是 `next.config.js`（`.mjs` 是空壳），可择机清理。

## 10. 常用命令

```bash
npm run dev      # 本地开发（http://localhost:3000/XIAO_Landing_Page/）
npm run build    # 生产构建 → out/
npm run lint     # ESLint
```
