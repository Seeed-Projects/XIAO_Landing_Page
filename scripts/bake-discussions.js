// 构建期用 GitHub Discussions GraphQL API 全量抓取
// Seeed-Studio/OSHW-XIAO-Series 的 discussion，按 communityRoadmap.js
// 的 schema 生成 public/open-roadmap/discussions.json。
//
// 为什么需要：open-roadmap 页面只读静态 JSON，运行时不直连 GitHub。
// 改为此预构建脚本：构建期拉一次、烘焙成静态 JSON 放进 public/，
// 每次 npm run build（含 CI）都重跑，内容随 GitHub 更新而刷新。
// 无 token 或 fetch 失败时保留现有 JSON，绝不中断构建。
//
// CI 需在 build step 注入 env GH_TOKEN（见 deploy.yml）；
// 本地可用 GH_TOKEN=<pat> npm run build 触发。

const fs = require("node:fs");

const OWNER = "Seeed-Studio";
const NAME = "OSHW-XIAO-Series";
const OUT = "public/open-roadmap/discussions.json";
const ENDPOINT = "https://api.github.com/graphql";

// Discussion category → 现有 schema 的 status
const CATEGORY_TO_STATUS = {
  "open-for-vote": "vote",
  "in-development": "dev",
  "accomplished": "done",
  "wish-list": "idea",
  "help-needed": "review",
};

const STATUS_LABEL = {
  vote: { en: "Open for Vote", zh: "公开投票" },
  dev: { en: "In Development", zh: "开发中" },
  done: { en: "Completed", zh: "已完成" },
  idea: { en: "Idea", zh: "想法" },
  review: { en: "Help Needed", zh: "需要帮助" },
};

const QUERY = `query Discussions($owner: String!, $name: String!, $first: Int!, $after: String) {
  repository(owner: $owner, name: $name) {
    discussions(first: $first, after: $after, orderBy: {field: UPDATED_AT, direction: DESC}) {
      totalCount
      pageInfo { endCursor hasNextPage }
      nodes {
        number
        title
        body
        url
        updatedAt
        upvoteCount
        comments { totalCount }
        category { name slug }
        labels(first: 20) { nodes { name } }
      }
    }
  }
}`;

// markdown → 纯文本（去标题井号、链接、图片、代码块、粗体、列表、HTML 等）
function strip(md) {
  return (md || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/^>\s*/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/^---+$/gm, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&#8217;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function mapNode(node) {
  const slug = node.category?.slug || "";
  const status = CATEGORY_TO_STATUS[slug] || "idea";
  const text = strip(node.body || "");
  return {
    id: "d" + node.number,
    title: { en: node.title, zh: node.title },
    summary: { en: text.slice(0, 140), zh: text.slice(0, 140) },
    status,
    statusLabel: STATUS_LABEL[status] || STATUS_LABEL.idea,
    product: { en: "", zh: "" },
    votes: node.upvoteCount ?? 0,
    comments: node.comments?.totalCount ?? 0,
    updated: (node.updatedAt || "").slice(0, 10),
    helpNeeded: status === "review",
    proposed: { en: text.slice(0, 800), zh: text.slice(0, 800) },
    why: { en: "", zh: "" },
    update: { en: "", zh: "" },
    githubUrl: node.url,
  };
}

async function fetchPage(token, after) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "xiao-landing-bake-discussions",
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { owner: OWNER, name: NAME, first: 100, after },
    }),
  });
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors && json.errors.length) {
    throw new Error("GraphQL errors: " + JSON.stringify(json.errors));
  }
  if (!json.data?.repository?.discussions) {
    throw new Error("GraphQL: no discussions in response");
  }
  return json.data.repository.discussions;
}

(async () => {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn(
      "[bake-discussions] no GH_TOKEN/GITHUB_TOKEN env; keeping existing discussions.json"
    );
    return;
  }
  try {
    const items = [];
    let after = null;
    let pages = 0;
    do {
      const conn = await fetchPage(token, after);
      pages++;
      for (const node of conn.nodes || []) items.push(mapNode(node));
      after = conn.pageInfo?.hasNextPage ? conn.pageInfo.endCursor : null;
    } while (after && pages < 10); // 最多 10 页（1000 条）兜底防死循环

    const dist = {};
    items.forEach((i) => { dist[i.status] = (dist[i.status] || 0) + 1; });

    fs.writeFileSync(OUT, JSON.stringify(items, null, 2), "utf8");
    console.log(
      `[bake-discussions] wrote ${items.length} discussions to ${OUT} (status dist: ${JSON.stringify(dist)})`
    );
  } catch (e) {
    console.warn(
      `[bake-discussions] fetch failed, keeping existing discussions.json: ${e?.message || e}`
    );
  }
})();
