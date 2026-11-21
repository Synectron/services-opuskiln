# RKN Punjabi Soya Chaap

Mobile-first site for **RKN Punjabi Soya Chaap**, a pure-vegetarian counter at Shani Mandir Chauraha, Naini, Prayagraj. Guests browse the printed menu, switch half and full prices, and send the order to WhatsApp.

## Run locally

```bash
npm install
npm run dev
```

The dev server listens on [http://127.0.0.1:4327](http://127.0.0.1:4327).

```bash
npm test
npm run build
npm run preview
```

`npm run build` writes a static site to `dist/`. Host that folder on any static host (Netlify, Cloudflare Pages, GitHub Pages, or `npx serve dist`).

## What to edit

- Menu names and prices: `src/data/menu.ts`
- Phone, address, hours, Zomato and Swiggy links, free-delivery amount: `src/data/site.ts`
- English and Hindi interface copy: `src/data/i18n.ts`

Zomato and Swiggy buttons currently open the Prayagraj (Allahabad) city pages. Replace `zomato` and `swiggy` in `src/data/site.ts` with the outlet URLs when the owner shares them.

Hours (10 am – 11 pm) come from the public listing, not the printed card. The PIN code 211008 is from the same listing.

## Photos

Food photos are self-hosted WebP files from Wikimedia Commons (resized). Credits are in the footer. Do not hotlink new images.
