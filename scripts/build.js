#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'source');
const DATA = path.join(ROOT, 'data');
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

function buildExercises() {
  const srcDir = path.join(SOURCE, 'exercises');
  const outDir = path.join(DATA, 'exercises');
  ensureDir(outDir);

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
    const zip = new AdmZip();

    zip.addLocalFile(indexPath, '');

    const notesPath = path.join(exerciseDir, 'notes.json');
    if (fs.existsSync(notesPath)) zip.addLocalFile(notesPath, '');

    const videoPath = path.join(exerciseDir, 'video.mp4');
    if (fs.existsSync(videoPath)) zip.addLocalFile(videoPath, '');

    const mediaDir = path.join(exerciseDir, 'media');
    addDirToZip(zip, mediaDir, 'media/');

    const zipName = `${id}.exercise.zip`;
    zip.writeZip(path.join(outDir, zipName));

    manifestEntries.push({
      id,
      name: meta.name,
      description: meta.description,
      archetype: meta.archetype,
      muscles: meta.muscles,
      equipment: meta.equipment,
      zipUrl: `${CDN_BASE}/data/exercises/${zipName}`
    });
  }

  const manifest = { version: '1.0.0', exercises: manifestEntries };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`  [exercises] ${manifestEntries.length} exercises → data/exercises/`);
}

function buildSimpleType(type) {
  const srcDir = path.join(SOURCE, type);
  const outDir = path.join(DATA, type);
  ensureDir(outDir);

  const indexPath = path.join(srcDir, 'index.json');
  if (!fs.existsSync(indexPath)) {
    console.warn(`  [${type}] source/${type}/index.json not found — skipping`);
    return;
  }

  const data = readJson(indexPath);
  const items = Array.isArray(data) ? data : (data[type] || []);

  const zip = new AdmZip();
  zip.addLocalFile(indexPath, '');
  addDirToZip(zip, path.join(srcDir, 'media'), 'media/');

  const zipName = `${type}.zip`;
  zip.writeZip(path.join(outDir, zipName));

  const manifestEntries = items.map((item) => ({
    ...item,
    imageUrl: item.imageUrl
      ? `${CDN_BASE}/data/${type}/media/${item.imageUrl}`
      : undefined
  }));

  const manifest = {
    version: '1.0.0',
    [type]: manifestEntries,
    zipUrl: `${CDN_BASE}/data/${type}/${zipName}`
  };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`  [${type}] ${items.length} items → data/${type}/`);
}

function buildRecipes() {
  const srcDir = path.join(SOURCE, 'recipes');
  const outDir = path.join(DATA, 'recipes');
  ensureDir(outDir);

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
    const zip = new AdmZip();

    zip.addLocalFile(indexPath, '');
    addDirToZip(zip, path.join(recipeDir, 'media'), 'media/');

    const zipName = `${id}.recipe.zip`;
    zip.writeZip(path.join(outDir, zipName));

    manifestEntries.push({
      id,
      name: meta.name,
      description: meta.description,
      imageUrl: meta.imageUrl
        ? `${CDN_BASE}/data/recipes/${id}/media/${meta.imageUrl}`
        : undefined,
      zipUrl: `${CDN_BASE}/data/recipes/${zipName}`
    });
  }

  const manifest = { version: '1.0.0', recipes: manifestEntries };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`  [recipes] ${manifestEntries.length} recipes → data/recipes/`);
}

console.log('Building gymtribe-public data...');
buildExercises();
buildSimpleType('foods');
buildSimpleType('muscles');
buildSimpleType('equipment');
buildRecipes();
console.log('Done.');
