# Fantasy League Blog (Practice Squad Rankings)

Commissioner power rankings for the Seattle fantasy league — migrated off Wix.

## Dev

```bash
npm install
npm run dev
```

## Content

- Historical seasons: `src/content/site.json` (rebuilt from the Wix scrape)
- Current season (2026): `src/content/live.json`
- Rebuild historical content from a fresh scrape: `npm run scrape && npm run content`

## Safe mode

Toggle in the header, or open any page with `?safe=1` to censor swears / the league nickname.
