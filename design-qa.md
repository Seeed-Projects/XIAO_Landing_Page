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
- Assets: all 22 original logo sources load successfully. Per-brand bounding boxes preserve aspect ratios. Icon-only artwork retains its existing adjacent brand name; wordmarks appear once without duplicate labels.
- Copy: all three existing category translations and 22 partner names/links are preserved.

## Comparison History

1. Initial desktop review identified uneven optical scale in the stacked Zephyr mark and low visibility in the light Instructables artwork. Zephyr uses a 92 x 56 display box and Instructables receives a display-only brightness adjustment. Source assets remain unchanged.
2. Loading verification identified two pending, lazily loaded logos near the moving edge. Logo images now load eagerly. The final browser check confirmed all 22 original images complete with nonzero intrinsic sizes.
3. Final source/capture comparison confirms the three-row layout, equal spacing, proportional artwork and edge masking. No actionable P0/P1/P2 layout findings remain.

## Interaction Verification

- Each track has two equal measured halves: 2304px for hardware and 3072px for software/community. Each half exceeds the maximum supported rail width, including at the loop boundary.
- Browser observations confirm all three tracks moving with linear transforms; leaving the section clears their animation and returning restarts it.
- Keyboard Tab reaches the original links. Keyboard focus exposes a stationary, wrapping list; all repeated copies remain outside keyboard navigation. There are exactly 22 original links.
- Hover pause and reduced-motion layout are covered by stylesheet regression checks. The operating system's reduced-motion preference was not changed during browser testing.
- Console inspection returned no warning/error entries for the checked preview.
- Partner links retain their existing HTTPS destinations and new-tab behavior. No external form or submission was performed.
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

- Digi-Key currently uses the existing 16px favicon. A higher-resolution official asset can improve its sharpness in a later asset update.

# Home Playground Review

final result: passed

## Target and Evidence

- Scope: retain the Home site's navy surface, Montserrat headings, green action button and original artwork; place the heading above a wide image and four tool links.
- Style reference: `/tmp/xiao-playground-before.png`.
- Desktop implementation: `/tmp/xiao-playground-final-desktop.png`.
- Mobile implementation: `/tmp/xiao-playground-final-mobile.png`.
- Route: `http://localhost:3000/XIAO_Landing_Page/#playground`.
- Desktop CSS viewport: 1231 x 1312; mobile CSS viewport: 390 x 844. Both desktop reference and implementation were captured at the same default browser size and shown together for comparison. Mobile was checked separately for responsive layout.
- State: Chinese desktop, English mobile, language switching and keyboard focus.

## Visual Review

- Typography and color remain consistent with the existing site: the shared section heading size, original navy background, blue-gray body copy and green rounded action button.
- The heading spans the section above the content. The image measures about 704px wide, compared with approximately 378px previously. Section height is about 782px, with the image and tool content determining its size.
- Original artwork is unchanged and remains proportional. Shared icons come from the existing Playground page. Three display-only pin highlights and low-opacity ambient lighting stay within the visual area.
- Four tool links use consistent icon sizes, spacing, subtle hover/focus feedback and existing destinations.
- Mobile content stacks without horizontal page overflow; the existing image and links remain available.
- Arrows render as JSX string expressions, with a regression assertion covering their output.
- The image caption provides descriptive text; the tool list provides direct navigation, and the bottom action opens the Playground overview.
- No actionable P0/P1/P2 visual findings remain against the approved layout and site style.

## Implementation and Flow

- `src/app/home-ppt-sections.js`: PlaygroundSection reads the selected language, renders the heading, wide preview, four existing tool destinations and main action.
- `src/app/playground-preview.js`: PlaygroundPreview takes no arguments and returns the original image with decorative overlays. A viewport observer starts and resets the lighting; it disconnects when the component is removed.
- `src/app/playground-tool-icon.js`: PlaygroundToolIcon receives a tool type and returns its existing icon. `src/app/playground/page.js` imports the shared component so both surfaces use the same artwork.
- `src/app/globals.css`: scoped desktop/mobile layout, restrained lighting, link feedback and reduced-motion rules.
- `src/app/playground-section.test.mjs`: checks destinations, original asset, arrow rendering, wide layout and motion lifecycle rules.
- `README.md`: adds startup and verification steps. No dependency or environment changes are required.

Flow: Home renders PlaygroundSection; the selected language supplies text, the original image fills the wide column, and links open the corresponding existing tools. The viewport observer controls decorative lighting independently of navigation.

## Verification

- 17 automated tests passed, including caption navigation, partner, project-loop and typewriter regression suites. Targeted lint passed. The preceding production build generated all 72 pages.
- Pinout was opened by clicking its tool link; the destination rendered the Pinout heading. All four destinations exist and compile in the production build.
- Leaving the section sets the preview visibility to false and removes its animation. Returning sets visibility to true and restores the pin animation.
- Keyboard Tab focuses the Resources link with a visible outline. No device connection or firmware flashing was performed.
- Reduced-motion CSS is covered by source checks; OS preference changes were not performed.
- Follow the Home Playground Verification section in README to repeat desktop/mobile, language, link, replay and reduced-motion checks.
