import { SiteHeader } from "../../components";
import { ESPFlasher } from "../../products/esp-flasher";

export default function EspFlasherPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex w-full flex-1 flex-col">
        <div className="mt-16">
          <ESPFlasher />
        </div>
      </main>
    </>
  );
}
