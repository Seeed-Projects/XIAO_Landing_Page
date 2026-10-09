// Build-time bake of GitHub Discussions for the Open Roadmap board.
// Fetches Seeed-Studio/OSHW-XIAO-Series discussions and writes
// public/open-roadmap/discussions.json (schema v3).
//
// With GH_TOKEN / GITHUB_TOKEN: GraphQL (exact upvoteCount + nested comments).
// Without token: REST preview (votes ≈ positive reactions; one comments
// request per discussion). Fetch failure keeps the existing JSON so the
// build never fails.

const fs = require("node:fs");

const OWNER = "Seeed-Studio";
const NAME = "OSHW-XIAO-Series";
const OUT = "public/open-roadmap/discussions.json";
const GRAPHQL = "https://api.github.com/graphql";
const REST = `https://api.github.com/repos/${OWNER}/${NAME}/discussions?per_page=100`;
const REST_HEADERS = {
  Accept: "application/vnd.github+json",
  "User-Agent": "xiao-landing-bake-discussions",
};

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
const SEEED_ASSOCIATIONS = new Set(["MEMBER", "OWNER"]);
const MAX_PARTICIPANTS = 8;
const IMAGE_EXT_RE = /\.(avif|gif|jpe?g|png|svg|webp)(?:[?#]|$)/i;

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
        closed
        answerChosenAt
        upvoteCount
        reactionGroups { content users { totalCount } }
        comments(first: 50) {
          totalCount
          nodes {
            createdAt
            authorAssociation
            author { login avatarUrl }
            replies(first: 20) {
              nodes {
                createdAt
                authorAssociation
                author { login avatarUrl }
              }
            }
          }
        }
        category { name slug }
        labels(first: 20) { nodes { name } }
        author { login avatarUrl }
      }
    }
  }
}`;

function strip(md) {
  return (md || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<img\b[^>]*>/gi, " ")
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

/** Build a short excerpt; drop empty text and bare URL-only bodies. */
function makeExcerpt(body) {
  const text = strip(body || "");
  if (!text) return "";
  if (/^https?:\/\/\S+$/i.test(text)) return "";
  return text.slice(0, 160);
}

/** Candidate image URLs from markdown / HTML / GitHub asset links. */
function collectImageCandidates(body) {
  const text = body || "";
  const out = [];
  const push = (url) => {
    if (url && !out.includes(url)) out.push(url);
  };
  for (const m of text.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)) push(m[1]);
  for (const m of text.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)) push(m[1]);
  for (const m of text.matchAll(
    /(https?:\/\/(?:user-images\.githubusercontent\.com|github\.com\/[^/\s]+\/[^/\s]+\/assets\/|github\.com\/user-attachments\/assets\/)[^\s)"<>]+)/gi
  )) {
    push(m[1]);
  }
  return out;
}

function looksLikeImageUrl(url) {
  return IMAGE_EXT_RE.test(url || "");
}

/**
 * Validate that a URL points at an image.
 * GitHub asset hosts reject HEAD (403), so use a 1-byte Range GET instead.
 */
async function resolveImage(body) {
  const candidates = collectImageCandidates(body);
  for (const url of candidates) {
    if (looksLikeImageUrl(url)) return url;
    try {
      const res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: {
          "User-Agent": "xiao-landing-bake-discussions",
          Range: "bytes=0-0",
        },
      });
      if (!(res.ok || res.status === 206)) continue;
      const ct = (res.headers.get("content-type") || "").toLowerCase();
      // Drain / cancel body so the connection can close promptly.
      try {
        await res.body?.cancel?.();
      } catch {
        /* ignore */
      }
      if (ct.startsWith("image/")) return url;
    } catch {
      // Skip unreachable assets and keep looking.
    }
  }
  return "";
}

function emptyReactions() {
  return { thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0 };
}

function mapReactionGroups(groups) {
  const out = emptyReactions();
  const keyMap = {
    THUMBS_UP: "thumbsUp",
    HOORAY: "hooray",
    HEART: "heart",
    ROCKET: "rocket",
    EYES: "eyes",
  };
  for (const g of groups || []) {
    const key = keyMap[g.content];
    if (key) out[key] = g.users?.totalCount ?? 0;
  }
  return out;
}

function mapRestReactions(reactions) {
  const r = reactions || {};
  return {
    thumbsUp: +r["+1"] || 0,
    hooray: +r.hooray || 0,
    heart: +r.heart || 0,
    rocket: +r.rocket || 0,
    eyes: +r.eyes || 0,
  };
}

/**
 * Merge author + comment/reply authors into a participant list.
 * Returns { participants, participantCount, seeedReplied, lastActivityAt }.
 */
function buildParticipants({ authorLogin, authorAvatar, createdAt, commentNodes }) {
  const seen = new Set();
  const list = [];
  let seeedReplied = false;
  let lastActivityAt = createdAt || "";

  const add = (login, avatar, association, created) => {
    if (!login) return;
    if (SEEED_ASSOCIATIONS.has(association)) seeedReplied = true;
    if (created && String(created) > String(lastActivityAt || "")) {
      lastActivityAt = created;
    }
    if (seen.has(login)) return;
    seen.add(login);
    list.push({ login, avatar: avatar || "" });
  };

  add(authorLogin, authorAvatar, "", createdAt);

  for (const node of commentNodes || []) {
    add(
      node.author?.login || node.user?.login || "",
      node.author?.avatarUrl || node.user?.avatar_url || "",
      node.authorAssociation || node.author_association || "",
      node.createdAt || node.created_at || ""
    );
    const replies = node.replies?.nodes || node.replies || [];
    for (const reply of replies) {
      add(
        reply.author?.login || reply.user?.login || "",
        reply.author?.avatarUrl || reply.user?.avatar_url || "",
        reply.authorAssociation || reply.author_association || "",
        reply.createdAt || reply.created_at || ""
      );
    }
  }

  return {
    participants: list.slice(0, MAX_PARTICIPANTS),
    participantCount: list.length,
    seeedReplied,
    lastActivityAt: (lastActivityAt || createdAt || "").slice(0, 10),
  };
}

function pickTopics(labelNames) {
  const out = [];
  for (const name of labelNames || []) {
    if (TOPIC_WHITELIST.has(name) && !out.includes(name)) out.push(name);
  }
  return out;
}

function warnUnknownMappings(items, labelNamesByNumber) {
  const unknownCats = new Set();
  const unknownLabels = new Set();
  for (const item of items) {
    // Stage already remapped; detect via original slug stored on temporary field.
    if (item._categorySlug && !(item._categorySlug in CATEGORY_TO_STAGE)) {
      unknownCats.add(item._categorySlug);
    }
    for (const name of labelNamesByNumber.get(item.number) || []) {
      if (!TOPIC_WHITELIST.has(name)) unknownLabels.add(name);
    }
  }
  if (unknownCats.size) {
    console.warn(
      `[bake-discussions] unmapped category slugs: ${[...unknownCats].join(", ")}`
    );
  }
  if (unknownLabels.size) {
    console.warn(
      `[bake-discussions] labels outside topic whitelist (ignored as chips): ${[...unknownLabels].join(", ")}`
    );
  }
}

async function mapNode({
  number,
  title,
  body,
  url,
  createdAt,
  updatedAt,
  votes,
  comments,
  categorySlug,
  labelNames,
  authorLogin,
  authorAvatar,
  closed,
  answered,
  reactions,
  commentNodes,
}) {
  if (number === 1) return null;
  const stage = CATEGORY_TO_STAGE[categorySlug] || "wish";
  const text = makeExcerpt(body);
  const image = await resolveImage(body);
  const social = buildParticipants({
    authorLogin,
    authorAvatar,
    createdAt,
    commentNodes,
  });

  return {
    id: "d" + number,
    number,
    title: { en: title, zh: title },
    excerpt: { en: text, zh: text },
    stage,
    topics: pickTopics(labelNames),
    votes: votes ?? 0,
    comments: comments ?? 0,
    createdAt: (createdAt || "").slice(0, 10),
    updatedAt: (updatedAt || "").slice(0, 10),
    lastActivityAt: social.lastActivityAt,
    url,
    image,
    author: authorLogin
      ? { login: authorLogin, avatar: authorAvatar || "" }
      : null,
    participants: social.participants,
    participantCount: social.participantCount,
    seeedReplied: social.seeedReplied,
    reactions: reactions || emptyReactions(),
    answered: Boolean(answered),
    closed: Boolean(closed),
    _categorySlug: categorySlug || "",
  };
}

async function mapGraphQL(node) {
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
    authorLogin: node.author?.login || "",
    authorAvatar: node.author?.avatarUrl || "",
    closed: Boolean(node.closed),
    answered: Boolean(node.answerChosenAt),
    reactions: mapReactionGroups(node.reactionGroups),
    commentNodes: node.comments?.nodes || [],
  });
}

async function fetchComments(number) {
  const url = `https://api.github.com/repos/${OWNER}/${NAME}/discussions/${number}/comments?per_page=100`;
  const res = await fetch(url, { headers: REST_HEADERS });
  if (res.status === 403 || res.status === 429) {
    throw new Error(`REST comments rate-limited (HTTP ${res.status})`);
  }
  if (!res.ok) throw new Error(`REST comments HTTP ${res.status} for #${number}`);
  const arr = await res.json();
  return Array.isArray(arr) ? arr : [];
}

async function mapREST(node) {
  const reactions = mapRestReactions(node.reactions);
  const labels = Array.isArray(node.labels)
    ? node.labels.map((l) => (typeof l === "string" ? l : l.name))
    : [];
  const commentNodes = await fetchComments(node.number);
  const heat =
    reactions.thumbsUp + reactions.hooray + reactions.heart + reactions.rocket;
  return mapNode({
    number: node.number,
    title: node.title,
    body: node.body,
    url: node.html_url,
    createdAt: node.created_at,
    updatedAt: node.updated_at,
    votes: heat,
    comments: node.comments ?? commentNodes.length,
    categorySlug: node.category?.slug || "",
    labelNames: labels,
    authorLogin: node.user?.login || "",
    authorAvatar: node.user?.avatar_url || "",
    closed: node.state === "closed",
    answered: Boolean(node.answer_chosen_at),
    reactions,
    commentNodes,
  });
}

function sortItems(items) {
  return items.slice().sort((a, b) => {
    const sa = STAGE_ORDER.indexOf(a.stage);
    const sb = STAGE_ORDER.indexOf(b.stage);
    if (sa !== sb) return sa - sb;
    if (b.votes !== a.votes) return b.votes - a.votes;
    if ((b.participantCount || 0) !== (a.participantCount || 0)) {
      return (b.participantCount || 0) - (a.participantCount || 0);
    }
    return String(b.lastActivityAt || "").localeCompare(String(a.lastActivityAt || ""));
  });
}

function stripInternal(items) {
  return items.map((item) => {
    const { _categorySlug, ...rest } = item;
    return rest;
  });
}

async function fetchGraphQL(token) {
  const items = [];
  const labelNamesByNumber = new Map();
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
      labelNamesByNumber.set(
        node.number,
        (node.labels?.nodes || []).map((l) => l.name)
      );
      const item = await mapGraphQL(node);
      if (item) items.push(item);
    }
    after = conn.pageInfo?.hasNextPage ? conn.pageInfo.endCursor : null;
    pages += 1;
  } while (after && pages < 10);
  return { items, labelNamesByNumber };
}

async function fetchREST() {
  const all = [];
  const labelNamesByNumber = new Map();
  let page = 1;
  while (page <= 10) {
    const res = await fetch(`${REST}&page=${page}`, { headers: REST_HEADERS });
    if (res.status === 403 || res.status === 429) {
      throw new Error(`REST rate-limited (HTTP ${res.status})`);
    }
    if (!res.ok) throw new Error(`REST HTTP ${res.status}`);
    const arr = await res.json();
    if (!Array.isArray(arr) || arr.length === 0) break;
    for (const node of arr) {
      const labels = Array.isArray(node.labels)
        ? node.labels.map((l) => (typeof l === "string" ? l : l.name))
        : [];
      labelNamesByNumber.set(node.number, labels);
      const item = await mapREST(node);
      if (item) all.push(item);
    }
    if (arr.length < 100) break;
    page += 1;
  }
  return { items: all, labelNamesByNumber };
}

(async () => {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  try {
    let payload;
    let source;
    if (token) {
      payload = await fetchGraphQL(token);
      source = "GraphQL (upvoteCount + nested comments)";
    } else {
      payload = await fetchREST();
      source = "REST (votes≈reactions, per-discussion comments)";
    }
    let { items, labelNamesByNumber } = payload;
    if (!items.length) {
      console.warn("[bake-discussions] fetched 0 items; keeping existing discussions.json");
      return;
    }
    warnUnknownMappings(items, labelNamesByNumber);
    items = stripInternal(sortItems(items));
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
