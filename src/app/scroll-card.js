"use client";

/**
 * ScrollCard —— 通用滚动卡片，供 News / Projects / Trusted 三个跑马灯共用。
 * variant="compact"（默认，用于 rows=2 两行带，紧凑）
 * variant="comfortable"（用于 rows=1 单行带：放大卡片内部空隙、摘要多一行，
 *   让单张卡片更高，去匹配两行块的高度；字号不变）。
 * 结构：封面图(16/9) → 标签 pill + 次要 meta → 标题(2行) → 摘要。
 */
export function ScrollCard({ image, tag, meta, title, excerpt, alt = "", variant = "compact" }) {
  const comfy = variant === "comfortable";
  const imgGap = comfy ? "mt-6" : "mt-3";
  const titleGap = comfy ? "mt-4" : "mt-2";
  const excerptCls = comfy ? "mt-3 line-clamp-3" : "mt-1.5 line-clamp-2";

  return (
    <>
      {/* 封面图：加载成功显示真图，失败/无图回退淡渐变占位。
          compact 用 16/9（两行带，紧凑）；comfortable 用 4/3（单行带，图更高，让单卡接近两行块高度） */}
      <div
        className={comfy ? "aspect-[4/3] w-full overflow-hidden rounded-lg" : "aspect-[16/9] w-full overflow-hidden rounded-lg"}
        style={{
          background:
            "linear-gradient(135deg, rgba(143,195,31,0.14), rgba(0,73,102,0.14))",
        }}
      >
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={alt}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      {/* 文字 */}
      <div className={`${imgGap} flex flex-1 flex-col`}>
        <div className="flex min-w-0 items-center gap-1.5">
          {tag && (
            <span className="max-w-[58%] truncate rounded-full bg-[var(--brand-blue)]/12 px-2 py-0.5 text-[11px] font-semibold text-[var(--brand-blue-soft)]">
              {tag}
            </span>
          )}
          {meta && (
            <span className="truncate text-[11px] text-[var(--ink-muted)]">{meta}</span>
          )}
        </div>
        <h3 className={`${titleGap} line-clamp-2 text-sm font-bold leading-snug text-[var(--ink-strong)] sm:text-[15px]`}>
          {title}
        </h3>
        {excerpt && (
          <p className={`${excerptCls} text-xs leading-relaxed text-[var(--ink-body)] sm:text-[13px]`}>
            {excerpt}
          </p>
        )}
      </div>
    </>
  );
}
