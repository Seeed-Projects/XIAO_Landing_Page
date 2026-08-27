import { SiteHeader } from "../components";
import { CommunityRoadmap } from "./communityRoadmap";
import { SuccessCases } from "./successCases";

export default function OpenRoadmapPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex w-full flex-1 flex-col">
        <div className="mt-16">
          <CommunityRoadmap />
        </div>
        <SuccessCases />
      </main>
    </>
  );
}
