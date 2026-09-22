"use client";

import styles from "./res.module.css";

const TONES = {
  datasheet: ["#e8eef8", "#2f4f8a", "#9fb4d8"],
  schematic: ["#e9f2ec", "#1f6b4a", "#93c1a5"],
  kicad: ["#e6efe2", "#2c5f3c", "#c9a54a"],
  pinout: ["#f1eef9", "#4f3d8c", "#b3a4dd"],
  dimension: ["#f6efe4", "#8a5a1f", "#d8b98a"],
  model3d: ["#e9f0f2", "#2f5c6a", "#9cbfca"],
  step: ["#e9f0f2", "#2f5c6a", "#9cbfca"],
  firmware: ["#f4ecf1", "#6e3a5c", "#c99ab8"],
  guide: ["#eef3e6", "#4a6a1f", "#b6cc8f"],
  link: ["#eef1f4", "#3a4c63", "#a9b6c8"],
  other: ["#f0f0ec", "#5a5a50", "#bdbdb0"],
};

/**
 * Kind-specific illustration used when a file has no rendered thumbnail.
 * 没有渲染缩略图时，按文件类型显示的插画。
 */
export function KindArt({ kind, format }) {
  const [bg, deep, soft] = TONES[kind] || TONES.other;
  return (
    <span className={styles.art} style={{ background: bg, color: deep }}>
      <svg viewBox="0 0 160 100" aria-hidden="true">
        <Shape kind={kind} deep={deep} soft={soft} />
      </svg>
      <span className={styles.artFormat}>{format}</span>
    </span>
  );
}

function Shape({ kind, deep, soft }) {
  switch (kind) {
    case "datasheet":
      return (
        <>
          <rect x="44" y="10" width="72" height="84" rx="6" fill="#fff" stroke={soft} strokeWidth="2" />
          <rect x="52" y="20" width="40" height="8" rx="2" fill={deep} />
          {[36, 46, 56, 66, 76].map((y) => (
            <rect key={y} x="52" y={y} width={y === 76 ? 32 : 56} height="4" rx="2" fill={soft} />
          ))}
        </>
      );
    case "schematic":
      return (
        <>
          <path d="M14 50h22l6-12 10 24 10-24 10 24 6-12h18" fill="none" stroke={deep} strokeWidth="3" strokeLinejoin="round" />
          <path d="M96 50h18M114 36v28M124 36v28M124 50h22" fill="none" stroke={deep} strokeWidth="3" />
          <circle cx="14" cy="50" r="4" fill={soft} />
          <circle cx="146" cy="50" r="4" fill={soft} />
        </>
      );
    case "kicad":
      return (
        <>
          <rect x="40" y="14" width="80" height="72" rx="8" fill={deep} />
          {[26, 42, 58, 74].map((y) => (
            <g key={y}>
              <rect x="34" y={y} width="14" height="8" rx="3" fill={soft} />
              <rect x="112" y={y} width="14" height="8" rx="3" fill={soft} />
            </g>
          ))}
          <rect x="66" y="36" width="28" height="28" rx="3" fill={soft} />
        </>
      );
    case "pinout":
      return (
        <>
          <rect x="62" y="12" width="36" height="76" rx="6" fill={deep} />
          {[22, 36, 50, 64, 78].map((y) => (
            <g key={y}>
              <rect x="20" y={y - 4} width="34" height="8" rx="4" fill={soft} />
              <rect x="106" y={y - 4} width="34" height="8" rx="4" fill={soft} />
              <line x1="54" y1={y} x2="62" y2={y} stroke={soft} strokeWidth="2" />
              <line x1="98" y1={y} x2="106" y2={y} stroke={soft} strokeWidth="2" />
            </g>
          ))}
        </>
      );
    case "dimension":
      return (
        <>
          <rect x="30" y="30" width="100" height="40" rx="6" fill="#fff" stroke={soft} strokeWidth="2" />
          <path d="M30 18h100M30 12v12M130 12v12" stroke={deep} strokeWidth="2.5" />
          <path d="M20 30v40M14 30h12M14 70h12" stroke={deep} strokeWidth="2.5" />
          {[45, 60, 75, 90, 105].map((x) => (
            <line key={x} x1={x} y1="30" x2={x} y2={x % 30 === 0 ? 46 : 38} stroke={soft} strokeWidth="2" />
          ))}
        </>
      );
    case "model3d":
    case "step":
      return (
        <>
          <path d="M80 14l40 20v36l-40 20-40-20V34z" fill={soft} />
          <path d="M80 14l40 20-40 20-40-20z" fill="#fff" opacity="0.7" />
          <path d="M80 54v36l40-20V34z" fill={deep} opacity="0.85" />
          <path d="M80 14l40 20v36l-40 20-40-20V34zM80 54l40-20M80 54L40 34M80 54v36" fill="none" stroke={deep} strokeWidth="2" strokeLinejoin="round" />
        </>
      );
    case "firmware":
      return (
        <>
          <rect x="52" y="26" width="56" height="48" rx="6" fill={deep} />
          <rect x="66" y="40" width="28" height="20" rx="3" fill={soft} />
          {[38, 50, 62].map((y) => (
            <g key={y}>
              <rect x="40" y={y - 2} width="12" height="4" rx="2" fill={soft} />
              <rect x="108" y={y - 2} width="12" height="4" rx="2" fill={soft} />
            </g>
          ))}
          {[64, 80, 96].map((x) => (
            <g key={x}>
              <rect x={x - 2} y="14" width="4" height="12" rx="2" fill={soft} />
              <rect x={x - 2} y="74" width="4" height="12" rx="2" fill={soft} />
            </g>
          ))}
        </>
      );
    case "guide":
      return (
        <>
          <path d="M30 24q25-8 50 4v54q-25-12-50-4z" fill="#fff" stroke={soft} strokeWidth="2" />
          <path d="M130 24q-25-8-50 4v54q25-12 50-4z" fill="#fff" stroke={soft} strokeWidth="2" />
          {[38, 48, 58].map((y) => (
            <g key={y}>
              <path d={`M40 ${y}q15-4 32 2`} fill="none" stroke={deep} strokeWidth="3" strokeLinecap="round" />
              <path d={`M88 ${y + 2}q17-6 32-2`} fill="none" stroke={deep} strokeWidth="3" strokeLinecap="round" />
            </g>
          ))}
        </>
      );
    case "link":
      return (
        <>
          <rect x="36" y="30" width="64" height="50" rx="8" fill="#fff" stroke={soft} strokeWidth="2" />
          <path d="M78 22h40v40" fill="none" stroke={deep} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M118 22L66 74" fill="none" stroke={deep} strokeWidth="4" strokeLinecap="round" />
        </>
      );
    default:
      return (
        <>
          <path d="M30 30h36l10 10h54v38a6 6 0 0 1-6 6H36a6 6 0 0 1-6-6z" fill={soft} />
          <path d="M30 44h100v34a6 6 0 0 1-6 6H36a6 6 0 0 1-6-6z" fill="#fff" stroke={soft} strokeWidth="2" />
        </>
      );
  }
}
