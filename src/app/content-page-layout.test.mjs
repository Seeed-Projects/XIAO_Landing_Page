import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("page introductions and detail introductions share one responsive height", () => {
  const globals = read("./globals.css");
  assert.match(globals, /--page-intro-height:\s*296px/);
  assert.match(globals, /@media \(min-width: 641px\) and \(max-width: 1023px\)\s*{\s*:root\s*{\s*--page-intro-height:\s*320px/);
  assert.match(globals, /@media \(max-width: 640px\)\s*{\s*:root\s*{\s*--page-intro-height:\s*400px/);
  assert.match(globals, /@media \(max-width: 374px\)\s*{\s*:root\s*{\s*--page-intro-height:\s*464px/);
  assert.match(globals, /--page-content-width:\s*min\(calc\(100% - 2 \* var\(--page-content-gutter\)\), 1695px\)/);
  assert.match(read("./tool-page-intro.module.css"), /min-height:\s*var\(--page-intro-height\)/);
  assert.match(read("./tool-page-intro.module.css"), /padding:\s*clamp\(48px, 5vw, 64px\) 0 16px/);
  assert.match(globals, /\.page-detail-intro\s*{[^}]*min-height:\s*var\(--page-intro-height\)/s);
  assert.match(read("./software-center/[slug]/SoftwareDetailClient.js"), /className="page-detail-intro w-full"/);
});

test("content page containers consume the shared content width", () => {
  for (const path of [
    "./project-hub/project-hub.module.css", "./open-roadmap/community-roadmap.module.css",
    "./playground/playground.module.css", "./playground/pinout/pinout.module.css",
    "./products/esp-flasher.module.css", "./res/res.module.css", "./software-center/software-center.module.css",
  ]) assert.match(read(path), /width:\s*var\(--page-content-width\)/, path);
  assert.match(read("./products/page.js"), /id="products-catalog" className="page-content-shell/);
});

test("Products preserves the Home catalog heading and opens its own catalog with a description", () => {
  const panel = read("./product-panel.js");
  assert.match(panel, /ProductPanel\(\{ showTitle = true \} = \{\}\)/);
  assert.match(panel, /id="product-catalog-title" className="sr-only"/);
  assert.match(read("./products/page.js"), /<ProductPanel showTitle=\{false\} \/>/);
  assert.match(read("./home-product-panel.js"), /<ProductPanel \/>/);
  assert.match(read("./product-panel.module.css"), /\.headerCompact\s*{[^}]*text-align:\s*left/s);
});

test("Playground opens with tool cards and Project Hub retains its featured heading", () => {
  const playground = read("./playground/page.js");
  assert.doesNotMatch(playground, /XIAO Development Tools|styles\.sectionHead/);
  assert.match(playground, /<section className=\{styles\.toolSection\}>\s*<div className=\{styles\.toolGrid\}>/);
  assert.match(read("./project-hub/projectHub.js"), /featuredTitle: "Featured Projects"/);
  assert.match(read("./project-hub/project-hub.module.css"), /\.featuredIntro :global\(\.home-type-body\)\s*{\s*white-space:\s*nowrap/);
});
