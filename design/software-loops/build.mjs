import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const source = dirname(fileURLToPath(import.meta.url));
const repository = resolve(source, "../..");
const destination = process.argv[2];
if (!destination) throw new Error("Usage: node design/software-loops/build.mjs <output-directory>");

const board = (name, x, y, width = 140, height = 180, extra = "") =>
  `<image class="board ${extra}" href="${name}.webp" x="${x}" y="${y}" width="${width}" height="${height}" style="filter:drop-shadow(9px 15px 10px #00496630)"/>`;
const text = (value, x, y, size = 22, extra = "") =>
  `<text x="${x}" y="${y}" font-size="${size}" ${extra}>${value}</text>`;
const path = (d, extra = "") => `<path d="${d}" fill="none" stroke="#004966" stroke-opacity=".25" stroke-width="3" ${extra}/>`;
const socket = (x, y, w = 186) => `<ellipse cx="${x}" cy="${y}" rx="${w / 2}" ry="24" fill="#eef6e6" stroke="#004966" stroke-opacity=".15"/>`;
const panel = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="24" fill="#ffffff" stroke="#004966" stroke-opacity=".14" filter="url(#shadow)"/>`;
const check = (x, y, id) => `<g class="result result-${id}"><circle cx="${x}" cy="${y}" r="17" fill="#16b66a"/><path d="M${x - 8} ${y}l6 6 11-13" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/></g>`;
const packet = (x, y, id) => `<circle class="packet packet-${id}" cx="${x}" cy="${y}" r="7" fill="#16b66a"/>`;

const scenes = {
  zephyr: {
    label: "XIAO × ZEPHYR", status: "ONE WORKSPACE", caption: "Different chips. One familiar development workflow.",
    art: `${panel(25, 85, 470, 350)}
      ${text("VS Code + Zephyr", 55, 132, 26, 'font-weight="700"')}
      ${path("M55 156H465")}
      ${text("APPLICATION", 55, 194, 16, 'fill="#526b91"')}
      ${text("sensor_demo", 55, 233, 29, 'font-weight="700"')}
      ${text("Build  /  Flash  /  Monitor", 55, 277, 21)}
      <rect x="55" y="315" width="405" height="12" rx="6" fill="#eef6e6"/>
      <rect class="build" x="55" y="315" width="405" height="12" rx="6" fill="#16b66a"/>
      ${text("One codebase", 55, 382, 22, 'fill="#526b91"')}${check(430, 375, "build")}
      ${path("M495 260H540V170H646M540 260H800M540 260V445H970V310")}
      ${socket(644, 289)}${socket(820, 358)}${socket(988, 289)}
      ${board("nrf52840", 578, 94, 127, 170, "board-a")}
      ${board("esp32-c6", 753, 160, 130, 174, "board-b")}
      ${board("rp2040", 921, 94, 128, 170, "board-c")}
      ${text("XIAO nRF", 644, 328, 21, 'text-anchor="middle" font-weight="700"')}
      ${text("XIAO ESP32", 820, 398, 21, 'text-anchor="middle" font-weight="700"')}
      ${text("XIAO RP", 988, 328, 21, 'text-anchor="middle" font-weight="700"')}
      ${check(694, 88, "a")}${check(870, 154, "b")}${check(1034, 88, "c")}
      ${packet(495, 260, "a")}${packet(495, 260, "b")}${packet(495, 260, "c")}`,
    motion: `tl.fromTo('.build',{scaleX:0},{scaleX:1,transformOrigin:'left center',duration:2.2,ease:'power2.inOut'},0.6);
      reveal('.result-build',2.85); send('a',145,-90,3.1); send('b',320,0,3.65); send('c',480,-70,4.2);
      reveal('.result-a',4.25);reveal('.result-b',4.8);reveal('.result-c',5.35);
      tl.to('.build',{scaleX:0,duration:0.55,ease:'power2.inOut'},8.8);`,
  },
  gfx2: {
    label: "SEEED GFX2", status: "ONE GRAPHICS INTERFACE", caption: "Draw once. Bring Seeed displays to life.",
    art: `${panel(30, 117, 304, 300)}
      ${text("Seeed_GFX", 58, 165, 30, 'font-weight="700"')}
      ${text("Text", 58, 213, 23)}${text("Shapes", 58, 252, 23)}${text("Images", 58, 291, 23)}
      <rect x="55" y="329" width="160" height="47" rx="14" fill="#eef6e6"/>
      ${text("Render UI", 135, 359, 20, 'text-anchor="middle" font-weight="700"')}
      ${board("rp2350", 246, 329, 82, 105, "board-a")}
      ${path("M334 261H377V105H476M377 261H737V250M377 261V417H766")}
      <rect x="449" y="38" width="245" height="237" rx="23" fill="#004966"/>
      <rect x="465" y="54" width="213" height="200" rx="12" fill="#eef6e6"/>
      <g class="draw-ui"><rect x="485" y="77" width="85" height="9" rx="4" fill="#16b66a"/>
      ${text("23.4°", 485, 158, 44, 'font-weight="700"')}
      <path d="M486 222l29-25 24 7 30-36 24 11 50-47" fill="none" stroke="#16b66a" stroke-width="5"/></g>
      ${text("LCD", 570, 311, 21, 'text-anchor="middle" font-weight="700"')}
      <rect x="752" y="85" width="266" height="164" rx="18" fill="#004966"/>
      <g class="draw-ui" fill="#ffffff">${text("XIAO", 784, 140, 25, 'font-weight="700"')}
      ${text("Ready to build", 784, 184, 21)}<path d="M784 208H977" stroke="#ffffff" stroke-width="3"/></g>
      ${text("OLED", 886, 287, 21, 'text-anchor="middle" font-weight="700"')}
      <rect x="599" y="347" width="419" height="160" rx="22" fill="#ffffff" stroke="#004966" stroke-width="3"/>
      <g class="draw-ui">${text("Today", 626, 389, 20, 'fill="#526b91"')}
      ${text("A little more possibility.", 626, 439, 25, 'font-weight="700"')}
      ${text("E-PAPER", 626, 480, 16, 'fill="#526b91"')}</g>
      ${packet(334, 261, "a")}${packet(334, 261, "b")}${packet(334, 261, "c")}`,
    motion: `send('a',145,-155,1);send('b',450,-80,1.8);send('c',430,175,2.6);
      tl.fromTo('.draw-ui',{opacity:0,y:8},{opacity:1,y:0,stagger:0.8,duration:0.65,ease:'power3.out'},2.1);
      tl.to('.draw-ui',{opacity:0,y:8,duration:0.6,stagger:0.1,ease:'sine.inOut'},8.2);`,
  },
  esphome: {
    label: "XIAO × ESPHOME", status: "PRODUCT FIRMWARE", caption: "Ready-made firmware. Everyday smart-home gadgets.",
    art: `${panel(28, 91, 409, 364)}
      ${text("XIAO ESPHome", 57, 139, 28, 'font-weight="700"')}
      ${text("Product configurations", 57, 178, 20, 'fill="#526b91"')}
      ${["Soil monitor", "IoT button", "Energy meter"].map((v, i) => `<rect x="55" y="${209 + i * 65}" width="353" height="50" rx="12" fill="#f7faf7"/>${text(v, 77, 241 + i * 65, 22)}${check(378, 234 + i * 65, String(i))}`).join("")}
      ${path("M437 273H511V176H637M511 273H817M511 273V422H968")}
      <path d="M601 68L805 0 1052 76V493H601Z" fill="#eef6e6" stroke="#004966" stroke-opacity=".12" stroke-width="2"/>
      <g transform="translate(630 110)"><path d="M0 63H101L83 170H19Z" fill="#ffffff" stroke="#004966" stroke-width="3"/>
      <path d="M49 64V-22M49 10C7 10 7-23 10-34 40-32 49-12 49 10M49 33C88 33 94 6 86-4 62-3 49 14 49 33" fill="#16b66a" fill-opacity=".2" stroke="#16b66a" stroke-width="3"/>
      <rect x="77" y="-5" width="18" height="90" rx="7" fill="#004966"/>
      <g class="result result-plant"><rect x="-23" y="178" width="132" height="40" rx="12" fill="#ffffff"/>${text("Moisture 42%", 43, 204, 17, 'text-anchor="middle"')}</g></g>
      <g transform="translate(846 108)"><rect width="142" height="153" rx="28" fill="#ffffff" stroke="#004966" stroke-opacity=".2" stroke-width="2"/>
      <circle cx="71" cy="72" r="44" fill="#f7faf7" stroke="#004966" stroke-opacity=".3" stroke-width="2"/>
      <circle class="result button-light" cx="71" cy="72" r="38" fill="#8fc31f"/>
      ${text("IoT button", 71, 187, 20, 'text-anchor="middle" font-weight="700"')}</g>
      ${board("esp32-c6", 620, 338, 112, 142, "board-a")}
      <rect x="783" y="345" width="242" height="126" rx="19" fill="#ffffff" stroke="#004966" stroke-opacity=".2"/>
      ${text("ENERGY", 807, 382, 16, 'fill="#526b91"')}
      ${text("128 W", 807, 437, 36, 'font-weight="700"')}
      ${check(988, 419, "meter")}
      ${packet(437, 273, "a")}${packet(437, 273, "b")}${packet(437, 273, "c")}`,
    motion: `reveal('.result-0',1);send('a',203,-100,1.2);reveal('.result-plant',2.3);
      reveal('.result-1',3);send('b',465,-95,3.1);reveal('.button-light',4.3);
      reveal('.result-2',5);send('c',540,147,5.15);reveal('.result-meter',6.3);`,
  },
  micropython: {
    label: "XIAO × MICROPYTHON", status: "WRITE · RUN · REPEAT", caption: "A few lines of Python. An immediate hardware response.",
    art: `${panel(26, 76, 567, 370)}
      ${text("MicroPython REPL", 56, 125, 27, 'font-weight="700"')}
      ${path("M55 148H563")}
      <g font-family="monospace" font-size="23" fill="#004966">
      ${text(">>> from machine import Pin", 56, 199, 23)}
      ${text(">>> led = Pin(3, Pin.OUT)", 56, 245, 23)}
      ${text(">>> led.value(1)", 56, 304, 23, 'class="line-on"')}
      ${text(">>> led.value(0)", 56, 366, 23, 'class="line-off"')}
      <rect class="caret" x="58" y="391" width="12" height="24" fill="#16b66a"/></g>
      ${path("M593 260H651V332H740")}${packet(593, 260, "a")}
      ${socket(825, 380, 330)}${board("esp32-c6", 690, 136, 165, 221, "board-a")}
      <path d="M803 321H881V283M807 345H957V283" fill="none" stroke="#004966" stroke-width="3"/>
      <path d="M881 304l-5 5 10 6-10 6 10 6-5 5" fill="none" stroke="#004966" stroke-width="3"/>
      <circle class="result led-glow" cx="920" cy="220" r="80" fill="url(#glow)"/>
      <path d="M882 254V213a38 38 0 0 1 76 0v41Z" fill="#eef6e6" stroke="#004966" stroke-width="3"/>
      <path class="result led-on" d="M882 254V213a38 38 0 0 1 76 0v41Z" fill="#8fc31f"/>
      <path d="M876 259H964M883 260V282M957 260V282" fill="none" stroke="#004966" stroke-width="4" stroke-linecap="round"/>
      ${text("GPIO → LED", 920, 143, 21, 'text-anchor="middle" font-weight="700"')}
      ${text("XIAO ESP32-C6", 790, 436, 26, 'text-anchor="middle" font-weight="700"')}
      ${text("Interactive Python", 790, 472, 19, 'text-anchor="middle" fill="#526b91"')}`,
    motion: `tl.fromTo('.line-on',{opacity:0,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0 0% 0 0)',duration:1.2,ease:'none'},1);
      send('a',174,72,2.3);reveal('.led-on,.led-glow',3.45);
      tl.fromTo('.line-off',{opacity:0,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0 0% 0 0)',duration:1.2,ease:'none'},5.1);
      tl.to('.led-on,.led-glow',{opacity:0,duration:0.6,ease:'sine.inOut'},6.9);
      tl.to('.line-on,.line-off',{opacity:0,duration:0.55,ease:'sine.inOut'},8.9);
      tl.to('.caret',{opacity:0.15,duration:0.4,repeat:19,yoyo:true,ease:'steps(1)'},0.2);`,
  },
  sensecraft: {
    label: "XIAO × SENSECRAFT AI", status: "ON-DEVICE INFERENCE", caption: "Deploy a model. Give your XIAO a new way to see.",
    art: `${socket(234, 358, 340)}${board("esp32-s3-sense", 137, 112, 177, 226, "board-a")}
      ${text("XIAO ESP32-S3 Sense", 234, 414, 24, 'text-anchor="middle" font-weight="700"')}
      ${text("Camera + edge AI", 234, 450, 19, 'text-anchor="middle" fill="#526b91"')}
      ${path("M332 241H516")}${packet(516, 241, "a")}
      ${panel(517, 37, 536, 447)}
      ${text("SenseCraft AI", 546, 81, 26, 'font-weight="700"')}
      <rect x="546" y="107" width="478" height="15" rx="7" fill="#eef6e6"/>
      <rect class="build" x="546" y="107" width="478" height="15" rx="7" fill="#16b66a"/>
      <rect x="546" y="154" width="478" height="257" rx="18" fill="#eef6e6"/>
      <path d="M546 360H1024" stroke="#004966" stroke-opacity=".2" stroke-width="3"/>
      <ellipse cx="792" cy="363" rx="99" ry="13" fill="#004966" opacity=".1"/>
      <path d="M726 256H836V329Q836 364 781 364T726 329Z" fill="#ffffff" stroke="#004966" stroke-width="3"/>
      <path d="M837 270H850Q890 270 872 309 864 327 837 327" fill="none" stroke="#004966" stroke-width="8"/>
      <ellipse cx="781" cy="255" rx="55" ry="11" fill="#ffffff" stroke="#004966" stroke-width="3"/>
      <path class="steam" d="M761 232q-12-15 0-30t0-29M796 232q-12-15 0-30t0-29" fill="none" stroke="#004966" stroke-opacity=".3" stroke-width="3"/>
      <g class="result detection"><rect x="705" y="233" width="184" height="146" rx="8" fill="none" stroke="#16b66a" stroke-width="4"/>
      <rect x="705" y="199" width="135" height="34" rx="6" fill="#004966"/>
      ${text("Cup  98%", 717, 223, 20, 'fill="#ffffff" font-weight="700"')}</g>
      ${text("Live camera preview", 546, 451, 20, 'fill="#526b91"')}${check(996, 444, "ready")}
      <path class="scan" d="M559 180H1011" stroke="#16b66a" stroke-width="2" opacity=".6"/>`,
    motion: `tl.fromTo('.build',{scaleX:0},{scaleX:1,transformOrigin:'left center',duration:1.9,ease:'power2.inOut'},0.7);
      send('a',-185,0,2.8);tl.to('.scan',{y:204,duration:1.8,ease:'sine.inOut',repeat:1,yoyo:true},3.8);
      reveal('.detection,.result-ready',4.8);
      tl.to('.steam',{y:-9,opacity:0.1,duration:2.4,repeat:3,yoyo:true,ease:'sine.inOut'},0.2);
      tl.to('.build',{scaleX:0,duration:0.5,ease:'power2.inOut'},8.8);`,
  },
};

/** Creates a deterministic ten-second scene with matching loop boundaries. 生成首尾衔接的十秒场景。 */
function composition(scene) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
  <script src="gsap.min.js"></script><style>
  @font-face{font-family:Montserrat;src:url(fonts/montserrat-regular.ttf);font-weight:400}
  @font-face{font-family:Montserrat;src:url(fonts/montserrat-bold.otf);font-weight:700}
  *{box-sizing:border-box}html,body{margin:0;width:1200px;height:720px;overflow:hidden;background:#f7faf7}
  #root{width:1200px;height:720px;color:#18224f;font-family:Montserrat,sans-serif}
  .scene-content{width:100%;height:100%;padding:48px 58px;display:flex;flex-direction:column;gap:26px}
  .top{display:flex;justify-content:space-between;align-items:center;height:25px;flex:none}
  .label{font-size:20px;letter-spacing:.06em;font-weight:700}.online{font-size:16px;color:#004966;display:flex;align-items:center;gap:10px}
  .online i{width:8px;height:8px;background:#16b66a;border-radius:50%}
  svg{width:1084px;height:525px;flex:none;overflow:visible;fill:#004966}text{font-family:Montserrat,sans-serif;color:#004966}
  g[fill="#ffffff"] text,text[fill="#ffffff"]{color:#ffffff}
  .caption{text-align:center;font-size:19px;color:#526b91}.result,.packet{opacity:0}
  </style></head><body>
  <div id="root" data-composition-id="main" data-start="0" data-duration="10" data-width="1200" data-height="720">
  <div class="scene-content"><div class="top"><div class="label">${scene.label}</div><div class="online"><i></i>${scene.status}</div></div>
  <svg viewBox="0 0 1084 525" aria-hidden="true">
  <defs><filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="15" stdDeviation="16" flood-color="#004966" flood-opacity=".08"/></filter>
  <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#004966" opacity=".12"/></pattern>
  <radialGradient id="glow"><stop stop-color="#8fc31f" stop-opacity=".5"/><stop offset="1" stop-color="#8fc31f" stop-opacity="0"/></radialGradient></defs>
  <rect x="0" y="0" width="1084" height="525" fill="url(#dots)"/>${scene.art}</svg>
  <div class="caption">${scene.caption}</div></div></div>
  <script>
  const tl=gsap.timeline({paused:true});
  function reveal(selector,time){tl.fromTo(selector,{opacity:0,scale:.94},{opacity:1,scale:1,transformOrigin:'center',duration:.45,ease:'back.out(1.3)'},time);}
  function send(id,x,y,time){tl.to('.packet-'+id,{opacity:1,duration:.15},time);tl.to('.packet-'+id,{x,y,duration:.85,ease:'power2.inOut'},time+.16);tl.to('.packet-'+id,{opacity:0,duration:.18},time+1.02);}
  tl.to('.board',{y:-8,duration:4.8,repeat:1,yoyo:true,ease:'sine.inOut'},.2);
  ${scene.motion}
  if(document.querySelector('.result'))tl.to('.result',{opacity:0,duration:.7,ease:'sine.inOut'},8.5);
  window.__timelines=window.__timelines||{};window.__timelines.main=tl;
  </script></body></html>`;
}

for (const id of ["ha", ...Object.keys(scenes)]) {
  const directory = resolve(destination, id);
  mkdirSync(resolve(directory, "fonts"), { recursive: true });
  writeFileSync(resolve(directory, "index.html"), id === "ha" ? readFileSync(resolve(source, "ha.html"), "utf8") : composition(scenes[id]));
  copyFileSync(resolve(source, "design.md"), resolve(directory, "design.md"));
  copyFileSync(resolve(source, "assets/gsap.min.js"), resolve(directory, "gsap.min.js"));
  for (const font of ["montserrat-regular.ttf", "montserrat-bold.otf"]) {
    copyFileSync(resolve(source, "assets", font), resolve(directory, "fonts", font));
  }
  for (const name of ["esp32-c6", "nrf52840", "rp2040", "rp2350", "esp32-s3-sense"]) {
    copyFileSync(resolve(repository, "public/home/playground-boards", `${name}.webp`), resolve(directory, `${name}.webp`));
  }
  copyFileSync(resolve(directory, "esp32-c6.webp"), resolve(directory, "xiao-esp32-c6.webp"));
}
console.log(`Prepared six compositions in ${resolve(destination)}`);
