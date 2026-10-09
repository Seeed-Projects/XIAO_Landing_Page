const ART_BY_GROUP = {
  design: "/res-generic/design-files.jpg",
  mechanical: "/res-generic/mechanical-files.jpg",
  firmware: "/res-generic/firmware-files.jpg",
  guide: "/res-generic/developer-guides.jpg",
};

const GROUP_BY_KIND = {
  datasheet: "design",
  schematic: "design",
  kicad: "design",
  pinout: "design",
  other: "design",
  dimension: "mechanical",
  model3d: "mechanical",
  step: "mechanical",
  firmware: "firmware",
  guide: "guide",
  link: "guide",
};

/**
 * Return the shared visual and motion group for a resource kind.
 * 根据资源类型返回共用示意图及其动画分组。
 */
export function resourceArtFor(kind) {
  const group = GROUP_BY_KIND[kind] || "design";
  return { group, src: ART_BY_GROUP[group] };
}

