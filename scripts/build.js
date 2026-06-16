#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'source');
const DATA = path.join(ROOT, 'data');
const CONFIG = path.join(ROOT, 'config');
const CDN_BASE = 'https://raw.githubusercontent.com/chipp972/gymtribe-public/master';

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function addDirToZip(zip, dirPath, zipPrefix) {
  if (!fs.existsSync(dirPath)) return;
  for (const entry of fs.readdirSync(dirPath)) {
    if (entry === '.gitkeep') continue;
    const full = path.join(dirPath, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      addDirToZip(zip, full, `${zipPrefix}${entry}/`);
    } else {
      zip.addLocalFile(full, zipPrefix);
    }
  }
}

// Exercises: write manifest to source/exercises/manifest.json, no per-item zips
function buildExercises() {
  const srcDir = path.join(SOURCE, 'exercises');
  const outDir = path.join(SOURCE, 'exercises');

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
      ...(notes.length > 0 && { notes }),
    });
  }

  const manifest = { version: '1.0.0', exercises: manifestEntries };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`  [exercises] ${manifestEntries.length} exercises → source/exercises/manifest.json`);

  return manifest;
}

// Foods: write manifest to source/foods/manifest.json, no per-item zips
function buildFoods() {
  const srcDir = path.join(SOURCE, 'foods');
  const outDir = path.join(SOURCE, 'foods');

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
    });
  }

  const manifest = { version: '1.0.0', foods: manifestEntries };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`  [foods] ${manifestEntries.length} foods → source/foods/manifest.json`);

  return manifest;
}

// Equipment: write manifest to source/equipment/manifest.json, no per-item zips
function buildEquipment() {
  const srcDir = path.join(SOURCE, 'equipment');
  const outDir = path.join(SOURCE, 'equipment');

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
      thumbnailUrl: meta.imageUrl
        ? `${CDN_BASE}/source/equipment/${id}/${meta.imageUrl}`
        : undefined,
    });
  }

  const manifest = { version: '1.0.0', equipment: manifestEntries };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`  [equipment] ${manifestEntries.length} equipment items → source/equipment/manifest.json`);
}

// Muscles: write manifest to source/muscles/manifest.json, no zip
function buildMuscles() {
  const srcDir = path.join(SOURCE, 'muscles');
  const indexPath = path.join(srcDir, 'index.json');

  if (!fs.existsSync(indexPath)) {
    console.warn('  [muscles] source/muscles/index.json not found — skipping');
    return;
  }

  const data = readJson(indexPath);
  const items = Array.isArray(data) ? data : (data.muscles || []);
  const manifestEntries = items.map(({ id, name }) => ({ id, name }));

  const manifest = { version: '1.0.0', muscles: manifestEntries };
  fs.writeFileSync(path.join(srcDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`  [muscles] ${manifestEntries.length} muscles → source/muscles/manifest.json`);
}

// Recipes: write manifest to source/recipes/manifest.json, no per-item zips
function buildRecipes() {
  const srcDir = path.join(SOURCE, 'recipes');

  if (!fs.existsSync(srcDir)) {
    console.warn('  [recipes] source/recipes/ not found — skipping');
    return;
  }

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
    manifestEntries.push({
      id,
      name: meta.name,
      description: meta.description,
      imageUrl: meta.imageUrl
        ? `${CDN_BASE}/source/recipes/${id}/media/${meta.imageUrl}`
        : undefined,
    });
  }

  const manifest = { version: '1.0.0', recipes: manifestEntries };
  fs.writeFileSync(path.join(srcDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`  [recipes] ${manifestEntries.length} recipes → source/recipes/manifest.json`);
}

// Program templates: write manifest to source/program-templates/manifest.json, no zips needed (no media)
function buildProgramTemplates() {
  const srcDir = path.join(SOURCE, 'program-templates');

  if (!fs.existsSync(srcDir)) {
    console.warn('  [program-templates] source/program-templates/ not found — skipping');
    return;
  }

  // Read exercises from source manifest (generated earlier in this run)
  const exercisesManifestPath = path.join(SOURCE, 'exercises', 'manifest.json');
  const exercisesById = {};
  if (fs.existsSync(exercisesManifestPath)) {
    const { exercises = [] } = readJson(exercisesManifestPath);
    for (const ex of exercises) exercisesById[ex.id] = ex;
  } else {
    console.warn('  [program-templates] exercises manifest not found — requiredEquipment will be empty');
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

    const equipmentSet = new Set();
    for (const moveId of (meta.moves || [])) {
      const ex = exercisesById[moveId];
      if (ex && Array.isArray(ex.equipment)) {
        ex.equipment.forEach((e) => equipmentSet.add(e));
      }
    }

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
      requiredEquipment: Array.from(equipmentSet),
      primaryMuscles: meta.primaryMuscles,
      jsonUrl: `${CDN_BASE}/source/program-templates/${id}/index.json`,
    });
  }

  const manifest = { version: '2.0.0', templates: manifestEntries };
  fs.writeFileSync(path.join(srcDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`  [program-templates] ${manifestEntries.length} templates → source/program-templates/manifest.json`);
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

// Helper: build a GymTribeShareFile from config + source data
function buildShareFile(config, exercisesById, foodsById) {
  const moves = (config.moveIds || []).map((id) => {
    const item = exercisesById[id];
    if (!item) {
      console.warn(`    [share] exercise "${id}" not found — skipping`);
      return null;
    }
    const { meta, notes } = item;
    return {
      name: meta.name.en,
      notes,
      muscles: (meta.muscles || []).map((m) => ({ muscleName: m.name, role: m.role })),
      equipments: (meta.equipment || []).map((e) => ({ name: e })),
    };
  }).filter(Boolean);

  const foods = (config.foodIds || []).map((id) => {
    const meta = foodsById[id];
    if (!meta) {
      console.warn(`    [share] food "${id}" not found — skipping`);
      return null;
    }
    return {
      name: meta.name.en,
      type: meta.type,
      kcalPer100g: meta.kcalPer100g,
      protPer100g: meta.protPer100g,
      glucPer100g: meta.glucPer100g,
      lipPer100g: meta.lipPer100g,
      fiberPer100g: meta.fiberPer100g,
      barcode: null,
    };
  }).filter(Boolean);

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    moves,
    foods,
    recipes: [],
  };
}

// Archetypes: create GymTribeShareFile zips from config/archetypes/*.json
function buildArchetypes() {
  const configDir = path.join(CONFIG, 'archetypes');
  const outDir = path.join(DATA, 'archetypes');
  ensureDir(outDir);

  if (!fs.existsSync(configDir)) {
    console.warn('  [archetypes] config/archetypes/ not found — skipping');
    return;
  }

  const exercisesById = loadExercisesSource();
  const foodsById = loadFoodsSource();
  const manifestEntries = [];

  for (const file of fs.readdirSync(configDir).sort()) {
    if (!file.endsWith('.json')) continue;
    const configPath = path.join(configDir, file);
    const config = readJson(configPath);
    const { id, name, description, tags } = config;

    const shareFile = buildShareFile(config, exercisesById, foodsById);
    const zip = new AdmZip();
    zip.addFile('share.json', Buffer.from(JSON.stringify(shareFile, null, 2)));

    const zipName = `${id}.gymtribe.zip`;
    zip.writeZip(path.join(outDir, zipName));

    manifestEntries.push({
      id,
      name,
      description,
      tags: tags || [],
      zipUrl: `${CDN_BASE}/data/archetypes/${zipName}`,
    });
  }

  const manifest = { version: '1.0.0', archetypes: manifestEntries };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`  [archetypes] ${manifestEntries.length} archetypes → data/archetypes/`);
}

// Profiles: create GymTribeShareFile zips from config/profiles/*.json
function buildProfiles() {
  const configDir = path.join(CONFIG, 'profiles');
  const outDir = path.join(DATA, 'profiles');
  ensureDir(outDir);

  if (!fs.existsSync(configDir)) {
    console.warn('  [profiles] config/profiles/ not found — skipping');
    return;
  }

  const foodsById = loadFoodsSource();
  const manifestEntries = [];

  for (const file of fs.readdirSync(configDir).sort()) {
    if (!file.endsWith('.json')) continue;
    const configPath = path.join(configDir, file);
    const config = readJson(configPath);
    const { id, name, description } = config;

    const shareFile = buildShareFile(config, {}, foodsById);
    const zip = new AdmZip();
    zip.addFile('share.json', Buffer.from(JSON.stringify(shareFile, null, 2)));

    const zipName = `${id}.gymtribe.zip`;
    zip.writeZip(path.join(outDir, zipName));

    manifestEntries.push({
      id,
      name,
      description,
      zipUrl: `${CDN_BASE}/data/profiles/${zipName}`,
    });
  }

  const manifest = { version: '1.0.0', profiles: manifestEntries };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`  [profiles] ${manifestEntries.length} profiles → data/profiles/`);
}

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
