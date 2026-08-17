// 静态导出遗留路由桩：原 pcb 服务端渲染已废弃，待删除。
export const dynamic = "force-static";

export function GET() {
  return new Response("removed", { status: 200 });
}
