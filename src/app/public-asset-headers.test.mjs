import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { createElement } from "react";
import { renderToReadableStream } from "react-dom/server.edge";

const publicDir = new URL("../../public/", import.meta.url);

test("public asset paths use ASCII filenames for HTTP preload headers", async () => {
  const files = await readdir(publicDir, { recursive: true });
  assert.deepEqual(files.filter((name) => /[^\x00-\x7f]/.test(name)), []);
});

test("Home feature images produce valid React preload Link headers", async () => {
  const source = await readFile(new URL("./video-intro-section.js", import.meta.url), "utf8");
  const images = [...source.matchAll(/image: "(\/home\/[^\"]+)"/g)].map((match) => match[1]);
  assert.equal(images.length, 4);
  for (const image of images) await readFile(new URL(image.slice(1), publicDir));

  const errors = [];
  let link = "";
  const stream = await renderToReadableStream(
    createElement("div", null, ...images.map((src) => createElement("img", {
      key: src,
      src: `/XIAO_Landing_Page${src}`,
      alt: "",
    }))),
    {
      onHeaders(headers) { link = headers.get("link") || ""; },
      onError(error) { errors.push(error); },
    },
  );
  await new Response(stream).text();
  assert.deepEqual(errors, []);
  for (const image of images) assert.ok(link.includes(image));
  assert.doesNotThrow(() => new Headers({ link }));
});
