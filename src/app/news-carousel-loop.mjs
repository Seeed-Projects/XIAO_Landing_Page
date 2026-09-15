export const NEWS_LOOP_COPIES = 3;

export function createNewsLoop(items) {
  return Array.from({ length: NEWS_LOOP_COPIES }, (_, copyIndex) =>
    items.map((item, itemIndex) => ({ item, itemIndex, copyIndex })),
  ).flat();
}

export function getNewsLoopStart(itemCount) {
  return itemCount > 0 ? itemCount : 0;
}

export function shouldCenterNewsLoop(index, itemCount) {
  return itemCount > 0 && (index < itemCount || index >= itemCount * 2);
}

export function centerNewsLoopIndex(index, itemCount) {
  if (itemCount <= 0) return 0;
  const itemIndex = ((index % itemCount) + itemCount) % itemCount;
  return itemCount + itemIndex;
}
