import { flattenSoftware } from "../software-data";
import SoftwareDetailClient from "./SoftwareDetailClient";

// 静态导出需要预枚举所有 slug
export function generateStaticParams() {
  return flattenSoftware().map((s) => ({ slug: s.slug }));
}

export const dynamicParams = false;

export default function Page() {
  return <SoftwareDetailClient />;
}
