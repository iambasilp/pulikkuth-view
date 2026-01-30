# CustomerConnect Dashboard

A professional, static-generated customer management dashboard. Optimized for "Serverless" deployment (no backend required).

## Features
- **Static Data Store**: 100 pre-generated mock records in `data.js`.
- **Filtering & Search**: Instant client-side filtering by Route, Category, and Name.
- **Enterprise UI**: Dark mode "Slate/Indigo" aesthetic with responsive sidebar.
- **Zero Backend**: Runs entirely in the browser.

## Deployment Instructions

Since this is a static website (HTML/CSS/JS), you can deploy it for free on any static hosting provider.

### Option 1: Netlify (Recommended)
1. Go to [Netlify Drop](https://app.netlify.com/drop).
2. Drag and drop the `Customer-view` folder onto the page.
3. Your site will be live instantly!

### Option 2: Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` inside this folder.
3. Follow the prompts (Keep default settings).

### Option 3: GitHub Pages
1. Push this code to a GitHub repository.
2. Go to Settings > Pages.
3. Select `main` branch and `/` root.
4. Save.

## Customization
To update the data, simply edit `data.js`. The format is a standard JSON array.
