import { SiteHeader } from "../components";
import { ResHub } from "./resHub";

export default function ResPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex w-full flex-1 flex-col pt-16">
        <ResHub />
      </main>
    </>
  );
}
