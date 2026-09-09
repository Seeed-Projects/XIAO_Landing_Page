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
