# Xperience Studios

Marketing site for Xperience Studios — a UX/UI & business design consultancy.

Single-page, static site. No build step: React, GSAP, and Babel are loaded via CDN
and JSX is compiled in-browser, so `index.html` is the entire deployable app.

## Local preview

Open `index.html` directly in a browser, or serve it locally:

```bash
npx serve .
```

## Deploy

Deploys as a static site on Vercel — no framework preset needed, `vercel.json`
routes everything to `index.html`.
