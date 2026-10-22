import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("Open Roadmap intro explains Propose, Vote, and Build in order with shared typography and no extra CTA", () => {
  const source = read("./open-roadmap/communityRoadmap.js");
  const css = read("./open-roadmap/community-roadmap.module.css");
  const intro = source.match(/<Reveal as="section" className=\{styles\.howItWorksWrap\}[\s\S]*?<\/ol>[\s\S]*?<\/Reveal>/)?.[0];
  assert.ok(intro, "the intro is a revealed section containing an ordered process");
  assert.match(intro, /aria-labelledby="how-it-works"/);
  assert.match(intro, /<h2 id="how-it-works" className=\{`[^`]*home-type-title`\}/);
  assert.doesNotMatch(intro, /<a\b|<button\b|\bonce\b/);
  assert.doesNotMatch(source + css, /howItWorksLink|howLink|howEngageLabel/);

  const steps = [...intro.matchAll(/<Reveal as="li"[\s\S]*?<\/Reveal>/g)].map(([step]) => step);
  assert.equal(steps.length, 3);
  for (const [index, name] of ["Propose", "Vote", "Build"].entries()) {
    const step = steps[index];
    assert.match(step, new RegExp(`\\{T\\.how${name}Label\\}`));
    assert.match(step, /<h3 className=\{`[^`]*home-type-subtitle`\}/);
    assert.match(step, new RegExp(`<p className="home-type-body">\\{T\\.how${name}\\}<\\/p>`));
    assert.match(step, /<svg[^>]*aria-hidden="true"/);
  }
  assert.match(source, /howProposeLabel: lang === "zh" \? "提交提案" : "Propose"/);
  assert.match(source, /howVoteLabel: lang === "zh" \? "投票支持" : "Vote"/);
  assert.match(source, /howBuildLabel: lang === "zh" \? "开发与交付" : "Build & ship"/);
  assert.doesNotMatch(intro.slice(0, intro.indexOf("</ol>")), /T\.howEngage/);
  assert.match(intro, /<\/ol>\s*<p className=\{`[^`]*home-type-body`\}>\{T\.howEngage\}<\/p>/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*?\.howItWorksPoints\s*{\s*grid-template-columns: 1fr/);
});
