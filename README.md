# plugin-rotating-tagline

An [EmDash CMS](https://github.com/emdash-cms/emdash) plugin that rotates your site tagline from a configurable list of lines.

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

The plugin makes the current tagline available three ways:

### 1. Meta tag (all pages)

EmDash injects `<meta name="tagline" content="...">` into every page's `<head>` automatically, as long as your template includes `<EmDashHead />`.

### 2. JavaScript global

```js
const tagline = window.EMDASH_TAGLINE;
```

Set in a `<script>` in `<head>` before your page renders. Useful for client-side frameworks.

### 3. API route

```ts
// In an Astro component
const res = await fetch("/_emdash/api/plugins/rotating-tagline/current");
const { tagline } = await res.json();
```

## License

MIT
