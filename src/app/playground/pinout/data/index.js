import { BOARD_CATEGORIES } from "./footprint.js";
import { BOARDS as RAW_BOARDS, BOARD_LIST as RAW_BOARD_LIST } from "./catalog.js";
import { enrichBoard } from "./diagram/enrich.js";
import { validateBoard } from "./schema.js";

export const BOARD_LIST = RAW_BOARD_LIST.map(enrichBoard);
export const BOARDS = Object.fromEntries(BOARD_LIST.map((board) => [board.id, board]));
BOARDS.nrf54 = BOARDS.nrf54lm20asense;

export { BOARD_CATEGORIES, FN_COLOR, FN_LABEL, LEGEND_ORDER, STRIP_COLUMNS, STRIP_TITLE, STRIP_WIDTH } from "./footprint.js";
export {
  localize,
  pinMatchesQuery,
  pinHasFilter,
  visibleOnSide,
  padOnSide,
  laneOnSide,
  anchorOnSide,
  codeName,
  stripCells,
  extraCapLabel,
  validateBoard,
} from "./schema.js";

export function getBoard(id) {
  return BOARDS[id] || BOARDS.samd21;
}

export function validateAllBoards() {
  return BOARD_LIST.flatMap((board) => validateBoard(board));
}

export { BOARD_CATEGORIES as categories };
