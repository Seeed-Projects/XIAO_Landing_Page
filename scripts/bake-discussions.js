// Build-time bake of GitHub Discussions for the Open Roadmap board.
// Fetches Seeed-Studio/OSHW-XIAO-Series discussions and writes
// public/open-roadmap/discussions.json (schema v2).
//
// With GH_TOKEN / GITHUB_TOKEN: GraphQL (exact upvoteCount).
// Without token: REST preview (votes ≈ positive reactions).
// Fetch failure keeps the existing JSON so the build never fails.

const fs = require("node:fs");

const OWNER = "Seeed-Studio";
const NAME = "OSHW-XIAO-Series";
const OUT = "public/open-roadmap/discussions.json";
const GRAPHQL = "https://api.github.com/graphql";
const REST = `https://api.github.com/repos/${OWNER}/${NAME}/discussions?per_page=100`;

/** GitHub category slug → board stage id */
const CATEGORY_TO_STAGE = {
  "wish-list": "wish",
  "open-for-vote": "vote",
  "in-development": "dev",
  accomplished: "done",
  "help-needed": "help",
};

/** Labels that become topic chips on cards */
const TOPIC_WHITELIST = new Set([
  "XIAO Boards",
  "XIAO Accessories",
  "Software Dev",
]);

const STAGE_ORDER = ["wish", "vote", "dev", "done", "help"];

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
        createdAt
        updatedAt
        upvoteCount
        comments { totalCount }
        category { name slug }
        labels(first: 20) { nodes { name } }
      }
    }
  }
}`;

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

function pickTopics(labelNames) {
  const out = [];
  for (const name of labelNames || []) {
    if (TOPIC_WHITELIST.has(name) && !out.includes(name)) out.push(name);
  }
  return out;
}

function mapNode({ number, title, body, url, createdAt, updatedAt, votes, comments, categorySlug, labelNames }) {
  if (number === 1) return null;
  const stage = CATEGORY_TO_STAGE[categorySlug] || "wish";
  const text = strip(body || "");
  return {
    id: "d" + number,
    number,
    title: { en: title, zh: title },
    excerpt: { en: text.slice(0, 160), zh: text.slice(0, 160) },
    stage,
    topics: pickTopics(labelNames),
    votes: votes ?? 0,
    comments: comments ?? 0,
    createdAt: (createdAt || "").slice(0, 10),
    updatedAt: (updatedAt || "").slice(0, 10),
    url,
  };
}

function mapGraphQL(node) {
  return mapNode({
    number: node.number,
    title: node.title,
    body: node.body,
    url: node.url,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    votes: node.upvoteCount ?? 0,
    comments: node.comments?.totalCount ?? 0,
    categorySlug: node.category?.slug || "",
    labelNames: (node.labels?.nodes || []).map((l) => l.name),
  });
}

function mapREST(node) {
  const reactions = node.reactions || {};
  const heat =
    (+reactions["+1"] || 0) +
    (+reactions.hooray || 0) +
    (+reactions.heart || 0) +
    (+reactions.rocket || 0);
  const labels = Array.isArray(node.labels)
    ? node.labels.map((l) => (typeof l === "string" ? l : l.name))
    : [];
  return mapNode({
    number: node.number,
    title: node.title,
    body: node.body,
    url: node.html_url,
    createdAt: node.created_at,
    updatedAt: node.updated_at,
    votes: heat,
    comments: node.comments ?? 0,
    categorySlug: node.category?.slug || "",
    labelNames: labels,
  });
}

function sortItems(items) {
  return items.slice().sort((a, b) => {
    const sa = STAGE_ORDER.indexOf(a.stage);
    const sb = STAGE_ORDER.indexOf(b.stage);
    if (sa !== sb) return sa - sb;
    if (b.votes !== a.votes) return b.votes - a.votes;
    if (b.comments !== a.comments) return b.comments - a.comments;
    return String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
  });
}

async function fetchGraphQL(token) {
  const items = [];
  let after = null;
  let pages = 0;
  do {
    const res = await fetch(GRAPHQL, {
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
    if (json.errors?.length) {
      throw new Error("GraphQL errors: " + JSON.stringify(json.errors));
    }
    const conn = json.data?.repository?.discussions;
    if (!conn) throw new Error("GraphQL: no discussions in response");
    for (const node of conn.nodes || []) {
      const item = mapGraphQL(node);
      if (item) items.push(item);
    }
    after = conn.pageInfo?.hasNextPage ? conn.pageInfo.endCursor : null;
    pages += 1;
  } while (after && pages < 10);
  return items;
}

async function fetchREST() {
  const all = [];
  let page = 1;
  while (page <= 10) {
    const res = await fetch(`${REST}&page=${page}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "xiao-landing-bake-discussions",
      },
    });
    if (res.status === 403 || res.status === 429) {
      throw new Error(`REST rate-limited (HTTP ${res.status})`);
    }
    if (!res.ok) throw new Error(`REST HTTP ${res.status}`);
    const arr = await res.json();
    if (!Array.isArray(arr) || arr.length === 0) break;
    for (const node of arr) {
      const item = mapREST(node);
      if (item) all.push(item);
    }
    if (arr.length < 100) break;
    page += 1;
  }
  return all;
}

(async () => {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  try {
    let items;
    let source;
    if (token) {
      items = await fetchGraphQL(token);
      source = "GraphQL (upvoteCount)";
    } else {
      items = await fetchREST();
      source = "REST (votes≈reactions, unauthenticated)";
    }
    if (!items.length) {
      console.warn("[bake-discussions] fetched 0 items; keeping existing discussions.json");
      return;
    }
    items = sortItems(items);
    const dist = {};
    items.forEach((i) => {
      dist[i.stage] = (dist[i.stage] || 0) + 1;
    });
    fs.writeFileSync(OUT, JSON.stringify(items, null, 2), "utf8");
    console.log(
      `[bake-discussions] wrote ${items.length} discussions to ${OUT} via ${source} (stage dist: ${JSON.stringify(dist)})`
    );
  } catch (e) {
    console.warn(
      `[bake-discussions] fetch failed, keeping existing discussions.json: ${e?.message || e}`
    );
  }
})();
