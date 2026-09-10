# Partner Network Design QA

final result: passed

## Visual Evidence

- Source: `/var/folders/82/c3q_zgtd2zvbtgv_8qyn90fw0000gn/T/codex-clipboard-24b6e01b-91aa-454f-a50c-579a64daf74c.png` (1238 x 130 pixels).
- Desktop: `/tmp/xiao-partners-desktop-final.png`; CSS viewport 1231 x 1312, screenshot 1216 x 1296 pixels as returned by the in-app browser.
- Mobile: `/tmp/xiao-partners-mobile.png`; CSS viewport 390 x 844, screenshot 375 x 812 pixels as returned by the in-app browser.
- Route: `http://localhost:3000/XIAO_Landing_Page/#developer`.
- State: Chinese desktop and mobile, with English desktop also inspected.
- Comparison: source and rendered capture were emitted together for direct visual comparison. The source is one row; the implementation repeats that row structure across the three existing categories. The source is evaluated at approximately 1:1 width against the desktop content region; browser scrollbar insets are excluded from layout measurements.
- Focused region: the three logo rows are readable in the desktop capture, covering fixed labels, equal slots, original artwork and edge fades.

## Fidelity Surfaces

- Typography: existing Montserrat retained. Category labels use 14px medium weight on desktop and 13px on mobile; long English categories wrap within the fixed label column.
- Layout: 208px label column, 24px gutter, 192px logo slots, 104px desktop row height and 16px row spacing. Mobile labels stack above 88px strips. The 390px viewport has no horizontal page overflow.
- Colors: white section, muted gray labels, grayscale branding at rest and original colors on hover/focus. The edge mask follows the reference's fade into the background.
- Assets: 21 logo sources load successfully, including the current official EDGE AI FOUNDATION wordmark. Per-brand bounding boxes preserve aspect ratios. Long company names sit below their icons; wordmarks appear once.
- Copy: the three category translations accompany 6 hardware, 8 software/framework and 7 content/community entries using reviewed public brand names.

## Comparison History

1. Initial desktop review identified uneven optical scale in the stacked Zephyr mark and low visibility in the light Instructables artwork. Zephyr uses a 92 x 56 display box and Instructables receives a display-only brightness adjustment. Source assets remain unchanged.
2. Logo images load eagerly, with all 21 original entries reporting nonzero intrinsic image sizes.
3. Final source/capture comparison confirms the three-row layout, equal spacing, proportional artwork and edge masking. No actionable P0/P1/P2 layout findings remain.

## Interaction Verification

- Each track has two equal halves: 2304px for hardware, 3072px for software and 2688px for community. Each half exceeds the maximum supported rail width, including at the loop boundary.
- Browser observations confirm all three tracks moving with linear transforms; leaving the section clears their animation and returning restarts it.
- Keyboard Tab reaches the original links. Keyboard focus exposes a stationary, wrapping list; all repeated copies remain outside keyboard navigation. There are exactly 21 original links.
- Hover pause and reduced-motion layout are covered by stylesheet regression checks. The operating system's reduced-motion preference was not changed during browser testing.
- Console inspection returned no warning/error entries for the checked preview.
- Partner links use HTTPS destinations and new-tab behavior; EDGE AI FOUNDATION targets its current official site. No external form or submission was performed.
- Automated suite: 12 tests passed, covering partner layout, project loops and invitation typing. Targeted lint and production build passed.

## Implementation Map

- `src/app/page.js`: retains the section entry and switches this section's surface to white.
- `src/app/partner-marquee.js`: `PartnerMarquee()` reads categories and translations; `PartnerRow({ group, label, index })` renders a labeled loop and observes visibility; `PartnerLogo({ partner })` renders proportional artwork and its existing brand name when appropriate. Each returns rendered page content.
- `src/app/partner-marquee-layout.mjs`: shared slot size, scroll speed, copy count and per-brand display bounds.
- `src/app/globals.css`: responsive rows, edge masks, loop motion, hover and keyboard/reduced-motion states.
- `src/app/partner-marquee.test.mjs`: category coverage, asset bounds, track coverage and accessibility regression checks.
- `README.md`: preview and verification instructions.

Flow: Home renders PartnerMarquee, which reads the original partner data, builds three labeled rows, sizes the artwork and starts each loop when that row enters the viewport.

## Reproduce

1. Use the existing installed Node/npm dependencies. No additional package or environment variable is required.
2. Start from the project directory with `npm run dev -- --port 3000` and open the route above. The current preview is already running; keep it open for review.
3. Check both languages, narrow and wide windows, hover pause, and scroll away/return. Expect three complete categories with consistent slots and continuous motion.
4. Use Tab to navigate partner links. Expect a stationary list and one keyboard stop per original partner.
5. Enable reduced motion in the browser/OS to verify the static wrapping list. When an image source is unavailable, its readable brand name remains in the same slot.
6. Run `node --test src/app/partner-marquee.test.mjs src/app/typewriter-animation.test.mjs src/app/scroll-band-layout.test.mjs` and `npm run build`.
7. To stop the preview manually, use Ctrl+C in the terminal running the dev command.

## Follow-up Polish

- DigiKey currently uses the existing 16px favicon. A higher-resolution official asset can improve its sharpness in a later asset update.

## Brand Name Maintenance

- `site-data.js` supplies the 21 reviewed names and destinations. `partner-marquee-layout.mjs` matches every display name to its image bounds.
- `PartnerLogo({ partner })` receives one partner record and returns its logo and text. Names longer than 15 characters use a stacked layout within the 192px slot; the public component interface is unchanged.
- Home reads the partner records, renders three rows and repeats each full sequence for continuous scrolling. The seven-entry community row uses the same distance-based timing as the other rows.
- The official [EDGE AI FOUNDATION site](https://www.edgeaifoundation.org/) and [brand resources](https://www.edgeaifoundation.org/posts/edge-ai-foundation-brand-guidelines) identify the current foundation branding.
- Run `node --test src/app/partner-marquee.test.mjs src/app/playground-section.test.mjs src/app/typewriter-animation.test.mjs src/app/scroll-band-layout.test.mjs`: 18 tests pass, including exact partner identities, matching size keys and loop coverage. Targeted lint passes.
- Production build passes with 72 generated pages. Browser verification confirms all 21 images loaded, no card overflow at 390px, three active marquee tracks, both languages, and no new warning/error logs after reload.
- Repeat the Reproduce steps above in both languages. Expect all full names inside equal-width cards and the foundation logo visible against the white surface. Image failure should expose the full accessible name; reduced motion should expose one stationary list.

# Home Playground Review

final result: passed

## Coordinated Board Motion

- Entry uses an 820ms spread with 45ms staggering. Pointer proximity gently
  displaces nearby boards; a click sends a 620ms bounce outward, delayed by
  distance. Floating, entry, pointer and wave transforms use separate layers.
  Model selection, existing artwork, navy texture and tool destinations remain.
- `src/app/playground-motion.mjs`: `boardNudge(board, pointer, size)` returns
  bounded scene-pixel offsets and rotation; `boardWave(board, source)` returns
  delay and lift. `createPlaygroundMotion(scene, boards, clock)` returns move,
  play, reset, visibility and disposal controls. Pointer updates share one
  animation frame; new clicks cancel the previous wave.
- `src/app/playground-preview.js` connects those controls to pointer, click,
  keyboard, viewport and reduced-motion events. On entry the CSS spread starts;
  leaving cancels interaction motion. Preference changes disable movement while
  keeping selection available. `src/app/globals.css` defines entry and rest
  states, with mobile clearance for raised model labels.
- `src/app/home-ppt-sections.js` supplies the localized interaction hint.
  `playground-motion.test.mjs` covers distance response, center-point stability,
  frame batching, touch filtering, rapid clicks, cancellation and replay.
- Browser verification: a click produced different wave transforms on near and
  far boards; mouse movement displaced nearby boards only. Leaving cleared
  transforms and removed entry animation; returning restored staggered entry.
  Keyboard activation and Escape worked. At 390px both languages rendered with
  all eight boards and no horizontal overflow; the wave returned to rest.
- Reduced-motion behavior has unit and source coverage. OS preference toggling
  and physical touchscreen scrolling remain manual checks; browser resizing is
  not a physical touch-device test. Follow the README verification sequence.
- Documentation synchronized: README records the interaction and edge-case
  tests. No new dependencies, image assets, routes or environment variables.
- Verification: all 30 tests and targeted ESLint passed. The final production
  build generated 72/72 pages. The browser reported no warning/error entries;
  the existing Node module-type warning remains in command-line output.

## Circuit Texture Verification

- `src/app/globals.css` reuses the main branch's 280px circuit-trace tile in a
  decorative layer at 0.65 opacity over the existing navy surface. Rendering
  places the texture behind the content; it accepts no pointer events and
  remains stationary. Board layout and animation functions are unchanged.
- Desktop and 390px mobile previews show readable text, all eight boards and
  no horizontal overflow. Board selection remains clickable through the layer.
- All 25 automated tests passed, including the texture-layer regression check;
  the production build generated 72/72 pages. Preview remains on port 3000.
- Documentation synchronized: README describes the texture and repeatable
  desktop/mobile interaction checks. Existing startup instructions still apply.

## Target and Evidence

- Scope: eight small, selectable XIAO boards in a staggered arrangement, with the existing navy surface, Montserrat headings, green action and four tool destinations.
- Selected composition reference: `exec-38639037-4ccc-42f9-affc-5e2e33abf083.png` from the design exploration.
- Desktop implementation: `/tmp/xiao-playground-boards-desktop.png`.
- Mobile implementation: `/tmp/xiao-playground-boards-mobile.png`.
- Route: `http://localhost:3000/XIAO_Landing_Page/#playground`.
- Desktop CSS viewport: 1536 x 1024, matching the reference frame; mobile: 390 x 844. Reference and implementation were shown together in one comparison input. The implementation retains the site's header and adjacent sections.
- States: both languages, board selection, keyboard focus and repeated viewport entry.

## Visual Review

- Typography and color remain consistent with the existing site: the shared section heading size, original navy background, blue-gray body copy and green rounded action button.
- The heading spans the section above the content. The board scene is 560px wide on the large desktop, with each unrotated board at 120px; the section is approximately 799px high. Mobile boards are approximately 90px wide.
- The composition follows the reference's 3/2/3 arrangement. Deliberate implementation adjustments use the approved smaller board scale, actual product artwork, established typography and existing icons. The original navy surface integrates directly with transparent images.
- Eight source images retain their aspect ratios and intrinsic dimensions, with clean transparency and no visible compression damage. Selection reveals a small model label and raises the board without changing surrounding layout.
- Four tool links use consistent icon sizes, spacing, subtle hover/focus feedback and existing destinations.
- Mobile content stacks without horizontal page overflow; the existing image and links remain available.
- Arrows render as JSX string expressions, with a regression assertion covering their output.
- The caption explains the preview interaction; the tool list provides direct navigation, and the action beneath it opens the Playground overview.
- No actionable P0/P1/P2 visual findings remain against the approved layout and site style.

## Implementation and Flow

- `src/app/home-ppt-sections.js`: PlaygroundSection takes no arguments, reads the selected language, and returns the heading, board scene and sidebar containing the existing destinations.
- `src/app/playground-preview.js`: PlaygroundPreview takes no arguments and returns eight accessible board buttons. Its observer updates visibility and disconnects on removal; click handlers toggle the selected ID, and Escape clears it.
- `src/app/playground-boards.mjs`: supplies stable model names, image dimensions, positions and rotations. Board selection is a local visual state, independent of tool navigation.
- `public/home/playground-boards/`: eight compressed transparent images plus source provenance.
- `src/app/globals.css`: scoped responsive layout, floating motion, hover/focus/selected feedback and reduced-motion rules.
- `src/app/playground-section.test.mjs`: checks destinations, eight assets, stable positions, layout, accessible selection and motion lifecycle rules.
- Documentation synchronized: `README.md` contains the current startup and verification steps; asset notes record source mapping; this report records design and test evidence. No dependency, environment or route changes are required.

Flow: Home renders PlaygroundSection, which reads the language and renders PlaygroundPreview. The board data supplies each image and position. Entering the viewport starts floating; pointer or keyboard input changes the selected board. The sidebar links open the existing tools independently.

## Verification

- 21 automated tests passed, including all six Playground checks plus partner, project-loop, language, newsletter and typewriter regressions. Targeted lint and whitespace checks passed. The current production build generated all 72 pages successfully.
- All eight image resources loaded successfully. Desktop has no horizontal overflow; mobile model labels stay within the screen and tool text wraps cleanly in both languages.
- Leaving through the Newsletter chapter navigation changed visibility to false and animation to none. Returning through the Playground navigation restored visibility and playground-float animation.
- Repeated clicking toggled aria-pressed true/false. Enter selected a board, Tab moved focus with a visible outline, and Escape cleared selection. Mobile tapping exposed the selected model label.
- Initial fresh browser checks returned no warning/error entries. After tool navigation, Next.js reported the existing root smooth-scroll configuration warning; no hydration errors appeared. Existing Node module-type warnings remain unrelated to this change.
- At 768px the tool list uses two columns without horizontal overflow. Clicking Pinout opened `/playground/pinout/` and rendered the localized pinout heading. All four destinations exist and compile in the production build. No device connection or firmware flashing was performed.
- Reduced-motion CSS is covered by source checks; OS preference changes were not performed.
- Follow the Home Playground Verification section in README to repeat desktop/mobile, language, link, replay and reduced-motion checks.
