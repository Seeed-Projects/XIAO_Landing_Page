/**
 * Pure filter logic for XIAO Selector "Filter by Specs".
 * 「按规格筛选」纯函数逻辑：组内 AND/OR，组间 AND，附带实时计数与搜索。
 */

import { FILTER_GROUPS } from "./board-specs.mjs";

/**
 * Whether a board satisfies one selected option inside a group.
 * @param {Record<string, string[]>} specs
 * @param {string} groupId
 * @param {string} optionId
 */
export function boardHasOption(specs, groupId, optionId) {
  const values = specs?.[groupId] ?? [];

  // "No Onboard Sensor" matches boards with an empty sensors list.
  if (groupId === "sensors" && optionId === "none") {
    return values.length === 0;
  }

  // Ultra-low-power boards also satisfy the broader Low Power filter.
  if (groupId === "power" && optionId === "low-power") {
    return values.includes("low-power") || values.includes("ultra-low-power");
  }

  return values.includes(optionId);
}

/**
 * Whether a board passes one filter group given the current selection.
 * @param {Record<string, string[]>} specs
 * @param {{ id: string, mode: "and" | "or" }} group
 * @param {string[]} selected
 */
export function matchesGroup(specs, group, selected) {
  if (!selected?.length) return true;

  if (group.mode === "and") {
    return selected.every((optionId) => boardHasOption(specs, group.id, optionId));
  }

  return selected.some((optionId) => boardHasOption(specs, group.id, optionId));
}

/**
 * Filter boards by multi-group selection.
 * @param {Array<{ specs?: Record<string, string[]> }>} boards
 * @param {Record<string, string[]>} selection
 * @param {typeof FILTER_GROUPS} [groups]
 */
export function filterBoards(boards, selection, groups = FILTER_GROUPS) {
  return boards.filter((board) => {
    const specs = board.specs ?? {};
    return groups.every((group) => matchesGroup(specs, group, selection?.[group.id] ?? []));
  });
}

/**
 * Toggle one option inside the selection. "none" in sensors is exclusive.
 * 切换单个选项；传感器组中的 none 与其他选项互斥。
 * @param {Record<string, string[]>} selection
 * @param {{ id: string }} group
 * @param {string} optionId
 */
export function toggleSelection(selection, group, optionId) {
  const current = selection[group.id] ?? [];
  let next;

  if (group.id === "sensors") {
    if (optionId === "none") {
      next = current.includes("none") ? [] : ["none"];
    } else {
      const rest = current.filter((v) => v !== "none");
      next = rest.includes(optionId) ? rest.filter((v) => v !== optionId) : [...rest, optionId];
    }
  } else {
    next = current.includes(optionId) ? current.filter((v) => v !== optionId) : [...current, optionId];
  }

  return { ...selection, [group.id]: next };
}

/**
 * Count how many boards remain if an option is added to the selection.
 * OR groups count boards matching that option together with all other groups.
 * 计算在当前条件下勾选某个选项后剩余的板子数量。
 * @param {Array<{ specs?: Record<string, string[]> }>} boards
 * @param {Record<string, string[]>} selection
 * @param {typeof FILTER_GROUPS} [groups]
 * @returns {Record<string, Record<string, number>>} counts[groupId][optionId]
 */
export function facetCounts(boards, selection, groups = FILTER_GROUPS) {
  const counts = {};

  for (const group of groups) {
    counts[group.id] = {};
    const otherGroups = groups.filter((g) => g.id !== group.id);
    const base = boards.filter((board) =>
      otherGroups.every((g) => matchesGroup(board.specs ?? {}, g, selection?.[g.id] ?? []))
    );
    const selected = selection?.[group.id] ?? [];

    for (const option of group.options) {
      let probe;
      if (group.mode === "or") {
        probe = [option.id];
      } else if (group.id === "sensors" && option.id === "none") {
        probe = ["none"];
      } else {
        probe = selected.includes(option.id)
          ? selected
          : [...selected.filter((v) => !(group.id === "sensors" && v === "none")), option.id];
      }
      counts[group.id][option.id] = base.filter((board) =>
        matchesGroup(board.specs ?? {}, group, probe)
      ).length;
    }
  }

  return counts;
}

/**
 * Free-text search over board name and MCU.
 * 按板子名称与主控名称做不区分大小写的模糊搜索。
 * @param {Array<{ name: string, hardware?: { mcu?: string } }>} boards
 * @param {string} query
 */
export function searchBoards(boards, query) {
  const q = (query ?? "").trim().toLowerCase().replace(/[\s-]+/g, "");
  if (!q) return boards;
  return boards.filter((board) => {
    const haystack = `${board.name} ${board.hardware?.mcu ?? ""}`.toLowerCase().replace(/[\s-]+/g, "");
    return haystack.includes(q);
  });
}

/**
 * For an empty result, list which single option removal restores the most boards.
 * 结果为空时，列出移除哪一个已选条件能恢复最多板子。
 * @param {Array<{ specs?: Record<string, string[]> }>} boards
 * @param {Record<string, string[]>} selection
 * @param {typeof FILTER_GROUPS} [groups]
 * @returns {Array<{ groupId: string, optionId: string, count: number }>}
 */
export function removalSuggestions(boards, selection, groups = FILTER_GROUPS) {
  const suggestions = [];
  for (const group of groups) {
    for (const optionId of selection?.[group.id] ?? []) {
      const trimmed = {
        ...selection,
        [group.id]: selection[group.id].filter((v) => v !== optionId),
      };
      const count = filterBoards(boards, trimmed, groups).length;
      if (count > 0) suggestions.push({ groupId: group.id, optionId, count });
    }
  }
  return suggestions.sort((a, b) => b.count - a.count);
}

/**
 * Flatten the selection into ordered chips for the active-filter bar.
 * 把已选条件展开成有序 chip 列表。
 * @param {Record<string, string[]>} selection
 * @param {typeof FILTER_GROUPS} [groups]
 */
export function activeFilters(selection, groups = FILTER_GROUPS) {
  const chips = [];
  for (const group of groups) {
    for (const optionId of selection?.[group.id] ?? []) {
      const option = group.options.find((o) => o.id === optionId);
      if (option) chips.push({ group, option });
    }
  }
  return chips;
}
