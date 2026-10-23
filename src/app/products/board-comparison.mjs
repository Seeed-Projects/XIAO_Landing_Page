import { FILTER_GROUPS, HARDWARE_FIELDS } from "./board-specs.mjs";
import { formatBoardPrice } from "./board-price-format.mjs";

function compareValues(id, label, values, capability = false) {
  return {
    id,
    label,
    differs: new Set(values).size > 1,
    cells: values.map((value, index) => ({
      value: capability ? (value ? label : null) : value,
      changed: index > 0 && value !== values[0],
    })),
  };
}

/**
 * Align capability rows and mark values that differ from the first board.
 * 对齐各款开发板的能力条目，并标记与首款不同的值。
 */
export function buildComparisonGroups(boards, lang = "en", differencesOnly = false) {
  if (!boards.length) return [];
  const localize = (label) => label[lang] || label.en;
  const priceLabel = localize({ en: "Price", zh: "价格" });
  const groups = [
    {
      id: "price",
      label: priceLabel,
      rows: [compareValues("price", priceLabel, boards.map((board) => formatBoardPrice(board.price, lang)))],
    },
    ...HARDWARE_FIELDS.map((field) => ({
      id: field.id,
      label: localize(field.label),
      rows: [compareValues(field.id, localize(field.label), boards.map((board) => {
        const value = board.hardware?.[field.id];
        return value == null || value === "" ? null : String(value);
      }))],
    })),
    ...FILTER_GROUPS.map((group) => {
      const options = group.options.filter((option) => option.id !== "none"
        && boards.some((board) => board.specs?.[group.id]?.includes(option.id)));
      const rows = options.map((option) => compareValues(
        `${group.id}:${option.id}`,
        localize(option.label),
        boards.map((board) => Boolean(board.specs?.[group.id]?.includes(option.id))),
        true,
      ));
      return {
        id: group.id,
        label: localize(group.label),
        rows: rows.length ? rows : [compareValues(group.id, localize(group.label), boards.map(() => null))],
      };
    }),
  ];
  return groups
    .map((group) => ({ ...group, rows: group.rows.filter((row) => !differencesOnly || row.differs) }))
    .filter((group) => group.rows.length);
}
