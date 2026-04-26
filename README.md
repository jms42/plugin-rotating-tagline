# plugin-rotating-tagline

An [EmDash CMS](https://github.com/emdash-cms/emdash) plugin that rotates your site tagline from a configurable list.

## Installation

```bash
npm install plugin-rotating-tagline
```

Register the plugin in your `astro.config.mjs`:

```ts
import { rotatingTaglinePlugin } from "plugin-rotating-tagline";

export default defineConfig({
  integrations: [
    emdash({
      plugins: [rotatingTaglinePlugin()],
    }),
  ],
});
```

## Configuration

Once installed, go to **Plugins → Rotating Tagline → Settings** in the EmDash admin panel.

| Setting | Description | Default |
|---|---|---|
| **Taglines** | One tagline per line | _(empty)_ |
| **Rotation Mode** | `Random` or `Sequential` | Random |

**Sequential** mode cycles through taglines in order, tracking position across requests. **Random** picks one on each page load.

## Using the Tagline in Your Theme

### Meta tag (all pages)

EmDash injects `<meta name="tagline" content="...">` into every page's `<head>` automatically, as long as your template includes `<EmDashHead />`.

Read it in JavaScript with:

```js
const tagline = document.querySelector('meta[name="tagline"]')?.content;
```

### API route

Fetch the current tagline directly (useful for server-side rendering or client-side hydration):

```ts
const res = await fetch("/_emdash/api/plugins/rotating-tagline/current");
const { tagline } = await res.json();
```

## Verifying It Works

After adding at least one tagline in Settings:

1. **API route** — visit `/_emdash/api/plugins/rotating-tagline/current` in your browser; you should see `{"tagline":"..."}`.
2. **Meta tag** — view source on any page that includes `<EmDashHead />`; look for `<meta name="tagline" content="...">` in `<head>`.

## License

MIT
