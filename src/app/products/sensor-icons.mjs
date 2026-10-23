/**
 * Line icons for onboard sensors, drawn on a 24×24 grid with round strokes.
 * 板载传感器线条图标，基于 24×24 网格、圆角描边绘制。
 */
export const SENSOR_ICONS = [
  {
    id: "camera",
    path: "M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM15.5 13a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z",
  },
  {
    id: "microphone",
    path: "M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7",
  },
  {
    id: "imu",
    path: "M12 13V4M9.5 6.5 12 4l2.5 2.5M12 13l7.5 4.3M16.3 18.6l3.2-1.3-.6-3.4M12 13l-7.5 4.3M5.1 13.9l-.6 3.4 3.2 1.3",
  },
];

/** Return the icon entries for a board's sensor ids, in display order. 按显示顺序返回开发板传感器对应的图标。 */
export function getSensorIcons(sensors = []) {
  return SENSOR_ICONS.filter(({ id }) => sensors.includes(id));
}
