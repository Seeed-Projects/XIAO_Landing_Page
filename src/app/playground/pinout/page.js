import { SiteHeader } from "../../components";
import { Pinout } from "../../products/pinout";

export default function PinoutPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex w-full flex-1 flex-col">
        <div className="mt-16">
          <Pinout />
        </div>
      </main>
    </>
  );
}
