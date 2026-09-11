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
The Explore action opens the XIAO Products page.
Desktop layouts keep the copy in the image's dark left region, while phone
layouts preserve a roughly three-quarter-screen hero and scale the type and
button to remain readable above the product lineup.

With the existing dependencies installed, run `npm run dev -- --port 3000` and
open `http://localhost:3000/XIAO_Landing_Page/#hero`. At desktop and 390px phone
widths, confirm the complete title, two-line description and green Explore
button remain visible without horizontal overflow. Click Explore and expect the
browser to open `http://localhost:3000/XIAO_Landing_Page/products/`. Run
`node --test src/app/home-carousel.test.mjs` for the content,
destination and responsive-layout regression checks.

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

## Newsletter Typography Verification

The Newsletter description and email input use the same responsive type scale
as the News introduction: 16px by default and 18px from the small breakpoint.
The email field uses the description's 576px maximum width, compact vertical
padding and a 20px envelope icon. The primary action uses a 200px minimum width,
compact vertical padding and the same responsive 16px/18px type scale.
Open `http://localhost:3000/XIAO_Landing_Page/#edm`, switch both languages and
compare the description and input placeholder with the News introduction above.
Run `node --test src/app/newsletter-contrast.test.mjs` to verify the shared scale.

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
