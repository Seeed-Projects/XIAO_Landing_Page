import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const LABEL_TEXT = JSON.parse(readFileSync(new URL("./pinout-label-text.json", import.meta.url), "utf8"));

export const labelBoxKey = ({ x, y, w, h }) => [x, y, w, h].map((value) => +value.toFixed(2)).join(",");

/** Read the position-indexed transcription of outlined SVG label text.
 * 读取已转为轮廓的 SVG 标签文字，按框坐标索引。 */
export function svgLabelReader(source, sourceId) {
  const entry = LABEL_TEXT[sourceId];
  if (!entry) throw new Error(`Missing SVG label transcription: ${sourceId}`);
  const hash = createHash("sha256").update(source).digest("hex");
  if (hash !== entry.sha256) throw new Error(`SVG label transcription needs review: ${sourceId} artwork changed`);
  return (box) => {
    const key = labelBoxKey(box);
    const text = entry.labels[key];
    if (!text) throw new Error(`Missing SVG label text: ${sourceId} at ${key}`);
    return text;
  };
}
