import { buildDiagram } from "../defineBoard.js";
import { BOARD_DIAGRAMS } from "./boardDiagrams.js";

const SVG_SIZE = { width: 1920, height: 1080 };

/** Attach pre-built official diagram data when available. 有官方引脚图数据时挂到板对象上。 */
export function enrichBoard(board) {
  const spec = BOARD_DIAGRAMS[board.id];
  if (!spec) return board;
  const diagram = buildDiagram(spec, board.id);
  if (!diagram) return board;
  const images = { ...board.images };
  if (spec.front?.src) images.front = { src: spec.front.src, ...SVG_SIZE };
  if (spec.back?.src) images.back = { src: spec.back.src, ...SVG_SIZE };
  return { ...board, images, diagram };
}
