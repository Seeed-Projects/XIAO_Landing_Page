import { SiteHeader } from "../components";
import { CommunityRoadmap } from "./communityRoadmap";

export default function OpenRoadmapPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex w-full flex-1 flex-col">
        <CommunityRoadmap />
      </main>
    </>
  );
}
