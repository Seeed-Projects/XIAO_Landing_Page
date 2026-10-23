import assert from "node:assert/strict";
import test from "node:test";
import { formatBoardPrice } from "./board-price-format.mjs";

test("board prices use English currency formatting by default", () => {
  assert.equal(formatBoardPrice({ price: 4.99, currency: "USD" }), "$4.99");
  assert.equal(formatBoardPrice({ price: 5.2, currency: "USD" }, "en"), "$5.20");
  assert.equal(formatBoardPrice({ price: 4.99, currency: "EUR" }, "en"), "\u20ac4.99");
});

test("board prices use Chinese currency formatting", () => {
  assert.equal(formatBoardPrice({ price: 4.99, currency: "USD" }, "zh"), "US$4.99");
});

test("missing prices return null and zero remains a valid price", () => {
  for (const lang of ["en", "zh"]) {
    assert.equal(formatBoardPrice(null, lang), null);
    assert.equal(formatBoardPrice(undefined, lang), null);
  }
  assert.equal(formatBoardPrice({ price: 0, currency: "USD" }, "en"), "$0.00");
});
