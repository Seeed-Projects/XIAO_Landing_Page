# Home Typography Design QA

final result: passed

## Visual Evidence

- Reference elements were measured in the running Home page: XIAO Playground
  for section titles, Popular SoCs Integrated for subtitles, and the About XIAO
  introduction for descriptions and text actions.
- Desktop viewport: 1440 x 900 CSS pixels. About, Features, Playground,
  Co-Create and Newsletter were inspected after their entrance motion settled.
- Mobile viewport: 390 x 844 CSS pixels. The complete Home heading inventory
  was checked in English, together with horizontal overflow and the mobile hero
  transition into the next section.

## Typography System

- Hero title: Montserrat, 700 weight, `.88` line height, `-0.04em` tracking and
  `clamp(72px, 8.2vw, 152px)` desktop sizing. Phones use a responsive 36–68px
  scale with `1.08` line height.
- Section titles: Montserrat, 700 weight, 1.12 line height, `-0.035em` tracking,
  and `clamp(28px, 3.6vw, 44px)` sizing.
- Subtitles: Montserrat, 20px, 700 weight, 1.5 line height and normal tracking.
- Descriptions: Montserrat, 400 weight, 1.65 line height, normal tracking, 15px
  on phones and 16px from 640px.
- Text actions: the same family, size and line height as descriptions at 700
  weight. Filled actions use white labels; text-only actions keep their green
  link color.
- The hero supporting line uses the subtitle role. Navigation, footer, metrics,
  labels and form hints remain auxiliary typography. Mobile
  email inputs remain 16px to prevent touch-browser focus zoom.

## Findings and Verification

- Before standardization, content headings ranged from 24px to 56px and used
  both 600 and 700 weights; body and action text ranged from 14px to 18px with
  several weights. These P1 consistency differences are resolved through the
  shared semantic roles.
- Desktop computed styles form exactly one group per role: one hero title at up
  to 152px/700, 11 section titles at 44px/700, 46 subtitles at 20px/700, 22
  descriptions at 16px/400 and 16 text actions at 16px/700.
- Mobile roles resolve to 36–68px/700 for the hero title, 28px/700 for section
  titles, 20px/700 for subtitles, 15px/400 for descriptions and 15px/700 for
  actions. The
  16px email input is the documented form control exception.
- All Home content headings are classified. Long project and news titles retain
  their existing two-line clamp, Playground tool copy stays inside the widened
  panel, and the page has no horizontal overflow at 390px.
- The project rule, regression tests and this QA record define the same five
  roles. No route, content, asset, dependency or interaction behavior changed.

# Home Hero Design QA

final result: passed

## Visual Evidence

- Source visual truth: `/var/folders/82/c3q_zgtd2zvbtgv_8qyn90fw0000gn/T/codex-clipboard-aa7dfe75-ee4e-4de1-bd3e-a04ece0008f7.jpg`, 3074 x 1162 pixels.
- Implementation: Codex in-app Browser capture of `http://localhost:3000/XIAO_Landing_Page/#hero`.
- Desktop viewport: 2548 x 1221 CSS pixels; rendered hero content area 2548 x 944 pixels. Browser density is 1 CSS pixel per captured pixel apart from the scrollbar inset.
- Mobile viewport: 390 x 844 CSS pixels; rendered content width 375 pixels and hero height 569 pixels. Browser density is 1 CSS pixel per captured pixel apart from the scrollbar inset.
- State: English, first carousel slide, page top. The source and rendered hero were inspected at their full width, then the copy and CTA region were checked separately for wrapping, contrast and alignment.

## Fidelity Surfaces

- Typography: the title uses the dedicated Home hero role at 700 weight, compact `.88` line height, tight tracking and responsive 72–152px desktop sizing. Its cyan-to-transparent fill keeps the upper half clear and blends the lower half into the photograph. The supporting line uses the shared 20px subtitle role and stays on one line at desktop widths. The action uses the shared 15–16px action role at 700 weight.
- Layout: the copy sits on a centered 1800px content grid with responsive inner padding. A 22–28px title gap and 34px action gap give the three elements room to breathe. The desktop CTA is 180 x 52px; the phone layout uses an 18px title gap, 28px action gap and 148 x 52px CTA. On phone, the hero occupies approximately three quarters of the viewport below the 64px header; content remains fully inside the hero.
- Colors: the photo's sampled cyan light (`#0095c2`) guides a localized cyan highlight over a blue-gray gradient. The highlight sits near the cyan light column in the photo. The opacity mask keeps the upper 42% opaque, fades progressively through 86%, 40% and 6% opacity, and reaches full transparency at the bottom. On phones the mask repeats per text line. The CTA uses the existing XIAO green token, bold white text and a subtle shadow.
- Depth: an SVG clip follows the original upright ruler silhouette and displays that portion of the same photograph above the title. The decorative layer is excluded from accessibility and pointer interaction. Desktop uses the same centered cover scaling for both photo layers; mobile uses the existing single-photo crop.
- Image quality: the existing 2560 x 965 XIAO banner remains unchanged and is rendered as the full-bleed source asset. Desktop uses the original centered crop; phone uses a focused crop that retains the product lineup.
- Copy: title, description and Explore label match the supplied wording. Explore targets the XIAO Products page at `/XIAO_Landing_Page/products/`.

## Comparison History

1. The first mobile capture exposed percentage-height positioning against a min-height container, placing the copy beneath the sticky header and hiding the product lineup.
2. The mobile hero now has an explicit responsive height. A second 390 x 844 capture measured the copy from y=169px to y=436px inside the y=64px to y=633px hero, with no horizontal overflow.
3. The typography pass exposed a new ultrawide imbalance: reducing the copy to the shared type scale left the old large gaps, oversized CTA and edge-based positioning intact.
4. At 2548 x 1221, the 152px title begins at x=462.5px and y=257.4px on the centered content grid. The copy begins at y=419.1px, followed by the 180 x 52px action at y=483.1px. The title spans the background as the main graphic while the supporting controls remain in the left dark area.

## Interaction Verification

- Clicking Explore opened `/XIAO_Landing_Page/products/` in the same tab and rendered the Products page hero.
- Explore includes a decorative right arrow that moves 3px on hover or keyboard focus and stays stationary with reduced motion.
- The title resets after the hero leaves the viewport and replays its 900–1100ms blur, opacity and vertical-motion transition when the hero returns. Reduced-motion mode renders the final state immediately.
- Keyboard focus has a visible 3px white outline with a 4px offset. Reduced-motion mode removes carousel and CTA transitions.
- The complete Node regression suite passed 46 tests, targeted lint passed, and the production build generated all 72 static pages.

## Findings

- No actionable P0, P1 or P2 differences remain. The reference uses a larger source canvas; responsive scaling intentionally preserves the same hierarchy instead of forcing its absolute pixel sizes.

## Follow-up Polish

- P3: if a future carousel slide uses a much brighter left edge, it can provide its own overlay strength alongside the slide data.

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

## Footer Wide-Screen Distribution

- The five-group footer navigation expands from the original 1440px limit to a
  balanced 1800px maximum. Its responsive edge padding is 24px on
  phones, 40px on small screens, and 64px to 128px on desktop and ultrawide.
  Vertical padding is 64px on phones and 80px on desktop.
- Existing column ratios keep the brand, Company, Develop with XIAO, Community
  and subscription areas in their established order while using the previously
  empty side regions. The copyright strip remains centered below the full-width
  divider.
- `site-footer.test.mjs` checks the uncapped container, responsive padding and
  five-column grid. README records desktop, ultrawide, tablet and phone checks.
  No content, destinations, subscription behavior, assets or dependencies changed.

## Newsletter Typography Alignment

- `EdmSubscribe()` now applies the News introduction's responsive 16px/18px
  type scale and 1.65 line height to the Newsletter description and email input.
  The email field also adopts the description's 576px maximum width, compact
  vertical padding and a 20px icon. The Subscribe action uses a 200px minimum
  width, 12px vertical padding and matching 16px/18px type. Content, contrast
  treatment and submission behavior remain.
- `newsletter-contrast.test.mjs` verifies both typography targets alongside the
  existing contrast checks. README adds desktop, mobile and language comparison
  steps. No routes, assets, dependencies or environment variables changed.

## Co-Create Persistent Expansion

- `CoCreateSection()` starts with a collapsed project grid. Mouse entry or
  keyboard focus calls `openProjects()`, which sets the expanded state to true.
  The state remains true until the page component is recreated, so pointer exit,
  focus exit and repeated scrolling leave the project grid open.
- The delayed close timer and its cleanup lifecycle were removed. This makes the
  flow direct: render collapsed, receive the first interaction, render expanded,
  and retain that result for the current page visit.
- `co-create-section.test.mjs` checks both supported opening triggers and confirms
  that no closing state path remains. README documents mouse, keyboard, scroll
  and refresh verification. No routes, assets, dependencies or environment
  variables changed.

## Current: Centered Tools and 22-Board Orbit

- Central-content follow-up: the reading panel expands from 560px to a maximum
  of 820px, while tool cards use a 108px minimum height and tighter body-copy
  line spacing. The redundant interaction caption was removed together with its
  reserved gap. The tool names, descriptions and destinations remain unchanged.
- Idle-motion follow-up: visible boards now drift on three small axes with
  per-board direction, duration and phase differences. The movement remains on
  the existing float layer, so scroll placement, pointer nudges and click waves
  continue to compose independently. Reduced-motion mode keeps this layer still.
- Wide-screen follow-up: the board scene now breaks out of the shared 1680px
  content limit and spans the dark section, while the 560px reading panel stays
  centered. Side boards use outer and inner lanes derived from the available
  space, so the composition expands naturally on ultrawide screens.
- At a 2520 x 1262 viewport matching the supplied screenshot ratio, the scene
  covered 2392px. Board bounds reached from x=236.7px to x=2268.3px, leaving
  balanced edge breathing room while keeping all 22 boards clear of the panel.
  At 1440px and 390px, all images loaded, no board overlapped the reading panel,
  and the page had no horizontal overflow.
- The title, four tools and overview action share a centered navy panel. The
  existing circuit texture, green action and transparent artwork remain.
  The supplied collection now contributes 22 models: 12 base boards, four Plus
  variants and six Sense variants. Desktop boards frame all four sides; narrow
  screens use upper and lower groups. Source images retain their proportions.
- Scroll position controls a reversible gathered-to-scattered arrangement.
  Measuring the actual text panel keeps the boards outside its reading area.
  Pointer nudges and click waves use the current board positions. Separate
  transform layers combine scroll rotation, entry, floating and interaction.

### Files and Function Responsibilities

- `home-ppt-sections.js`: `PlaygroundSection()` reads the selected language and
  renders the centered heading, tool links, action, hint and board scene.
- `playground-boards.mjs` and `public/home/playground-boards/`: supply 22 names,
  image dimensions and compressed transparent images, including 14 additions.
- `playground-orbit.mjs`: `orbitProgress(top, height, viewportHeight)` returns a
  bounded scroll fraction. `orbitPosition(index, size, hub, progress, wide)`
  returns a board's percentage coordinates and rotation for the measured panel.
- `playground-preview.js`: `PlaygroundPreview()` renders the selectable boards.
  Its `updateOrbit()` measures the scene and panel, calculates positions and
  writes them to the board elements; `scheduleOrbit()` batches updates into one
  display frame. Scroll, size and language changes update the measurements.
  Observers and listeners are released when the component is removed.
- `playground-motion.mjs`: `createPlaygroundMotion()` accepts a current-position
  getter so pointer and click effects follow the moving composition. It returns
  movement, wave, reset, enable and disposal controls.
- `globals.css`: defines the centered panel, responsive board sizes and separate
  motion layers. The orbit, motion and section tests cover the associated rules.

Flow: Home renders the localized panel and images. Once measured, each board
receives a position outside the reading area. Scrolling changes those positions;
pointer or keyboard input selects a board and triggers the existing wave.
Tool links navigate independently. Reduced motion uses the stationary spread
positions while retaining board selection and navigation.

### Verification and Documentation

- All 34 automated tests passed; targeted ESLint passed. The production build
  generated 72/72 pages. The existing Node module-type warning remains.
- Desktop: all 22 images loaded, and board rectangles stayed outside the central
  panel. Scrolling down changed the first board from (10.1792%, 19.5686%) to
  (6.39211%, 14.0734%); scrolling back restored its original coordinates.
  Clicking the added ESP32-C5 selected it and animated neighboring boards.
- Clicking Pinout opened the existing pinout route and rendered its heading.
  Browser logs contained no errors; navigation reported the existing root
  smooth-scroll configuration warning.
- At 390px, all 22 images loaded with no horizontal overflow or central-panel
  overlaps. Both languages were inspected. Physical touchscreen scrolling and
  OS reduced-motion preference switching remain manual checks; source and unit
  tests cover reduced-motion and lifecycle behavior.
- README documents startup, main flow, language/resize, repeated entry, rapid
  clicks, keyboard and reduced-motion checks. The asset README records all 22
  source mappings and their approximately 725.5 KiB combined size. No dependencies,
  routes or environment variables were added.
- Preview stays at `http://localhost:3000/XIAO_Landing_Page/#playground` using
  `npm run dev -- --port 3000`. The existing server remains running. Ctrl+C in
  its terminal stops it manually. Repeat the README verification sequence.

## Historical Eight-Board Verification

The following records describe the preceding eight-board composition.

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
