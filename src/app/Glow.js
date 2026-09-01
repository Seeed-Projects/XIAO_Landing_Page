/**
 * Glow 保留为兼容层：历史页面仍可继续使用同一组件 API，
 * 但文字始终继承页面设定的最终颜色，不再根据滚动位置逐字变色。
 */
export function Glow({
  children,
  as: Tag = "h2",
  className = "",
  full: _full,
  start: _start,
  end: _end,
  ...rest
}) {
  return (
    <Tag className={className} {...rest}>
      {children}
    </Tag>
  );
}
