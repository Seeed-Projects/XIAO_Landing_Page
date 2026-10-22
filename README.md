This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Home Hero Verification

The Home hero places the primary message over the existing XIAO product image.
The Explore action opens the XIAO Products page and includes a right arrow that
moves subtly on hover or keyboard focus.
Desktop supporting copy and its action align responsively with the midpoint of the
initial `S` in the title. The hero title uses generated cinematic artwork at 75% of the hero
width, combining smoked navy glass, a restrained cyan edge light and shallow
matte-blue depth. Its upper two thirds remain visible while the lower third fades
into the photograph. The accessible `h1` label remains in the page structure.
The artwork uses a restrained 75vw desktop width and a calibrated horizontal offset so the center of the `I` in `XIAO`
aligns with the original upright ruler, which remains in front of the title.
Entering the hero reveals
the title through a soft blur-and-rise transition; leaving and returning replays
the motion. A 22–28px title gap and 34px action gap keep the supporting copy and
180px desktop action clear of the product lineup. Phone layouts preserve a
roughly three-quarter-screen hero and use a dedicated two-line version of the
same title artwork, responsive initial-`S` copy alignment, a 28px action gap and a compact 148px action.

With the existing dependencies installed, run `npm run dev -- --port 3000` and
open `http://localhost:3000/XIAO_Landing_Page/#hero`. At desktop and 390px phone
widths, confirm the complete title, single-line desktop description and green
Explore button remain grouped in the dark image area without horizontal
overflow. On phones, the description may wrap naturally to preserve readable
type. At 2520px ultrawide width, confirm the copy aligns with the centered content grid
instead of staying against the browser edge. Click Explore and expect the
browser to open `http://localhost:3000/XIAO_Landing_Page/products/`. Run
`node --test src/app/home-carousel.test.mjs` for the content,
destination, responsive-layout and replayable-title-motion regression checks.

## Product Catalog

The Products page (and Home products section) present three XIAO series as the
primary browsing stage:

- **Series switcher**: Dev Boards, Add-ons, Gadgets — each with cover, eyebrow,
  title and product count. Two gradient curves flow from the active card's
  bottom centre through equal-width mirrored arcs, with horizontal extensions
  completing the stage's top edge. The area below the arcs glows at the focal
  point and fades into the stage tint. The
  curves slide to the newly selected card when the series changes. Below
  1024px the three cards stay in one row with a cover strip on top; at 640px
  and below the eyebrow is hidden
- **Series stage**: intro copy, tags, subcategory chips, and a short product
  row (small thumbnail on the left, name, one-line blurb, Wiki and Buy).
  The active tab names the stage, so the stage opens directly with the intro.
  Desktop shows 5–6 cards per row.
- Data lives in `src/app/products/catalog.js` (`PRODUCT_CATALOG`,
  `SERIES_PRESENTATION`); UI in `src/app/product-panel.js`

Deep link: `/products/?cat=addons#products-catalog` opens the Add-ons series.

### Shared card previews

Projects, News and the Products catalog use `CardPeek` with `CardPeekContent`
from `src/app/card-peek.js`. The shared dark panel opens beside its source card,
with a green source outline and a light spotlight over the surrounding cards.
Projects and News show the full title and description. Product previews show
only the optional `image` slot, displayed in full with its original transparency
against the shared panel background. Panel styling lives in
`src/app/globals.css`; new card previews extend this shared component.

Mouse hover and keyboard focus open the panel. Scrolling keeps control of the
page, hides the panel during movement and restores it after scrolling settles.

## Content Page Layout

Content pages share the `--page-intro-height`, `--page-content-width` and
`--page-content-gutter` tokens. `ToolPageIntro` reserves the introduction area;
software detail pages use the same height through `page-detail-intro`.
The first content block starts directly after this area and aligns to the shared
left edge. The Home layout keeps its existing structure.

The Products catalog opens with its series description, Project Hub with
Featured Projects, Open Roadmap with the stage cards, and Playground with the
tool cards. Products retains a screen-reader heading for its section navigation.

## XIAO Selector (Products)

The Products page includes **XIAO Selector**, a faceted workbench for picking
a development board:

- **Filter sidebar** (sticky on desktop, bottom drawer on mobile): search by
  board name or MCU, collapsible groups for connectivity, variant, chip
  platform, onboard sensors and power, a **More Filters** section for I/O and
  development platforms, and a separate **Purchase Options** block. Every
  option shows a live count of boards that remain if it is selected.
  Capability groups use AND; category groups use OR; groups combine with AND.
- **Results**: card view (default) or spec table with MCU, core, Flash / RAM,
  GPIO and capability tags. Active filters appear as removable chips; an empty
  result lists which single condition to remove to get boards back.
- **Compare**: pick up to four boards, then open the compare panel with an
  "Only show differences" toggle. Capabilities occupy aligned individual rows.
  The first selected board is the reference; green highlights mark values that
  differ from it, and an em dash indicates an unavailable or unlisted item.
  Column headers and parameter labels stay visible while scrolling the inset table.

Files: `src/app/products/xiao-selector.js` (UI),
`src/app/products/board-specs.mjs` (filter groups, spec matrix, hardware
summary, Wiki links) and `src/app/products/spec-filter.mjs` (filtering, facet
counts, search, suggestions). `src/app/products/board-comparison.mjs` prepares
the aligned comparison rows and reference-based differences.

Verification:

```bash
node --test src/app/products/spec-filter.test.mjs src/app/products/board-comparison.test.mjs src/app/products-typography.test.mjs
```

With `npm run dev` running, open
`http://localhost:3000/XIAO_Landing_Page/products/#smart-selector`. Tick
options and confirm the result count and facet numbers update, switch between
Cards and Table, add boards to compare and open the panel, and create an empty
result to see removal suggestions. On a phone-width viewport the sidebar opens
from the **Filters** button.

### Wireless badges

Selector cards reserve a row-aligned band above the board photo. Wireless
protocols use icon-only badges at every width and language, ordered Wi-Fi,
Bluetooth LE, Thread, Zigbee, Matter, NFC on the left; Sense / Plus appear on
the right. Each 30 × 24px badge has a centred white official logo, an accessible
protocol name and a native tooltip. Up to five badges fit on one line beside
Sense / Plus at desktop and phone widths. Official logo geometry is
inlined by `src/app/products/wireless-protocols.mjs`; originals and attribution
are in [design/wireless-logos/SOURCES.md](design/wireless-logos/SOURCES.md).
Fills are Wi-Fi `#146B58`, Bluetooth `#0082FC`, Thread `#865022`, Zigbee
`#EB0443`, Matter `#7151A8`, NFC `#002E5F`.

## Scroll Band Verification

The project carousel displays two rows and repeats its existing content to cover
the viewport throughout each cycle. Resizing the viewport recalculates the copy
count and the exact batch travel distance. Hovering or focusing a card pauses the
animation; the system's reduced-motion preference keeps it stationary.

Run the layout regression tests with Node.js:

```bash
node --test src/app/scroll-band-layout.test.mjs
```

All five tests should pass. With `npm run dev` running, open
`http://localhost:3000/XIAO_Landing_Page/#projects`, keep the pointer outside the
cards, and watch for two 55-second cycles. The two rows should continuously fill
the viewport with consistent spacing at the seam. Check both a wide desktop
window and a narrow mobile window, then verify pause and resume using hover or
keyboard focus.

## Home Projects and News Sync

Home Projects and News are generated before each production build and stored in
`src/app/home-content.generated.json`. Projects come from the public
`Seeed-Studio/OSHW-XIAO-Series` catalog; News comes from the Seeed Studio Blog
tag `seeed-studio-xiao`. The committed snapshot keeps the page complete when one
source is temporarily unavailable.

The Home page shows at most 48 project cards and 12 news cards. Projects marked
`homepage: featured` appear first, projects marked `homepage: catalog` remain in
the Project Hub only, and projects marked `homepage: review` wait for editorial
review. Legacy records without a homepage field remain eligible until they are
reviewed. Every Home project requires a public cover image.

Run a manual refresh with:

```bash
npm run sync:home-content
```

Run the feed normalization, ordering, limit, and fallback checks with:

```bash
npm run test:home-content
```

GitHub Pages refreshes every six hours, on manual dispatch, on pushes to `main`,
and when the OSHW repository sends the `projects-updated` repository event. The
OSHW repository uses `LANDING_PAGE_DISPATCH_TOKEN` for that cross-repository
event. A fine-grained token needs access to this repository and permission to
write repository dispatch events.

## Image Optimization

Images in `public/` stay within a size budget: raster files up to 300 KB and SVG
files up to 400 KB. `scripts/optimize-images.mjs` shrinks larger files in place,
keeping the same path and file name, so page code stays unchanged:

- JPEG, PNG, WebP and GIF files are resized to their folder's longest-edge limit
  (2560 px by default) and re-encoded in the same format. PNG files use a
  colour palette when it stays visually identical, and lossless compression
  otherwise.
- SVG files exported with embedded photos keep their vector content; each photo
  is resized to its display size and re-embedded as WebP.
- Processed files are recorded by content hash in `scripts/optimized-images.json`
  and are skipped until their content changes. Commit this file together with
  the optimized images.

Per-folder limits live in `scripts/image-budget.mjs`. Set a folder rule from the
largest size the image is displayed at, doubled for high-density screens.

Every `npm run build` runs the optimizer first, so the deployed site always
receives optimized images. After adding or replacing images, run:

```bash
npm run images:optimize
npm run images:check
npm run test:images
```

`images:check` lists any image still over budget and exits with status 1 when
one remains.

Public asset filenames use ASCII kebab-case so React's image preload `Link`
response headers can be serialized consistently. Update page references and any
matching optimization-cache entries together when renaming an asset.

## Home Introduction Video

`src/app/video-intro-section.js` shows the video's first sharp frame (0.5 s) from
`public/home/xiao-intro-video-poster.webp` (1920 × 1080) with a local channel
avatar, `public/home/seeed-studio-youtube-avatar.jpg` (96 × 96). The cover displays
the video title, channel links, copy-link feedback and a YouTube watch link in
English or Chinese. The overlay uses Roboto or YouTube Sans when installed,
with system sans-serif fallbacks. Its styling is in
`src/app/video-intro-section.module.css`.

Clicking the poster or activating its play button loads the YouTube privacy
embed for `A_XUi8tlKWk` and autoplays from 5 seconds in the same 16:9 area.
Channel and title links open separate tabs; copying shares
`https://youtu.be/A_XUi8tlKWk`, and the watch link opens the video at 5 seconds.
Each control has a separate keyboard target and a visible focus ring. The
overlay uses static styling that also respects reduced-motion preferences.

The introduction's four feature illustrations are
`public/home/xiao-feature-popular-socs.webp`,
`public/home/xiao-feature-thumb-size.webp`,
`public/home/xiao-feature-tinyml.webp` and
`public/home/xiao-feature-developer-friendly.webp`.

To replace the cover, convert the supplied zero-second PNG to WebP with the
existing `sharp` dependency at quality 82, move the source PNG into `.trash/`,
then run `npm run images:optimize`. The WebP is the deployed cover asset.

Check the unplayed cover at 1440px and 390px in both languages. Copy a link,
open a channel/title/watch link, and activate playback using Enter or Space.
The cover and iframe should keep the same dimensions throughout.

## Home Playground Verification

The Home Playground section displays 22 original transparent XIAO board images,
covering the supplied base, Plus and Sense models. The heading, four compact tool
links and overview action form a centered reading area up to 820px wide. Boards surround that area on
desktop and form upper and lower groups on narrow screens. On wide and ultrawide
desktops, the board scene spans the full dark section and uses outer and inner
side lanes instead of inheriting the shared content-width limit. Desktop boards are
at most 90px wide before rotation. Each board follows its own slow, subtle idle
drift with small vertical, horizontal and rotational movement while visible; hovering
or focusing reveals its model. Clicking selects a board, clicking again or
pressing Escape clears selection. Selection is a visual preview state.
Scrolling down spreads boards toward the perimeter; scrolling up gathers them
again. Positions are measured around the reading area, including after language
or viewport changes. Mouse movement gently nudges nearby boards;
clicking or keyboard activation sends a short, distance-ordered bounce through
the group. Each new click starts a fresh wave. Motion stays inside the board
scene, while tool links and text remain stationary.
The navy background carries a subtle, stationary circuit-trace texture reused
from the main branch. The decorative layer leaves board and tool interactions
available. Check its readability at desktop and mobile widths.

With the existing dependencies installed, run `npm run dev -- --port 3000`
(reuse the running server when available), then open
`http://localhost:3000/XIAO_Landing_Page/#playground`.

1. Check all 22 images at 2520px ultrawide, desktop, tablet and 390px mobile
   widths. The ultrawide layout should occupy both side regions. Images
   retain their proportions, and mobile content stacks without horizontal overflow.
2. Watch several boards before interacting and confirm their idle drift is subtle
   and out of phase. Hover a board, click twice, and use Tab, Enter and Escape. The model label,
   selected state and keyboard focus should follow the active board. Move the
   mouse across the scene and out: nearby boards yield slightly and return.
   Rapidly click different boards: the latest wave replaces the previous one.
3. Scroll down and back up: board positions move outward and return while the
   central text stays clear. Scroll completely away and return: entry motion
   and floating restart.
   With the system's reduced-motion preference enabled, boards remain stationary
   and selectable. Changing this preference during a wave cancels its movement.
   On phones, verify tapping a board and scrolling vertically over the scene.
4. Switch languages. Confirm each tool description remains compact, then click
   each of the four tool links and the green overview
   action; each opens its existing destination.
5. Run `node --test src/app/*.test.mjs` and `npm run build`; expect all tests
   to pass and all 72 static pages to build. Building fetches public project data
   and requires network access.

Asset provenance is recorded in [the board asset notes](public/home/playground-boards/README.md).
Use Ctrl+C in the dev terminal to stop the preview manually.

## Co-Create Expansion Verification

The Scale-up Co-Create Projects panel starts collapsed. The first mouse entry or
keyboard focus expands it and latches that state for the rest of the page visit.
Moving the pointer away, moving focus away, or scrolling out and back does not
collapse it. Refreshing the page restores the initial collapsed state.

Open `http://localhost:3000/XIAO_Landing_Page/#cocreate`, move the pointer into
the Co-Create card, then move away and scroll to another section and back. The
project grid should remain fully expanded. Press Tab until a link inside the card
receives focus and repeat the check. Run `node --test src/app/co-create-section.test.mjs`
to verify the latch behavior in source.

## Home Typography Verification

Home content uses five shared type roles. Section titles match XIAO Playground
with responsive 28px to 44px type, 700 weight, 1.12 line height and tight
tracking. Subtitles match Popular SoCs Integrated at 20px, 700 weight and 1.5
line height. Descriptions match the About XIAO introduction at 15px on phones
and 16px from the small breakpoint, 400 weight and 1.65 line height. Action
labels use the same family, size and line height at 700 weight; filled actions
use white labels. Page-level primary CTAs share the `home-primary-cta` recipe
(`min-height: 48px`, `padding: 0.75rem 1.5rem`, pill radius, brand green fill
and a light lift on hover) across Home, Products and Project Hub. Compact row
actions such as catalog Wiki / Buy keep a smaller hit area while using the same
fill and pill shape. The hero campaign copy, navigation, footer, metrics, labels and form
hints keep their purpose-specific compact styles. The hero title uses dedicated
cinematic artwork while retaining an accessible heading label; its short supporting
line continues to use the shared subtitle role.

With the preview running, open
`http://localhost:3000/XIAO_Landing_Page/` and compare About, Features,
Glimpse, Developer Ecosystem, Roadmap, Projects, Playground, Co-Create, News and
Newsletter in English and Chinese. At desktop and 390px phone widths, headings
within the same role should have identical computed font family, size, weight,
line height and tracking, with no clipped copy or horizontal overflow. Run
`node --test src/app/home-typography.test.mjs src/app/newsletter-contrast.test.mjs`
to verify the shared tokens, component coverage and Newsletter contrast.

## Theme Colors

Content pages share three theme colors defined in `src/app/globals.css`. Each
color carries the same meaning on every page:

| Token | Value | Meaning | Used by |
| --- | --- | --- | --- |
| `--theme-blue` | `#2f66e0` | Foundation / starting point | Dev Boards, Open for Vote |
| `--theme-teal` | `#0f7c91` | Connection / in progress | Add-ons, In Development |
| `--theme-lime` | `#8fc31f` | Ready / shipped | Gadgets, Accomplished, Success Stories |

`--theme-lime` matches the brand button green and fills stripes, nodes, borders
and filled chips; text on light surfaces uses `--theme-lime-ink` (`#4d7c0f`).
Blue and teal serve both roles directly. The Open Roadmap Wish List column uses
the neutral `--theme-neutral` (`#64748b`) as the stage before an idea enters the
pipeline. All text colors reach at least 4.5:1 contrast on white.

Home Glimpse cards and `SERIES_PRESENTATION` in `src/app/products/catalog.js`
set `tone` for stripes and `ink` for text. The Open Roadmap board reads
`--stage-accent` and `--stage-ink`, and Success Stories reads `--c-*` stage
variables that point at the same tokens.

## Project Hub Typography

Project Hub uses the same five Home type roles for hero title, section titles,
card titles, body copy and actions. The hero image uses the shared full-bleed
frame (`aspect-ratio: 1695 / 632`, `min-height: 420px`, phone `620px`) with
copy starting at the shared `page-hero-copy` left edge.

## Playground Typography

The Playground landing page (`/playground/`) uses the same five Home type roles
and the shared hero copy edge (`page-hero-copy`). Its hero offers four task links
for wiring, firmware flashing, hardware files and software selection. Each tool
showcase explains its audience and available functions, with a direct link to the
working tool. The footer links for Pin Out and XIAO Flasher use those same tool
routes. Run
`node --test src/app/playground-typography.test.mjs` to verify the shared
tokens and hero frame.

## Playground Pinout

`/playground/pinout/` shows every official XIAO pinout as two stacked diagrams
(front above back) on one page. A rounded control bar on top carries the board
picker, the framework switch, pin search and the colour key; the diagram stack
scales itself so both faces stay in one screen. Click a label row to open a
floating card on the opposite side of the board: names, per-pin notes, an
alt-function table, one function primer per capability, a copyable code sample,
related bus pins, and Wiki / schematic links. The primers start collapsed so the
card opens on the pin facts; each one expands on click and every pin opens
fresh. The card is as tall as its content and only grows to the visible height
when a pin carries enough of it. Clicking anywhere outside a pin row, the card
and the board table closes the card, as does `Esc`. Below the diagrams a board reference card holds the
electrical facts (logic level, 5 V tolerance, 3V3 budget, VBUS, battery) as a
read-only spec strip, followed by
the pin table, which starts expanded. The table is a read-only reference: rows
highlight to follow the pin selected on a diagram, and the note column keeps one
line per pin with the full text available on hover. On viewports narrower than
900px the card becomes a bottom sheet and the table scrolls sideways. URLs keep
`?board=` and `?pin=`.

The page chrome reuses the site design tokens — the `--r-card` / `--r-inner` /
`--r-pill` radii, `--surface`, `--line-soft`, `--shadow-card` and the brand
green accent — so it reads like Home, Products and Playground. Interactive
controls are pills or colour chips, read-only data uses label-above-value pairs,
face markers are centred section rules, and the official artwork stays frameless
so it blends into the page background.

`FN_COLOR` and `FN_LABEL` in `data/footprint.js` carry the official XIAO pinout
palette and the wording printed on the artwork colour key (`POWER`, `GND`,
`DIGITAL GPIO`, `ADC INPUT`, `I2C`, `SPI`, `UART`, `SYSTEM`). The colour key
chips, the row highlight and the pin card accent all read from that one map, so
a colour change lands everywhere at once. Chip wording is identical in both
languages to match the printed artwork. Every chip carries the same width, sized
to the longest label, and the row stays left aligned and wraps on narrow
viewports.

Selecting a colour key keeps every label in each matching pin row fully coloured
and adds a subtle row highlight. Labels matching the selected function use the
key's colour, with centred, contrast-aware printed text fitted to the original
box. Other labels in that row retain their artwork colours. Clearing the filter
restores the original artwork. Other rows fade, including their selection
marks. Pin search combines with the colour key, so a row stays bright when it
matches both. Selecting the active key again clears the colour filter.

Official artwork lives in `public/xiao-products/pinout/<boardId>-<face>.svg`
(47 faces, including the S3 Sense expansion module). Label boxes are scanned
from SVG rects. Categories come from their printed text: combined labels retain
every named function in a `cat` array, while single-category labels keep a string.
The raster scanner uses colour as a fallback. Outlined
SVG lettering is transcribed by box coordinates in `scripts/pinout-label-text.json`;
each face's SHA-256 binds the transcription to its reviewed artwork. For updated
artwork, review its label text and coordinates and refresh the hash in that index.
`scripts/pinout-label-categories.mjs` distinguishes buses, pin names, power rails,
system controls and peripherals, including CAN/PTC and I2S/indicator labels.
Row ids are mapped in `scripts/pinout-generate-rows.mjs` (`MANUAL` plus inference).
Artwork column boundaries are stored as height-indexed `columnSplits`: the S3
Sense module uses separate banner and B2B connector centres, and RA4's back uses
the board centre. Scanning collapses coincident SVG rectangles to one physical
label. Each connector column has its own rows, including power, ground and NC.
Refresh categories in the calibrated layouts, then regenerate rows and audit:

```
node scripts/pinout-ingest.mjs --categories-only
node scripts/pinout-generate-rows.mjs
node scripts/pinout-filter-audit.mjs
```

The audit lists highlighted rows and every box's printed text/category for each
board, face and visible legend filter. Each generated box carries its printed
`text` and original corner radii for the client overlay. The audit checks complete,
accurate box text, box categories, combined labels,
row matches and complete face coverage. Structural checks cover multiple GPIO
or D-number boxes, cross-column or split label bands, vertical alignment, duplicate
ownership and unassigned printed labels. Empty artwork cells remain part of the
same horizontal band. Per-face counts identify structural issues. The 15 exact
SVG overprints on SAMD21 Plus back have a coordinate-specific artwork exception
and render once. Mismatches produce a nonzero exit status.
Use `--summary` for counts or `--json` for the full machine-readable report.
After a row mapping change, regenerate rows and proof sheets:

```
node scripts/pinout-generate-rows.mjs
node scripts/pinout-proof-sheet.mjs
```

The proof script overlays `id / silk / chip` on every face and writes PNGs to
`.trash/pinout-proof/`. `rows.failures.json` stays empty when every face maps.

Board data lives in `src/app/playground/pinout/data/`:

- `catalog.js` / `variants.js` / `boards/<id>.js` — the 23 boards, pin ids,
  silk, chip names and default buses.
- `functions.js` — thirteen function primers (I²C, SPI, UART, ADC, PWM, DAC,
  power, ground, reset, debug, battery, wireless, touch) plus per-board notes
  and Wiki links.
- `notes/<family>.js` — extra cautions keyed by chip name or pin id
  (`danger` / `caution` / `info`, English and Chinese).
- `alt/<family>.js` — spare functions for a chip pin (`adc`, `i2c`, `spi`,
  `uart`, `pwm`, `other`).
- `diagram/enrich.js` — attaches both official diagrams and merges notes /
  alt / pad index onto each pin.
- `schema.js` — pin kinds (`header` / `pad` / `onboard`), `notes`, `alt`,
  `padIndex`, and `validateBoard()`.
- `diagram/catalogMeta.js`, `diagram/rows.js`, `diagram/boardDiagrams.js` —
  marker order, row-id mappings and layout imports.

To add a pin note, put an entry in the matching `notes/<family>.js` `byChip`
or `byBoard[boardId]` table. To add a primer difference for one board, add a
key under `BOARD_FUNCTION_NOTES[boardId]` in `functions.js`.

Drop new vector exports into `public/xiao-products/pinout/` (or run
`node scripts/pinout-ingest.mjs` to normalize Chinese filenames, compress
embedded photos and write layout modules), then generate rows and proof
sheets as above.

Run `node --test src/app/pinout-page.test.mjs` to check all twenty-three
boards, both diagram faces, primers, notes, alt keys and the two-face view.


## Hardware Resources

`/res/` is the hardware file shelf. The page opens on one navy hero: the title
and its intro sit on top, then a thin rule and a glass panel hold the XIAO
Design Kit (`DesignKit.js`), the two series-wide KiCad libraries, footprints
and schematic symbols, side by side under a one-line heading. The hero ends
in rounded bottom corners, and below it the files are
laid out like a file browser across the full page width (up to 1800px). A sticky board list on the left groups every
XIAO board by chip family with its product photo and file count. The main
column opens with the selected board's profile (photo, intro, badges, search
across every board, and links to the interactive pinout, Wiki and store), then
lists its files under Hardware Design, Mechanical Design, Software & Tools and
Others. A separate full-width Learn & Build band closes the page: a featured ebook card, then a
grid of courses, community projects and the official YouTube channel. Every
cover is shown whole at its own aspect ratio on a 4:3 stage, with a blurred
copy of the same image filling the background; each card's tag names the
boards it covers, and PDF-based items use a baked first page as their cover. The
right-hand rail follows the page introduction, shared design kit, selected board
and learning section, using each section's current heading.
Below 1100px the board list becomes family tabs plus a row of board chips; on
phones each file card turns into a compact row and the learn cards scroll
sideways.

Every card carries a real thumbnail when one can be produced: PDF first pages
(WebP), DXF and KiCad drawings (SVG), the first rows of a pinout spreadsheet
(SVG), or the 3D render images. Files that have no visual use one of four
shared category covers for design files, mechanical files, firmware and
developer guides. Each cover uses a subtle looped motion and becomes static
when the system requests reduced motion. Clicking the thumbnail runs the card's primary
action; the two small round buttons at the bottom are preview (eye) and
download, or open for external links. The interactive pinout is reached from
the board profile.

Preview opens a near-fullscreen dialog. PDFs use the browser's own viewer.
DXF and KiCad projects download that one file and draw it in the page with a
Fit / 2x zoom toggle. Pinout spreadsheets are parsed in the browser by
`src/lib/parseXlsx.js` (shared strings, inline text, numbers and merged cells)
and shown as a table with a sticky header and first column, one tab per sheet.
STEP enclosures ask before loading the 3D viewer (about 8 MB). Nothing heavy
loads until a preview is opened.

Thumbnails are generated ahead of time into `public/res-thumb/` and listed in
`src/app/res/res-thumbs.generated.mjs`, so the page never requests a missing
image. Refresh them after resource URLs change:

```bash
npm run bake:res-thumbs
```

Drawings and spreadsheets are rendered by the in-repo DXF, KiCad and XLSX
parsers. PDF first pages are
rendered by pdf.js inside a locally installed Chrome; set `CHROME_PATH` to point
at a different browser, or use `BAKE_ONLY=pdf` / `BAKE_ONLY=drawings` to
refresh one kind. PDFs hosted on sites that block cross-origin reads are
skipped and keep their illustration. The command is not part of
`npm run build`; the production build does not download files. Run
`node --test src/app/res/resources-data.test.mjs src/lib/parseDxf.test.mjs
src/lib/parseXlsx.test.mjs src/app/tool-pages-typography.test.mjs` to check
the catalog, thumbnail naming, the drawing frame, the spreadsheet reader and
the shared type roles.


## Section Navigation

The shared right-hand section navigation uses the rendered headings as its label
source, including hero artwork's accessible title. Language changes and board
selection update the labels automatically. `src/app/section-directory.mjs`
defines the ordered anchors for pages with a rail; only existing anchors with
headings are displayed. Full titles appear on hover or keyboard focus.

## Software Ecosystem

`/software-center/` opens with the shared tool-page introduction, followed by
two sections. Act one is six numbered
chapter panels — Home Assistant Discovery, XIAO Zephyr Assistant, Seeed GFX2,
XIAO ESPHome Projects, MicroPython for XIAO, and SenseCraft AI. Each panel
explains the intended use, the problem it addresses and the value it brings,
paired with a light, illustrated animation whose footer
carries the project's status badges; below them three step cards, capability
chips, a boards line and the action buttons span the panel. Each ten-second
loop uses real XIAO artwork to show a software action and its hardware result.
The MP4 loads on viewport entry, loops silently, resets on exit and replays
on return. A small pause control preserves the reader's choice across scrolling.
Hidden browser tabs pause playback; reduced motion or a media error shows a
static WebP poster. Media lives in `public/software-animations/`, with editable
sources and export instructions in `design/software-loops/`. Act two
is the community wall: two continuous logo rows and three task-oriented filters —
Code & Prototype, Connect & Cloud, and Apps & AI. These combine the original
nine categories while preserving every platform and its supported-board links.
Each filter includes a short guide to the tools it contains. Detail pages stay
at `/software-center/[slug]/`.

The logo rows measure their visible width and repeat the logo sequence until
each loop half fills that width. Two identical halves join with equal spacing,
at a constant speed of 28 and 25 pixels per second. Hover or keyboard focus
pauses the rows; reduced motion displays a static, deduplicated logo grid.
Run `node --test src/app/software-center/community-wall.test.mjs` to verify
category coverage and continuous loop coverage from phone to ultrawide screens.

The Pinout, Web Flasher, Hardware Resources and Software Ecosystem pages share
`ToolPageIntro`: a centered title with the same responsive top spacing and
64px clearance for the fixed navigation. The title container accommodates
the Web Flasher name on one line on desktop screens.

Story copy lives in `src/app/software-center/official-stories.mjs`. Check it
with:

```bash
node --test src/app/software-center/official-stories.test.mjs src/app/software-center/story-playback.test.mjs src/app/tool-pages-typography.test.mjs
```

## Playground ESP32 Web Flasher

`/playground/esp-flasher/` is the XIAO ESP32 Series Web Flasher: a two-column
workbench sized to the viewport. Three connected steps run top to bottom in
the left column, and a serial monitor keeps the right column for the whole
session. A vertical progress rail shows which step is current and which steps
are complete. Each column scrolls on its own, so the monitor remains available.
Below 1160px the columns stack and the monitor keeps a fixed height; on short
desktop screens the monitor caption folds away to give the steps more room.
The shared centered introduction keeps the same title position as the other
Playground tools, with a minimum workbench height for comfortable operation.

A banner above the workbench points Home Assistant users to the Seeed Home
Assistant flasher. Connection state lives only in the serial monitor; the page
shows a browser warning only when Web Serial is unavailable.

The three steps are connect, choose firmware and flash:

1. **Connect** opens the browser serial picker, detects the chip through
   esptool-js, selects the matching XIAO model and shows its chip description,
   MAC and port state. A collapsible "Trouble connecting?" block carries the
   cable, BOOT-button and USB-port tips.
2. **Choose firmware** lists the verified official images for the detected
   board and accepts one or more local `.bin` files by drop or file picker.
   Every local file has one editable hexadecimal flash address. The page
   suggests `0x0` for complete merged images and bootloaders, `0x8000` for
   partition tables, `0xe000` for `boot_app0`, and `0x10000` for application
   images.
3. **Flash** downloads and verifies the selected package before changing the
   device, writes each declared region, verifies the device contents, resets
   the board and restores the serial monitor. The progress bar names each stage.

The official firmware catalog lives at `public/firmware/catalog.json`. Each
published entry points to a versioned manifest beside its binary. A manifest
declares the board and chip family, image parts and offsets, size, SHA-256, MD5,
flash settings, image completeness and erase policy. The loader displays only
`published` entries; the same contract already accepts `official`, `partner`
and `community` groups plus `draft`, `approved` and `published` review states.
This is the integration boundary for a future reviewed community catalog.
An optional `globalThis.XiaoFirmwareInstallStats` adapter can provide
`beginInstall(metadata)` and `completeInstall(token)` methods; the flasher calls
it only for a successful built-in package flow, and analytics failures stay
independent from device flashing.

The built-in Blink packages are complete merged images written from `0x0`.
Each package contains the bootloader, partition table, boot app and application
from one Arduino build. Their manifests use the `full` erase policy, so both
the standard flash action and the whole-flash **Erase & flash** recovery action
are available. The original application image is kept beside each merged image
as a development artifact at its `0x10000` application offset.

Local firmware uses one file-and-address workflow without asking the user to
classify the image. Multiple `.bin` files can be added in one or several picks,
and every suggested address remains editable. After a board is connected,
**Import XIAO bootloader** downloads the verified official merged image for that
exact XIAO model and extracts its bootloader, partition table and `boot_app0`
startup regions into the local package. Existing user-added files remain in
place. Importing again replaces only the earlier imported startup regions.

The page rejects missing, invalid or overlapping address ranges before opening
the serial port for flashing. Local packages preserve the rest of the flash.
Whole-flash erase is available for either one recognized complete merged image
at `0x0`, or a complete multi-file package containing regions at `0x0`,
`0x8000`, `0xe000` and `0x10000`.

The monitor owns the serial port whenever the flasher does not. After chip
detection and after a successful write the page releases DTR, pulses RTS and
returns both control lines to their idle state so the board boots its
application. Restart and reconnect are first-class states rather than
disconnect errors. The page waits up to ten seconds for USB re-enumeration,
resolves the authorized port again by USB vendor and product id, and reopens
the monitor at the selected baud rate. The Reset device action sends the same
RTS reset and uses the same reconnect path.

Every device connection refreshes the published catalog and manifests, so an
already-open browser tab moves to the current firmware version before flashing.
The browser loader also applies Espressif's corrected SPI register base for
ESP32-C5 and ESP32-C6 while that upstream fix is awaiting a packaged release.

Every line is timestamped and tagged as page event, flasher output, device
output, success or error. The header carries connection state, the baud selector
and the listen, reset, copy, download and clear buttons; the footer keeps line
count and the auto-scroll switch. Copied and downloaded transcripts start with a
header holding the browser user agent, selected board, detected chip and MAC,
firmware and monitor baud, which is what support needs to read a session.

Firmware images live in `firmware/<board>/` with a serving copy in
`public/firmware/<board>/`. The current official packages were generated with
Arduino CLI 1.4.1 and ESP32 core 3.3.11. Add a manifest beside the serving copy,
calculate its size, SHA-256 and MD5, then add a `published` catalog entry. Run
`npm run test:flasher` to verify the catalog, manifests and binary hashes.

### Verification

Web Serial needs desktop Chrome or Edge over HTTPS or `localhost`. With the
preview running, open `http://localhost:3000/XIAO_Landing_Page/playground/esp-flasher/`:

1. Check the page title reads XIAO ESP32 Series Web Flasher, Connect and the
   flash actions are compact, and
   the Home Assistant banner is visible. The serial monitor shows Not
   connected; there is no Web Serial ready badge in the top-right.
2. Drop or add one or more `.bin` files in the local firmware area: the local
   package becomes active, one editable address appears after every file, and
   timestamped lines record every filename and size. Confirm a complete merged
   image starts at `0x0`, a normal application image starts at `0x10000`, and
   invalid or overlapping address ranges appear in red and block flashing.
3. With a XIAO ESP board attached, press Connect: the log records chip
   detection, the matching official firmware appears, the facts list fills with
   board, chip and MAC, and the monitor switches to Listening.
4. Add an application BIN, then select **Import XIAO bootloader**. Confirm the
   detected model's bootloader, partition table and `boot_app0` appear at
   `0x0`, `0x8000` and `0xe000`, while the application remains at `0x10000`.
   Both Flash firmware and Erase & flash are now available.
5. Press Erase & flash: the log reports download verification, whole-flash
   erase, device write verification, restart and reconnect; the progress bar
   reaches 100% and the board's boot output continues in the same log.
6. Press Reset device and confirm the state moves through Restarting and
   Reconnecting before returning to Listening.
7. Press Copy and Download and confirm the transcript header carries
   browser, board, chip, firmware and baud.

## Project Hub Featured Projects

The Featured Projects section randomly selects **7** builds from the same Home
`PROJECTS` catalog (`home-content.generated.json`, 48 items). Each page load
reshuffles the set—no manual curation. The section is an editorial spread that
fills the content width in three areas: the stage picture (5/12) shows the
selected project whole (`object-fit: contain`) over a blurred copy of itself;
the stage copy (3/12) carries tag, board, date, title, excerpt, author and the
single `home-primary-cta` view action; the numbered index (4/12) lists all
seven projects with thumbnail, title and board. Hovering, focusing or clicking
an index row swaps the stage. Below 1200px the index becomes a three-per-row
strip under the stage; below 760px everything stacks in one column.

With the preview running, open
`http://localhost:3000/XIAO_Landing_Page/project-hub/` and refresh a few times
to confirm the seven projects change. Run:

```bash
node --test src/app/project-hub-featured.test.mjs src/app/project-hub-typography.test.mjs src/app/project-hub-side-nav.test.mjs
```

## Project Hub collection embed

The **Explore every project** block embeds the live
[OSHW XIAO Series](https://seeed-studio.github.io/OSHW-XIAO-Series/) hub.
At `npm run dev` / `npm run build`, `scripts/bake-project-hub-embed.js` fetches
that page into `public/project-hub-embed.html` (gitignored), injects a `<base>`
so remote assets still load, pins the likes config URL to the remote hub (the
hub script’s `new URL(..., location.href)` would otherwise miss under our
origin), hides the remote header and the yellow likes-status banner, and posts
height updates so the iframe grows with its content. Manual refresh:
`npm run bake:hub`.

On `localhost`, the likes Worker may still refuse our Origin; browsing and
filters keep working. On the GitHub Pages deploy (`seeed-studio.github.io`)
the same Origin is allowed, so like counts work after the config pin.

## Open Roadmap

The Open Roadmap page
(`http://localhost:3000/XIAO_Landing_Page/open-roadmap/`) shows a four-column
board that mirrors the GitHub Discussions lifecycle in
[OSHW-XIAO-Series](https://github.com/Seeed-Studio/OSHW-XIAO-Series/discussions):

| Board column | GitHub category |
| --- | --- |
| Wish List | Wish List |
| Open for Vote | Open for Vote |
| In Development | In Development |
| Accomplished | Accomplished |

Help Needed sits in a separate rail under the board. Each card is a soft
floating link to its GitHub discussion: optional thumbnail (first valid image
in the post; videos and non-images are skipped), title, excerpt, topic chips,
status badges (`Seeed replied` / `Answered` / `Closed` when applicable),
participant avatar stack, reaction breakdown, last-activity time, and comment
count. Cards are sorted automatically by votes, then participant count, then
last activity—no hand-curated order.

At build time (`prebuild`), `scripts/bake-discussions.js` fetches discussions
into `public/open-roadmap/discussions.json`. With `GH_TOKEN` / `GITHUB_TOKEN`
the script uses GraphQL for exact upvote counts and nested comments; without a
token it falls back to the REST discussions API (votes ≈ positive reactions)
plus one comments request per discussion (~40 requests total, within the
anonymous GitHub rate limit). CI injects `GH_ROADMAP_TOKEN` and redeploys on a
six-hour schedule. Local refresh:

```bash
GH_TOKEN=<pat> node scripts/bake-discussions.js
```

Category → column and topic-label mappings live in the bake script. Unknown
categories or labels are reported in the build log so new GitHub taxonomy can
be wired without hunting through the board.
Above the board, an announcement thread presents
[Discussion #1](https://github.com/Seeed-Studio/OSHW-XIAO-Series/discussions/1)
with Seeed Studio's opening post, four team welcome notes written for the page,
and three curated community replies. Bilingual copy and source metadata live in
`src/app/open-roadmap/announcement-thread.mjs`. Team notes display a badge and
role, and their **Reply** links open the discussion. Community replies retain
their original comment links, dates, and counts. Replies use a compact two-column
grid on wide screens and a single column on mobile. The board starts with the
remaining discussions.

Below the board, **Success Stories** (`src/app/open-roadmap/successCases.js`)
closes the loop as "Stage 04 · Shipped": each story card pairs the original
community idea (quote, author, votes, participants) with the shipped product,
and a four-dot timeline (Wish / Vote / Build / Ship) coloured like the board
columns. Story copy currently lives in the `STORIES` array in that file.

The right-side section rail starts with **Top** on every page (Home, Products,
Resources, Project Hub, Open Roadmap, Software Center), in both EN and ZH.
On Project Hub the remaining labels match the on-page titles
(`Featured Projects` / `Explore every project`, and the Chinese equivalents).
The `top` anchor lives on the hero only, so the active rail item tracks the
section under the viewport focus band.

The Newsletter field retains its compact 576px maximum width, small vertical
padding and 20px envelope icon. Its 16px mobile input size prevents automatic
zoom in touch browsers, while the description and Subscribe action follow the
shared Home body and action roles.

## Footer Width Verification

The five footer groups use a balanced 1800px maximum width instead of the previous
1440px content cap. Edge padding grows from 24px on phones to a maximum of 128px
on wide displays. Vertical padding grows from 64px on phones to 80px on desktop,
while the existing five-column proportions remain.

Open the bottom of the Home page at desktop and 2520px ultrawide sizes. The
brand and subscription groups should use more of the side regions while retaining
comfortable outer margins, and the three navigation groups should remain evenly spaced.
At tablet and phone widths, confirm the existing two-column and stacked layouts.
Run `node --test src/app/site-footer.test.mjs` for the width regression check.

## Partner Network Verification

The three categories contain 6 hardware, 8 software/framework and 7 content/community
entries. Display names use the reviewed public brands, including STMicroelectronics,
Nordic Semiconductor, Espressif Systems, Microchip Technology, Hackster.io,
CNX Software, Adafruit Industries, SparkFun Electronics and DigiKey.
EDGE AI FOUNDATION uses its current official website and logo. Long names stack
below their icons inside the existing equal-width slots.

Run `node --test src/app/partner-marquee.test.mjs` to check category coverage,
per-brand display bounds, identical loop halves, and accessible motion states.
With `npm run dev` running, open `http://localhost:3000/XIAO_Landing_Page/#developer`.
Each category has a fixed label and an edge-faded strip of equal-width logo slots.
Original artwork keeps its proportions, with per-brand display sizes in
`src/app/partner-marquee-layout.mjs`. The strips move at 24 pixels per second and
pause on hover. Scroll away and return to replay. At mobile widths the labels
sit above their strips. Keyboard focus or reduced motion exposes one stationary,
wrapping list with every original partner link available. Check both languages,
the end-to-start seam, image loading, and keyboard navigation before delivery.

## Roadmap Invitation Verification

The English invitation reads "Developers, join us and shape the next XIAO!";
the Chinese version carries the same collaborative product-development meaning.
Run `node --test src/app/display-copy.test.mjs` to verify this copy, the
"XIAO Dev Boards" category title and the complete nRF54LM20A pinout labels.

Run `node --test src/app/typewriter-animation.test.mjs` to verify progressive
typing, replay, cancellation, reduced-motion completion, and Unicode handling.
With `npm run dev` running, open `http://localhost:3000/XIAO_Landing_Page/#roadmap`.
The invitation types over 3.5 seconds inside a single shaded message field.
Scroll away and return to replay it, then switch languages and repeat at mobile
width. The field reserves space for the complete sentence while typing.
The Join Now button scales down while pressed and opens the in-site roadmap.
With the system's reduced-motion preference enabled, the sentence appears in
full and the button stays stationary.

## Language Toggle Verification

Run `node --test src/app/site-header.test.mjs` to check the shared dimensions
and label alignment. With `npm run dev` running, switch between Chinese and
English in the header at desktop and mobile widths. Both options should stay
44 by 24 pixels, with centered labels and the selected background following
the active language.

## Newsletter Readability Verification

Run the text contrast regression test with Node.js:

```bash
node --test src/app/newsletter-contrast.test.mjs
```

The test checks the desktop text-column and mobile overlay colors against a
white photo pixel, with a minimum text contrast of 4.5:1. With `npm run dev`
running, open `http://localhost:3000/XIAO_Landing_Page/#edm` and check English
and Chinese at desktop and mobile widths. The heading, description, consent
copy, and email field should remain distinct from the photo. Submit an empty
email or `invalid-email` to check the inline validation message locally.

## Marketing analytics

All buttons, navigation links, CTA links, and same-origin iframe controls emit a `xiao_click` event. Configure one of the following public environment variables at build time:

```bash
# Preferred: configure GA4 inside this GTM container
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Or connect GA4 directly when GTM is not used
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Events include the interaction label and type, section, destination, page path, language, frame title, outbound/new-tab flags, and UTM attribution. Use `data-track-id`, `data-track-label`, or `data-track-section` when a control needs a fixed reporting name; add `data-track-ignore` to exclude a sensitive control. No form values or user-entered text are collected.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
