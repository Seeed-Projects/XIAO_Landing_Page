const HUB_URL = "https://seeed-studio.github.io/OSHW-XIAO-Series/";

const HEIGHT_BRIDGE = `
<script>
(() => {
  let frame = 0;
  const report = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const height = Math.max(
        document.body?.scrollHeight || 0,
        document.documentElement?.scrollHeight || 0
      );
      parent.postMessage({ type: "xiao-project-hub-height", height }, location.origin);
    });
  };
  addEventListener("load", report);
  addEventListener("resize", report);
  new ResizeObserver(report).observe(document.documentElement);
  new MutationObserver(report).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true
  });
  report();
})();
</script>`;

export async function GET() {
  try {
    const response = await fetch(HUB_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Project Hub responded with ${response.status}`);

    let html = await response.text();
    html = html.replace(/<head([^>]*)>/i, `<head$1><base href="${HUB_URL}">`);
    html = html.replace(/<\/body>/i, `${HEIGHT_BRIDGE}</body>`);

    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch {
    return new Response(
      `<!doctype html><html><body style="margin:0;padding:32px;font:14px sans-serif">Unable to load Project Hub.</body></html>`,
      { status: 502, headers: { "content-type": "text/html; charset=utf-8" } }
    );
  }
}
