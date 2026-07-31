import { SiteHeader } from "../components";
import { ResHub } from "./resHub";

export default function ResPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex w-full flex-1 flex-col">
        <ResHub />
      </main>
    </>
  );
}
