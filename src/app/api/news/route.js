// 静态导出遗留路由桩：原服务端逻辑已客户端化，此路由不再被调用。
// 待 bash 可用后删除本目录。
export const dynamic = "force-static";

export function GET() {
  return new Response("moved to client", { status: 200 });
}
