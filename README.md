# GymTribe Public

Landing page and public data for [GymTribe](https://github.com/chipp972/gymtribe-public) — a mobile fitness app for workout tracking, nutrition logging, and structured training programs.

## Contents

| Path | Description |
|---|---|
| `index.html` / `styles.css` | Landing page (served via GitHub Pages) |
| `source/` | Source data — one folder/file per catalog type, built into manifests via `npm run build` |
| `scripts/build.js` | Build pipeline — regenerates every `source/*/manifest.json` |

## Data API

All files are accessible via the GitHub raw CDN — no authentication required.

**Base URL:** `https://raw.githubusercontent.com/chipp972/gymtribe-public/master/`

| Dataset | URL |
|---|---|
| Exercises manifest | `source/exercises/manifest.json` |
| Foods manifest | `source/foods/manifest.json` |
| Equipment manifest | `source/equipment/manifest.json` |
| Muscle groups manifest | `source/muscles/manifest.json` |
| Recipes manifest | `source/recipes/manifest.json` |
| Program templates manifest | `source/program-templates/manifest.json` (each entry has a `jsonUrl` to its full `index.json`) |
| Archetypes manifest | `source/archetypes/manifest.json` (each entry lists `moveIds` resolved against the exercises manifest) |
| Diet profiles manifest | `source/profiles/manifest.json` (each entry lists `foodIds`/`recipeIds` resolved against the foods/recipes manifests) |

### Example

```bash
curl https://raw.githubusercontent.com/chipp972/gymtribe-public/master/source/exercises/manifest.json
```

## License

Data files (exercises, foods, muscles, equipment, recipes) are released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Program templates are © GymTribe.
