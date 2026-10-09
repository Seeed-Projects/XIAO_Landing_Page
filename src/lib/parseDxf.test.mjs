import assert from "node:assert/strict";
import test from "node:test";
import { renderDxfSvg } from "./parseDxf.js";

function line(x1, y1, x2, y2) {
  return `0\nLINE\n10\n${x1}\n20\n${y1}\n11\n${x2}\n21\n${y2}\n`;
}

test("DXF framing keeps the drawing and drops a distant outlier", () => {
  let src = "0\nSECTION\n2\nENTITIES\n";
  src += line(0, 0, 20, 0) + line(20, 0, 20, 20) + line(20, 20, 0, 20) + line(0, 20, 0, 0);
  for (let i = 0; i < 200; i += 1) src += line(100, i * 0.01, 100.2, i * 0.01);
  src += line(5000, 5000, 5001, 5001);
  src += "0\nENDSEC\n0\nEOF\n";

  const svg = renderDxfSvg(src);
  const match = svg.match(/viewBox="0 0 ([0-9.]+) ([0-9.]+)"/);
  assert.ok(match, svg.slice(0, 80));
  const width = Number(match[1]);
  const height = Number(match[2]);
  assert.ok(width > 400 && width < 2000, `width ${width}`);
  assert.ok(height > 40 && height < 2000, `height ${height}`);
});
