# Icebox Rentals

Marketing site and quote form for Icebox Rentals (ice machine rentals, Surrey & Metro Vancouver). Built with Vite, React 18 and TypeScript.

## Develop

```sh
npm install
npm run dev        # local dev server
npm run typecheck  # type check only
npm run build      # type check + production build to dist/
```

## Structure

- `src/App.tsx` — page sections
- `src/QuoteSheet.tsx` — quote request form
- `src/data.ts` — site content and the `trackEvent` / `submitLead` hooks (console stubs until wired to a backend)
- `public/assets/` — images

Placeholders still to fill in: service area list (`src/data.ts`) and phone, email, URL and price range in the JSON-LD block in `index.html`.

## Deploy

Hosted on Vercel at https://icebox-rentals.vercel.app/. Deploy with `vercel --prod`, or connect this repo in the Vercel project settings for deploys on push.
