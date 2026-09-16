import { SiteHeader } from "../components";
import { ProjectHub } from "./projectHub";

export default function ProjectHubPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex w-full flex-1 flex-col">
        <div className="mt-16">
          <ProjectHub />
        </div>
      </main>
    </>
  );
}
