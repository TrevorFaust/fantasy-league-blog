# Fantasy League Blog (Practice Squad Rankings)

Commissioner power rankings for the Seattle fantasy league — migrated off Wix.

## Dev

```bash
npm install
npm run dev
```

## Content

- Source of truth: `src/content/site.json`
- Rebuild from a fresh Wix scrape: `npm run scrape && npm run content`

## Safe mode

Toggle in the header, or open any page with `?safe=1` to censor swears / the league nickname.
