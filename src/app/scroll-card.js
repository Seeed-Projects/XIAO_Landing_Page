"use client";

/**
 * ScrollCard —— 通用滚动卡片，供 News / Projects / Trusted 三个跑马灯共用，
 * 保证三处卡片结构、尺寸、留白完全一致。
 * 结构：封面图(16/9) → 标签 pill + 次要 meta → 标题(2行) → 摘要(2行)。
 */
export function ScrollCard({ image, tag, meta, title, excerpt, alt = "" }) {
  return (
    <>
      {/* 封面图：加载成功显示真图，失败/无图回退淡渐变占位 */}
      <div
        className="aspect-[16/9] w-full overflow-hidden rounded-lg"
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
      <div className="mt-3 flex flex-1 flex-col">
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
        <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-[var(--ink-strong)] sm:text-[15px]">
          {title}
        </h3>
        {excerpt && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--ink-body)] sm:text-[13px]">
            {excerpt}
          </p>
        )}
      </div>
    </>
  );
}
