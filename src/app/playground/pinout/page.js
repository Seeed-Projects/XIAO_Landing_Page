import { SiteHeader } from "../../components";
import { PinoutView } from "./PinoutView";

export default function PinoutPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex w-full flex-1 flex-col">
        <div className="mt-16">
          <PinoutView />
        </div>
      </main>
    </>
  );
}
