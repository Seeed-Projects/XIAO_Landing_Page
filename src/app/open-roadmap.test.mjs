import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { announcementThread } from "./open-roadmap/announcement-thread.mjs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const source = read("./open-roadmap/communityRoadmap.js");
const css = read("./open-roadmap/community-roadmap.module.css");
const thread = source.match(/function AnnouncementThread\([\s\S]*?\nfunction IdeaCard/)?.[0];

test("Open Roadmap announcement preserves the opening post and curated community snapshot", () => {
  const { post, replies } = announcementThread;
  const community = replies.filter(({ team }) => !team);
  assert.equal(post.name, "Seeed Studio");
  assert.equal(post.avatar, "/home/seeed-studio-youtube-avatar.jpg");
  assert.equal(post.url, "https://github.com/Seeed-Studio/OSHW-XIAO-Series/discussions/1");
  assert.equal(post.createdAt, "2024-05-24T06:51:32Z");
  assert.deepEqual(post.reactions, { thumbsUp: 12, hooray: 6, heart: 3, rocket: 5 });
  assert.equal(post.commentCount, 59);
  assert.equal(replies.length, 7);
  assert.deepEqual(replies.map(({ login }) => login), ["kevin-seeed", "rei-vilo", "nickeyjoy", "botamochi6277", "limengdu", "malachib", "meilily"]);
  assert.deepEqual(community.map(({ createdAt }) => createdAt.slice(0, 10)), ["2024-07-19", "2024-07-23", "2026-04-20"]);
  assert.deepEqual(community.map(({ replyCount }) => replyCount), [20, 2, 4]);
  assert.deepEqual(community.map(({ reactions }) => reactions), [{}, {}, { thumbsUp: 8 }]);
  for (const reply of replies) {
    assert.match(reply.avatar, /^https:\/\/avatars\.githubusercontent\.com\/u\//);
  }
  for (const reply of community) {
    assert.match(reply.url, /^https:\/\/github\.com\/Seeed-Studio\/OSHW-XIAO-Series\/discussions\/1#discussioncomment-\d+$/);
  }
  for (const lang of ["en", "zh"]) {
    assert.ok(post.title[lang]);
    assert.ok(post.body[lang]);
    assert.equal(post.actions.length, 3);
    assert.ok(post.actions.every((action) => action[lang]));
    assert.ok(replies.every((reply) => reply.text[lang]));
    assert.ok(Object.entries(announcementThread.labels).filter(([key]) => key !== "reactions").every(([, label]) => label[lang]));
  }
});

test("Seeed team welcome notes identify their authors and roles and link to the discussion", () => {
  const team = announcementThread.replies.filter(({ team }) => team);
  assert.deepEqual(team.map(({ login, name, role, avatar }) => [login, name, role.en, role.zh, avatar]), [
    ["kevin-seeed", "Kevin", "Product Manager", "产品经理", "https://avatars.githubusercontent.com/u/170942971?v=4"],
    ["nickeyjoy", "Nickey", "Product Manager", "产品经理", "https://avatars.githubusercontent.com/u/41183632?v=4"],
    ["limengdu", "Citric Li", "Application Engineer", "应用工程师", "https://avatars.githubusercontent.com/u/37475446?v=4"],
    ["meilily", "Meilily", "Marketing Manager", "市场经理", "https://avatars.githubusercontent.com/u/111474938?v=4"],
  ]);
  for (const reply of team) {
    assert.equal(reply.team, true);
    assert.equal(reply.url, announcementThread.post.url);
    for (const key of ["createdAt", "reactions", "replyCount"]) assert.equal(Object.hasOwn(reply, key), false);
  }
  assert.match(thread, /\{reply\.team \? \([\s\S]*?\{labels\.team\[lang\]\}[\s\S]*?\{reply\.role\[lang\]\}[\s\S]*?\{labels\.welcomeNote\[lang\]\}[\s\S]*?: \(\s*<time/);
  assert.match(thread, /\{!reply\.team \? \([\s\S]*?\{reply\.replyCount\}[\s\S]*?<ThreadReactions/);
});

test("Open Roadmap thread uses shared type, Seeed avatar, and only headline and reply links", () => {
  assert.ok(thread);
  assert.match(thread, /<section[^>]*aria-labelledby="roadmap-announcement"/);
  assert.match(thread, /<h2 id="roadmap-announcement" className=\{`[^`]*home-type-title`\}/);
  assert.match(thread, /src=\{withBase\(post\.avatar\)\}/);
  assert.match(thread, /alt=\{post\.name\}/);
  assert.match(thread, /alt=\{reply\.name \|\| reply\.login\}/);
  assert.equal([...thread.matchAll(/loading="lazy"\s+referrerPolicy="no-referrer"/g)].length, 2);
  assert.match(thread, /home-type-subtitle/);
  assert.match(thread, /<p className=\{`[^`]*home-type-body`\}>\{reply\.text\[lang\]\}/);
  assert.equal([...thread.matchAll(/<a\b/g)].length, 2);
  assert.match(thread, /<a href=\{post\.url\}/);
  assert.match(thread, /className=\{styles\.threadReplyLink\} href=\{reply\.url\}/);
  assert.doesNotMatch(thread, /<button\b|home-filled-action|home-primary-cta|GITHUB_DISCUSSIONS|discussions"/);
  assert.match(thread, /\{labels\.reply\[lang\]\}/);
  assert.match(thread, /\{reply\.replyCount\} \{labels\.replies\[lang\]\}/);
  assert.doesNotMatch(source + css, /howItWorks|howPoint|howPropose|howVote|howBuild|howEngage/);
});

test("Open Roadmap replies reveal repeatedly, preserve dates, and show only positive reactions", () => {
  assert.match(thread, /<Reveal as="li"[^>]*delay=\{index \* 80\}/);
  assert.doesNotMatch(thread, /\bonce\b/);
  assert.match(thread, /relativeDate\(reply\.createdAt, lang\)/);
  assert.match(source, /function ThreadReactions[\s\S]*?\.filter\(\(\{ key \}\) => reactions\[key\] > 0\)/);
  assert.match(thread, /className=\{styles\.threadCelebration\} aria-hidden="true"/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.threadCelebration span\s*\{ animation: none; \}/);
  assert.match(css, /\.threadReplyLink\s*\{\s*color: var\(--theme-lime-ink\)/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*?--thread-avatar-size: 48px/);
  assert.match(css, /\.announcementThread\s*\{[\s\S]*?overflow-wrap: anywhere/);
  assert.match(css, /@media \(min-width: 1100px\)[\s\S]*?\.threadReplies\s*\{\s*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(min-width: 641px\)[\s\S]*?\.threadReplyText\s*\{[\s\S]*?-webkit-line-clamp: 2/);
});
