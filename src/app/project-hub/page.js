import { SiteHeader } from "../components";
import { ProjectHub } from "./projectHub";

export default function ProjectHubPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex w-full flex-1 flex-col">
        <ProjectHub />
      </main>
    </>
  );
}
