#!/usr/bin/env node
/**
 * build-all.js – Run the full production build for all sub-projects.
 *
 * Usage: node scripts/build-all.js
 */

const { execSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');

function run(cmd, cwd = root) {
  console.log(`\n> ${cmd} (in ${cwd})\n`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

// 1. Install Node dependencies
run('npm install');

// 2. Build Electron main process (TypeScript → JS)
run('npx tsc --project tsconfig.json');

// 3. Build React / Vite frontend
run('npx vite build', path.join(root, 'frontend'));

console.log('\n✅ Build complete.\n');
