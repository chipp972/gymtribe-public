#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'source');
const DATA = path.join(ROOT, 'data');
const CDN_BASE = 'https://raw.githubusercontent.com/chipp972/gymtribe-public/master';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Exercises: write manifest to data/exercises/manifest.json, no per-item zips
function buildExercises() {
  const srcDir = path.join(SOURCE, 'exercises');
  const outDir = path.join(DATA, 'exercises');
  fs.mkdirSync(outDir, { recursive: true });

  if (!fs.existsSync(srcDir)) {
    console.warn('  [exercises] source/exercises/ not found — skipping');
    return;
  }

  const manifestEntries = [];

  for (const id of fs.readdirSync(srcDir).sort()) {
    const exerciseDir = path.join(srcDir, id);
    if (!fs.statSync(exerciseDir).isDirectory()) continue;

    const indexPath = path.join(exerciseDir, 'index.json');
    if (!fs.existsSync(indexPath)) {
      console.warn(`  [exercises] ${id}/index.json missing — skipping`);
      continue;
    }

    const meta = readJson(indexPath);

    const VIDEO_EXTS = new Set(['.mp4', '.mov', '.avi', '.webm']);
    const mediaDir = path.join(exerciseDir, 'media');
    let exerciseMedia = {};
    if (fs.existsSync(mediaDir)) {
      const mediaFiles = fs.readdirSync(mediaDir).filter((f) => !f.startsWith('.'));
      if (mediaFiles.length > 0) {
        const mediaFile = mediaFiles[0];
        const ext = path.extname(mediaFile).toLowerCase();
        exerciseMedia = {
          mediaUri: `${CDN_BASE}/source/exercises/${id}/media/${mediaFile}`,
          mediaType: VIDEO_EXTS.has(ext) ? 'video' : 'image',
        };
      }
    }

    const notesPath = path.join(exerciseDir, 'notes.json');
    let notes = [];
    if (fs.existsSync(notesPath)) {
      const { notes: raw = [] } = readJson(notesPath);
      notes = raw.map((n) => ({
        ...n,
        mediaUri: n.mediaUri
          ? `${CDN_BASE}/source/exercises/${id}/${n.mediaUri}`
          : undefined,
      }));
    }

    manifestEntries.push({
      id,
      name: meta.name,
      muscles: meta.muscles,
      equipment: meta.equipment,
      ...exerciseMedia,
      ...(notes.length > 0 && { notes }),
    });
  }

  const manifest = { version: '1.0.0', exercises: manifestEntries };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`  [exercises] ${manifestEntries.length} exercises → data/exercises/manifest.json`);

  return manifest;
}

// Foods: write manifest to data/foods/manifest.json, no per-item zips
function buildFoods() {
  const srcDir = path.join(SOURCE, 'foods');
  const outDir = path.join(DATA, 'foods');
  fs.mkdirSync(outDir, { recursive: true });

  if (!fs.existsSync(srcDir)) {
    console.warn('  [foods] source/foods/ not found — skipping');
    return;
  }

  const manifestEntries = [];

  for (const id of fs.readdirSync(srcDir).sort()) {
    const foodDir = path.join(srcDir, id);
    if (!fs.statSync(foodDir).isDirectory()) continue;

    const indexPath = path.join(foodDir, 'index.json');
    if (!fs.existsSync(indexPath)) {
      console.warn(`  [foods] ${id}/index.json missing — skipping`);
      continue;
    }

    const meta = readJson(indexPath);
    manifestEntries.push({
      id,
      name: meta.name,
      type: meta.type,
      kcalPer100g: meta.kcalPer100g,
      protPer100g: meta.protPer100g,
      glucPer100g: meta.glucPer100g,
      lipPer100g: meta.lipPer100g,
      fiberPer100g: meta.fiberPer100g,
      alcPct: meta.alcPct,
      mediaUri: meta.mediaUri,
    });
  }

  const manifest = { version: '1.0.0', foods: manifestEntries };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`  [foods] ${manifestEntries.length} foods → data/foods/manifest.json`);

  return manifest;
}

// Equipment: write manifest to data/equipment/manifest.json, no per-item zips
function buildEquipment() {
  const srcDir = path.join(SOURCE, 'equipment');
  const outDir = path.join(DATA, 'equipment');
  fs.mkdirSync(outDir, { recursive: true });

  if (!fs.existsSync(srcDir)) {
    console.warn('  [equipment] source/equipment/ not found — skipping');
    return;
  }

  const manifestEntries = [];

  for (const id of fs.readdirSync(srcDir).sort()) {
    const equipDir = path.join(srcDir, id);
    if (!fs.statSync(equipDir).isDirectory()) continue;

    const indexPath = path.join(equipDir, 'index.json');
    if (!fs.existsSync(indexPath)) {
      console.warn(`  [equipment] ${id}/index.json missing — skipping`);
      continue;
    }

    const meta = readJson(indexPath);
    manifestEntries.push({
      id,
      name: meta.name,
      mediaUri: meta.imageUrl
        ? `${CDN_BASE}/source/equipment/${id}/${meta.imageUrl}`
        : undefined,
    });
  }

  const manifest = { version: '1.0.0', equipment: manifestEntries };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`  [equipment] ${manifestEntries.length} equipment items → data/equipment/manifest.json`);
}

// Muscles: write manifest to data/muscles/manifest.json, no zip
function buildMuscles() {
  const srcDir = path.join(SOURCE, 'muscles');
  const indexPath = path.join(srcDir, 'index.json');

  if (!fs.existsSync(indexPath)) {
    console.warn('  [muscles] source/muscles/index.json not found — skipping');
    return;
  }

  const data = readJson(indexPath);
  const items = Array.isArray(data) ? data : (data.muscles || []);
  const manifestEntries = items.map(({ id, name, mediaUri }) => ({
    id,
    name,
    ...(mediaUri && { mediaUri: `${CDN_BASE}/source/muscles/${mediaUri}` }),
  }));

  const outDir = path.join(DATA, 'muscles');
  fs.mkdirSync(outDir, { recursive: true });
  const manifest = { version: '1.0.0', muscles: manifestEntries };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`  [muscles] ${manifestEntries.length} muscles → data/muscles/manifest.json`);
}

// Recipes: write manifest to data/recipes/manifest.json, no per-item zips
function buildRecipes() {
  const srcDir = path.join(SOURCE, 'recipes');

  if (!fs.existsSync(srcDir)) {
    console.warn('  [recipes] source/recipes/ not found — skipping');
    return;
  }

  const foodsById = loadFoodsSource();
  const manifestEntries = [];

  for (const id of fs.readdirSync(srcDir).sort()) {
    const recipeDir = path.join(srcDir, id);
    if (!fs.statSync(recipeDir).isDirectory()) continue;

    const indexPath = path.join(recipeDir, 'index.json');
    if (!fs.existsSync(indexPath)) {
      console.warn(`  [recipes] ${id}/index.json missing — skipping`);
      continue;
    }

    const meta = readJson(indexPath);

    const ingredients = (meta.ingredients || [])
      .map(({ foodId, quantityG }) => {
        if (!foodsById[foodId]) {
          console.warn(`  [recipes] ${id}: ingredient food "${foodId}" not found — skipping`);
          return null;
        }
        return { foodId, quantityG };
      })
      .filter(Boolean);

    manifestEntries.push({
      id,
      name: meta.name,
      description: meta.description,
      ingredients,
      mediaUri: meta.mediaUri
        ? `${CDN_BASE}/source/recipes/${id}/${meta.mediaUri}`
        : undefined,
    });
  }

  const outDir = path.join(DATA, 'recipes');
  fs.mkdirSync(outDir, { recursive: true });
  const manifest = { version: '1.0.0', recipes: manifestEntries };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`  [recipes] ${manifestEntries.length} recipes → data/recipes/manifest.json`);
}

// Program templates: write manifest to data/program-templates/manifest.json, no zips needed (no media)
function buildProgramTemplates() {
  const srcDir = path.join(SOURCE, 'program-templates');

  if (!fs.existsSync(srcDir)) {
    console.warn('  [program-templates] source/program-templates/ not found — skipping');
    return;
  }

  const manifestEntries = [];

  for (const id of fs.readdirSync(srcDir).sort()) {
    const programDir = path.join(srcDir, id);
    if (!fs.statSync(programDir).isDirectory()) continue;

    const indexPath = path.join(programDir, 'index.json');
    if (!fs.existsSync(indexPath)) {
      console.warn(`  [program-templates] ${id}/index.json missing — skipping`);
      continue;
    }

    const meta = readJson(indexPath);

    const days = meta.days || [];
    const cycleLengthWeeks = days.length > 0
      ? Math.max(...days.map((d) => d.weekIndex)) + 1
      : 1;
    const daysPerCycle = days.length;

    manifestEntries.push({
      id: meta.id,
      name: meta.name,
      tags: meta.tags,
      description: meta.description,
      cycleLengthWeeks,
      daysPerCycle,
      jsonUrl: `${CDN_BASE}/source/program-templates/${id}/index.json`,
    });
  }

  const outDir = path.join(DATA, 'program-templates');
  fs.mkdirSync(outDir, { recursive: true });
  const manifest = { version: '2.0.0', templates: manifestEntries };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`  [program-templates] ${manifestEntries.length} templates → data/program-templates/manifest.json`);
}

// Helper: load all exercises source data indexed by id
function loadExercisesSource() {
  const srcDir = path.join(SOURCE, 'exercises');
  const byId = {};
  if (!fs.existsSync(srcDir)) return byId;
  for (const id of fs.readdirSync(srcDir)) {
    const indexPath = path.join(srcDir, id, 'index.json');
    if (!fs.existsSync(indexPath)) continue;
    const meta = readJson(indexPath);
    const notesPath = path.join(srcDir, id, 'notes.json');
    let notes = [];
    if (fs.existsSync(notesPath)) {
      const { notes: raw = [] } = readJson(notesPath);
      notes = raw.map((n) => ({
        title: n.title && (n.title.en || n.title),
        description: n.description && (n.description.en || n.description),
        url: n.url,
        num: n.num,
        mediaUri: n.mediaUri ? `${CDN_BASE}/source/exercises/${id}/${n.mediaUri}` : undefined,
        mediaType: n.mediaType,
      }));
    }
    byId[id] = { meta, notes };
  }
  return byId;
}

// Helper: load all foods source data indexed by id
function loadFoodsSource() {
  const srcDir = path.join(SOURCE, 'foods');
  const byId = {};
  if (!fs.existsSync(srcDir)) return byId;
  for (const id of fs.readdirSync(srcDir)) {
    const indexPath = path.join(srcDir, id, 'index.json');
    if (!fs.existsSync(indexPath)) continue;
    byId[id] = readJson(indexPath);
  }
  return byId;
}

// Helper: load all recipes source data indexed by id
function loadRecipesSource() {
  const srcDir = path.join(SOURCE, 'recipes');
  const byId = {};
  if (!fs.existsSync(srcDir)) return byId;
  for (const id of fs.readdirSync(srcDir)) {
    const indexPath = path.join(srcDir, id, 'index.json');
    if (!fs.existsSync(indexPath)) continue;
    byId[id] = readJson(indexPath);
  }
  return byId;
}

// Helper: return a Set of valid muscle IDs
function loadMusclesSource() {
  const indexPath = path.join(SOURCE, 'muscles', 'index.json');
  if (!fs.existsSync(indexPath)) return new Set();
  const data = readJson(indexPath);
  const items = Array.isArray(data) ? data : (data.muscles || []);
  return new Set(items.map((m) => m.id));
}

// Helper: return a Set of valid equipment IDs
function loadEquipmentSource() {
  const srcDir = path.join(SOURCE, 'equipment');
  const ids = new Set();
  if (!fs.existsSync(srcDir)) return ids;
  for (const id of fs.readdirSync(srcDir)) {
    const indexPath = path.join(srcDir, id, 'index.json');
    if (fs.existsSync(indexPath)) ids.add(id);
  }
  return ids;
}

// Archetypes: write manifest to source/archetypes/manifest.json — entries reference
// moveIds, which the app resolves against the exercises catalog at import time.
function buildArchetypes() {
  const configDir = path.join(SOURCE, 'archetypes');

  if (!fs.existsSync(configDir)) {
    console.warn('  [archetypes] source/archetypes/ not found — skipping');
    return;
  }

  const exercisesById = loadExercisesSource();
  const manifestEntries = [];

  for (const file of fs.readdirSync(configDir).sort()) {
    if (!file.endsWith('.json') || file === 'manifest.json') continue;
    const configPath = path.join(configDir, file);
    const config = readJson(configPath);
    const { id, name, description, tags } = config;

    const moveIds = (config.moveIds || []).filter((moveId) => {
      if (exercisesById[moveId]) return true;
      console.warn(`  [archetypes] ${id}: move "${moveId}" not found — skipping`);
      return false;
    });

    manifestEntries.push({ id, name, description, tags: tags || [], moveIds });
  }

  const outDir = path.join(DATA, 'archetypes');
  fs.mkdirSync(outDir, { recursive: true });
  const manifest = { version: '1.0.0', archetypes: manifestEntries };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`  [archetypes] ${manifestEntries.length} archetypes → data/archetypes/manifest.json`);
}

// Profiles: write manifest to source/profiles/manifest.json — entries reference
// foodIds/recipeIds, which the app resolves against the foods/recipes catalog at import time.
function buildProfiles() {
  const configDir = path.join(SOURCE, 'profiles');

  if (!fs.existsSync(configDir)) {
    console.warn('  [profiles] source/profiles/ not found — skipping');
    return;
  }

  const foodsById = loadFoodsSource();
  const recipesById = loadRecipesSource();
  const manifestEntries = [];

  for (const file of fs.readdirSync(configDir).sort()) {
    if (!file.endsWith('.json') || file === 'manifest.json') continue;
    const configPath = path.join(configDir, file);
    const config = readJson(configPath);
    const { id, name, description } = config;

    const foodIds = (config.foodIds || []).filter((foodId) => {
      if (foodsById[foodId]) return true;
      console.warn(`  [profiles] ${id}: food "${foodId}" not found — skipping`);
      return false;
    });

    const recipeIds = (config.recipeIds || []).filter((recipeId) => {
      if (recipesById[recipeId]) return true;
      console.warn(`  [profiles] ${id}: recipe "${recipeId}" not found — skipping`);
      return false;
    });

    manifestEntries.push({ id, name, description, foodIds, recipeIds });
  }

  const outDir = path.join(DATA, 'profiles');
  fs.mkdirSync(outDir, { recursive: true });
  const manifest = { version: '1.0.0', profiles: manifestEntries };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`  [profiles] ${manifestEntries.length} profiles → data/profiles/manifest.json`);
}

function checkCrossReferences() {
  const errors = [];

  const exercisesById = loadExercisesSource();
  const exerciseIds = new Set(Object.keys(exercisesById));
  const foodIds = new Set(Object.keys(loadFoodsSource()));
  const recipeIds = new Set(Object.keys(loadRecipesSource()));
  const muscleIds = loadMusclesSource();
  const equipIds = loadEquipmentSource();

  // exercises → muscles + equipment
  for (const [id, { meta }] of Object.entries(exercisesById)) {
    for (const m of (meta.muscles || [])) {
      if (!muscleIds.has(m.id)) {
        errors.push(`[exercises] ${id}: muscle "${m.id}" not found`);
      }
    }
    for (const e of (meta.equipment || [])) {
      if (!equipIds.has(e)) {
        errors.push(`[exercises] ${id}: equipment "${e}" not found`);
      }
    }
  }

  // program-templates → exercises + muscles
  const programsDir = path.join(SOURCE, 'program-templates');
  if (fs.existsSync(programsDir)) {
    for (const id of fs.readdirSync(programsDir)) {
      const indexPath = path.join(programsDir, id, 'index.json');
      if (!fs.existsSync(indexPath)) continue;
      const meta = readJson(indexPath);
      for (const day of (meta.days || [])) {
        for (const todo of (day.todos || [])) {
          if (todo.moveId && !exerciseIds.has(todo.moveId)) {
            errors.push(`[program-templates] ${id} day ${day.dayIndex ?? '?'}: moveId "${todo.moveId}" not found`);
          }
          if (todo.muscleTarget && !muscleIds.has(todo.muscleTarget)) {
            errors.push(`[program-templates] ${id} day ${day.dayIndex ?? '?'}: muscleTarget "${todo.muscleTarget}" not found`);
          }
        }
      }
    }
  }

  // archetypes → exercises
  const archetypesDir = path.join(SOURCE, 'archetypes');
  if (fs.existsSync(archetypesDir)) {
    for (const file of fs.readdirSync(archetypesDir)) {
      if (!file.endsWith('.json') || file === 'manifest.json') continue;
      const config = readJson(path.join(archetypesDir, file));
      for (const moveId of (config.moveIds || [])) {
        if (!exerciseIds.has(moveId)) {
          errors.push(`[archetypes] ${config.id}: move "${moveId}" not found`);
        }
      }
    }
  }

  // profiles → foods + recipes
  const profilesDir = path.join(SOURCE, 'profiles');
  if (fs.existsSync(profilesDir)) {
    for (const file of fs.readdirSync(profilesDir)) {
      if (!file.endsWith('.json') || file === 'manifest.json') continue;
      const config = readJson(path.join(profilesDir, file));
      for (const foodId of (config.foodIds || [])) {
        if (!foodIds.has(foodId)) {
          errors.push(`[profiles] ${config.id}: food "${foodId}" not found`);
        }
      }
      for (const recipeId of (config.recipeIds || [])) {
        if (!recipeIds.has(recipeId)) {
          errors.push(`[profiles] ${config.id}: recipe "${recipeId}" not found`);
        }
      }
    }
  }

  // recipes → foods
  const recipesDir = path.join(SOURCE, 'recipes');
  if (fs.existsSync(recipesDir)) {
    for (const id of fs.readdirSync(recipesDir)) {
      const indexPath = path.join(recipesDir, id, 'index.json');
      if (!fs.existsSync(indexPath)) continue;
      const meta = readJson(indexPath);
      for (const { foodId } of (meta.ingredients || [])) {
        if (!foodIds.has(foodId)) {
          errors.push(`[recipes] ${id}: ingredient food "${foodId}" not found`);
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error(`\n[validate] ${errors.length} cross-reference error(s) found:`);
    for (const e of errors) console.error('  ' + e);
    process.exit(1);
  }
  console.log('[validate] all cross-references OK');
}

console.log('Validating cross-references...');
checkCrossReferences();
console.log('Building gymtribe-public data...');
buildExercises();
buildFoods();
buildEquipment();
buildMuscles();
buildRecipes();
buildProgramTemplates();
buildArchetypes();
buildProfiles();
console.log('Done.');
