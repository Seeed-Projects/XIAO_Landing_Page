import { alt } from "./util.js";

export default {
  NRST: alt({ other: ["NRST"] }),
  SWCLK: alt({ other: ["SWD CLK"] }),
  SWDIO: alt({ other: ["SWD DIO"] }),
  "PH2-BOOT0": alt({ other: ["BOOT0"] }),
};
