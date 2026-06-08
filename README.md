# GymTribe Public

Landing page and public data for [GymTribe](https://github.com/chipp972/gymtribe-public) — a mobile fitness app for workout tracking, nutrition logging, and structured training programs.

## Contents

| Path | Description |
|---|---|
| `index.html` / `styles.css` | Landing page (served via GitHub Pages) |
| `data/program-templates/` | Workout program templates (manifest + zip bundles) |
| `data/seeds/` | Exercise, food, muscle group, and equipment reference data |

## Data API

All files are accessible via the GitHub raw CDN — no authentication required.

**Base URL:** `https://raw.githubusercontent.com/chipp972/gymtribe-public/main/`

### Program Templates

| File | URL |
|---|---|
| Manifest | `data/program-templates/manifest.json` |
| 5/3/1 Wendler | `data/program-templates/531.gymtribe.zip` |
| Push Pull Legs | `data/program-templates/ppl.gymtribe.zip` |
| Upper/Lower | `data/program-templates/upper-lower.gymtribe.zip` |
| Booty/Upper/Lower | `data/program-templates/booty-upper-lower.gymtribe.zip` |
| StrongLifts 5×5 | `data/program-templates/5x5.gymtribe.zip` |

### Seed Data

| Dataset | English | French |
|---|---|---|
| Exercises (59 entries) | `data/seeds/en-exercises-basics.json` | `data/seeds/fr-exercises-basics.json` |
| Foods (68 entries) | `data/seeds/en-foods-basics.json` | `data/seeds/fr-foods-basics.json` |
| Muscle groups | `data/seeds/en-muscles-basics.json` | `data/seeds/fr-muscles-basics.json` |
| Equipment | `data/seeds/en-equipment-basics.json` | `data/seeds/fr-equipment-basics.json` |

### Example

```bash
curl https://raw.githubusercontent.com/chipp972/gymtribe-public/main/data/program-templates/manifest.json
```

## License

Data files (exercises, foods, muscles, equipment) are released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Program templates are © GymTribe.
