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
