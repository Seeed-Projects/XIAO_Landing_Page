import assert from "node:assert/strict";
import test from "node:test";
import { strToU8, zipSync } from "fflate";
import { coveredCells, parseXlsx, renderSheetSvg } from "./parseXlsx.js";

function workbook() {
  const files = {
    "xl/workbook.xml": `<workbook xmlns:r="x"><sheets><sheet name="Pins" sheetId="1" r:id="rId1"/><sheet name="Notes" sheetId="2" r:id="rId2"/></sheets></workbook>`,
    "xl/_rels/workbook.xml.rels": `<Relationships><Relationship Id="rId2" Type="w" Target="worksheets/sheet2.xml"/><Relationship Id="rId1" Type="w" Target="worksheets/sheet1.xml"/></Relationships>`,
    "xl/sharedStrings.xml": `<sst><si><t>No.</t></si><si><r><t>P</t></r><r><t>A</t></r></si><si><t>Tom &amp; Jerry</t></si></sst>`,
    "xl/worksheets/sheet1.xml": `<worksheet><sheetData>
      <row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="inlineStr"><is><t>GPIO</t></is></c></row>
      <row r="2"><c r="A2"><v>1</v></c><c r="B2" t="s"><v>2</v></c><c r="C2" t="b"><v>1</v></c><c r="D2" s="3"/></row>
      <row r="4"><c r="A4"><v>2.50</v></c></row>
    </sheetData><mergeCells count="1"><mergeCell ref="B1:C1"/></mergeCells></worksheet>`,
    "xl/worksheets/sheet2.xml": `<worksheet><sheetData><row r="1"><c r="A1" t="str"><v>note</v></c></row></sheetData></worksheet>`,
  };
  return zipSync(Object.fromEntries(Object.entries(files).map(([name, xml]) => [name, strToU8(xml)])));
}

test("parseXlsx reads shared, rich, inline, boolean and numeric cells with merges", () => {
  const { sheets } = parseXlsx(workbook());
  assert.deepEqual(sheets.map((sheet) => sheet.name), ["Pins", "Notes"]);
  const pins = sheets[0];
  assert.deepEqual(pins.rows[0], ["No.", "PA", "GPIO"]);
  assert.deepEqual(pins.rows[1], ["1", "Tom & Jerry", "TRUE"]);
  assert.deepEqual(pins.rows[2], ["", "", ""]);
  assert.deepEqual(pins.rows[3], ["2.5", "", ""]);
  assert.deepEqual(pins.merges, [{ r0: 0, c0: 1, r1: 0, c1: 2 }]);
  assert.deepEqual([...coveredCells(pins.merges)], ["0:2"]);
  assert.deepEqual(sheets[1].rows, [["note"]]);
});

test("renderSheetSvg draws the header row and escapes text", () => {
  const { sheets } = parseXlsx(workbook());
  const svg = renderSheetSvg(sheets[0]);
  assert.match(svg, /^<svg /);
  assert.match(svg, />No\.<\/text>/);
  assert.match(svg, />Tom &amp; Jerry<\/text>/);
  assert.equal(renderSheetSvg({ rows: [], merges: [] }), null);
});
