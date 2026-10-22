import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { announcementThread } from "./open-roadmap/announcement-thread.mjs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const source = read("./open-roadmap/communityRoadmap.js");
const css = read("./open-roadmap/community-roadmap.module.css");
const thread = source.match(/const CHAT_INTERVAL_MS[\s\S]*?\nfunction IdeaCard/)?.[0];

test("Open Roadmap thread keeps the Seeed announcement and the ordered team and community messages", () => {
  const { post, replies } = announcementThread;
  assert.equal(post.name, "Seeed Studio");
  assert.equal(post.avatar, "/home/seeed-studio-youtube-avatar.jpg");
  assert.equal(post.url, "https://github.com/Seeed-Studio/OSHW-XIAO-Series/discussions/1");
  assert.deepEqual(post.reactions, { thumbsUp: 12, hooray: 6, heart: 3, rocket: 5 });
  assert.equal(post.commentCount, 59);
  assert.deepEqual(replies.map(({ login }) => login), ["kevin-seeed", "nickeyjoy", "rei-vilo", "botamochi6277", "malachib", "limengdu", "meilily"]);
  for (const reply of replies) {
    assert.match(reply.avatar, /^https:\/\/avatars\.githubusercontent\.com\/u\//);
    assert.equal(Object.hasOwn(reply, "createdAt"), false);
    for (const lang of ["en", "zh"]) {
      assert.ok(Array.isArray(reply.text[lang]) && reply.text[lang].length > 0, reply.login);
      assert.ok(reply.text[lang].every((line) => line && !line.endsWith("…")), reply.login);
    }
  }
});

test("Team notes carry role badges and community replies keep their original comment links", () => {
  const team = announcementThread.replies.filter(({ team }) => team);
  const community = announcementThread.replies.filter(({ team }) => !team);
  assert.deepEqual(team.map(({ login, name, role }) => [login, name, role.en, role.zh]), [
    ["kevin-seeed", "Kevin", "Product Manager", "产品经理"],
    ["nickeyjoy", "Nickey", "Product Manager", "产品经理"],
    ["limengdu", "Citric Li", "Application Engineer", "应用工程师"],
    ["meilily", "Meilily", "Marketing Manager", "市场经理"],
  ]);
  for (const reply of team) assert.equal(reply.url, announcementThread.post.url);
  for (const reply of community) {
    assert.equal(reply.contributor, true);
    assert.match(reply.url, /^https:\/\/github\.com\/Seeed-Studio\/OSHW-XIAO-Series\/discussions\/1#discussioncomment-\d+$/);
  }
  assert.deepEqual(community.find(({ login }) => login === "malachib").text.en, [
    "I would vote for ESP32S31.",
    "The promise of an MMU and PPA-style things makes ESP32S31 a game changer.",
  ]);
  assert.match(thread, /\{labels\.team\[lang\]\}[\s\S]*?\{reply\.role\[lang\]\}[\s\S]*?\{labels\.contributor\[lang\]\}/);
  assert.doesNotMatch(thread, /<time\b/);
});

test("The announcement shows the original post text in full", () => {
  const { body } = announcementThread.post;
  assert.ok(body.en.startsWith("## 👋 Welcome to the Roadmap Discussions of Seeed XIAO.\r\n"));
  assert.ok(body.en.includes("  * Vote your favorite 💚 roadmap entries by clicking the up arrow ⬆️  or joining the discussion "));
  assert.ok(body.en.includes("  * Add your proposals for the roadmap or share your wishes, ideas, suggestions, or feedback by initiating New Discussion."));
  assert.ok(body.en.includes("  * Engage with other community members."));
  assert.ok(body.en.endsWith("Please be open-minded and remember that this is a community we build together 💪."));
  for (const lang of ["en", "zh"]) assert.doesNotMatch(body[lang], /<!--|-->/);
  assert.match(thread, /<section className=\{styles\.announcementThread\} aria-labelledby="roadmap-announcement">/);
  assert.match(thread, /src=\{withBase\(post\.avatar\)\}/);
  assert.match(thread, /<h2 id="roadmap-announcement" className=\{`[^`]*home-type-subtitle`\}/);
  assert.match(thread, /<AnnouncementBody body=\{body\} \/>/);
  assert.doesNotMatch(thread, /aria-expanded|threadHeader|labels\.groupName/);
});

test("Desktop splits announcement and chat; the chat column loops messages within the announcement height", () => {
  assert.match(css, /@media \(min-width: 1024px\) \{\s*\.announcementThread \{\s*display: grid;\s*grid-template-columns: minmax\(0, 0\.95fr\) minmax\(0, 1\.05fr\)/);
  assert.match(css, /\.threadChatInner \{ position: absolute; inset: 0; \}/);
  assert.match(css, /\.threadStream \{[^}]*overflow: hidden;[^}]*mask-image: linear-gradient/);
  assert.match(thread, /const CHAT_INTERVAL_MS = 4200;/);
  assert.match(thread, /replies\[index % replies\.length\]/);
  assert.match(thread, /new IntersectionObserver/);
  assert.match(thread, /prefers-reduced-motion: reduce/);
  assert.match(thread, /onMouseEnter=\{\(\) => setPaused\(true\)\}/);
  assert.match(css, /\.threadCommunity \{[^}]*--thread-bubble: var\(--theme-blue\);[^}]*align-self: flex-end;\s*flex-direction: row-reverse/);
  assert.match(thread, /<a className=\{styles\.threadComposer\} href=\{post\.url\}[^>]*aria-label=\{labels\.join\[lang\]\}/);
  assert.doesNotMatch(thread, /onWheel|preventDefault|overflow-y/);
});
