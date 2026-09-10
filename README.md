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

The Home Playground section pairs a wide original pinout illustration with four
direct tool links. Its icons are shared with the Playground landing page.
Display lighting starts when the illustration enters the viewport and restarts
after leaving and returning. Reduced motion keeps the illustration stationary.

With the existing dependencies installed, run `npm run dev -- --port 3000` and
open `http://localhost:3000/XIAO_Landing_Page/#playground`. Verify the heading
above the two-column desktop layout, stacked mobile content, both languages,
and each tool destination. At 1216px, the original artwork displays at roughly
694px wide. Hover or focus tool links to see their subtle feedback. Scroll away
and return to replay the lighting. The image caption describes the preview; the
Pinout entry in the tool list opens the interactive tool, while the bottom button
opens the Playground overview. Run `node --test src/app/playground-section.test.mjs`
and `npm run build` for automated checks. Use Ctrl+C in the dev terminal to stop
the preview manually.

## Partner Network Verification

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
