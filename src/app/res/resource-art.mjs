const LABEL_BY_ICON = {
  datasheet: "Datasheet",
  schematic: "Schematic",
  "pcb-source": "PCB source",
  pinout: "Pinout",
  dxf: "DXF",
  "3d-model": "3D model",
  firmware: "Firmware",
  "user-guide": "User guide",
};

const ICON_BY_KIND = {
  datasheet: "datasheet",
  schematic: "schematic",
  kicad: "pcb-source",
  pinout: "pinout",
  other: "datasheet",
  dimension: "dxf",
  model3d: "3d-model",
  step: "3d-model",
  firmware: "firmware",
  guide: "user-guide",
  link: "user-guide",
};

/**
 * Return the file-type icon and label for a resource's kind and format.
 * 根据资源类型与文件格式返回文件类型图标及名称。
 */
export function resourceArtFor(item) {
  const icon = item.kind === "other" && item.format === "ZIP"
    ? "pcb-source"
    : ICON_BY_KIND[item.kind] || "datasheet";
  return { src: `/res-generic/${icon}.webp`, label: LABEL_BY_ICON[icon] };
}

