export const SECTION_TARGETS = {
  "/": ["hero", "intro", "glimpse", "roadmap", "projects", "playground", "cocreate", "news", "edm"],
  "/products": ["top", "products-catalog", "smart-selector"],
  "/res": ["top", "design-kit-title", "resources", "learn"],
  "/project-hub": ["top", "featured-projects", "collection"],
  "/open-roadmap": ["top", "stage-wish", "stage-vote", "stage-dev", "stage-done", "stage-help", "success"],
  "/software-center": ["top", "official", "community"],
};

// Resolve section anchors to their rendered heading, including artwork labels.
// 将章节锚点对应到实际渲染的标题，包含艺术字的可访问名称。
export function readSectionDirectory(pathname, root) {
  const path = (pathname ?? "").replace(/\/+$/, "") || "/";
  return (SECTION_TARGETS[path] ?? []).flatMap((id) => {
    const target = root.getElementById(id);
    if (!target) return [];
    const heading = target.matches("h1, h2, h3") ? target : target.querySelector("h1, h2, h3");
    const label = (heading?.getAttribute("aria-label") || heading?.textContent || "").replace(/\s+/g, " ").trim();
    return label ? [{ id, label }] : [];
  });
}
