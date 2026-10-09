export function PlaygroundToolIcon({ type }) {
  if (type === "pin") return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M15 10v8m9-8v8m9-8v8M15 30v8m9-8v8m9-8v8M10 15h8m12 0h8M10 24h8m12 0h8M10 33h8m12 0h8"/><rect x="18" y="18" width="12" height="12" rx="2"/></svg>;
  if (type === "flash") return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M27 5 13 27h10l-2 16 14-23H25l2-15Z"/></svg>;
  if (type === "files") return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 8h16l8 8v24H12V8Z"/><path d="M28 8v9h8M18 25h12M18 31h12"/></svg>;
  return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="m17 15-9 9 9 9M31 15l9 9-9 9M27 9l-6 30"/></svg>;
}
