#!/usr/bin/env node
/**
 * setup.js – First-run setup: install npm and pip dependencies.
 *
 * Usage: node scripts/setup.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');

function run(cmd, cwd = root) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

// 1. Node dependencies
console.log('📦 Installing Node.js dependencies…');
run('npm install');

// 2. Python dependencies
const reqFile = path.join(root, 'requirements.txt');
if (fs.existsSync(reqFile)) {
  console.log('🐍 Installing Python dependencies…');
  // Pass the requirements file path as a spawn argument array to avoid shell injection
  const { spawnSync } = require('child_process');
  const result = spawnSync('pip', ['install', '-r', reqFile], { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) {
    console.error('pip install failed');
    process.exit(result.status ?? 1);
  }
} else {
  console.warn('⚠️  requirements.txt not found, skipping pip install.');
}

// 3. Copy .env.example → .env if not present
const envFile = path.join(root, '.env');
const envExample = path.join(root, '.env.example');
if (!fs.existsSync(envFile) && fs.existsSync(envExample)) {
  fs.copyFileSync(envExample, envFile);
  console.log('📋 Created .env from .env.example – please fill in your API keys.');
}

console.log('\n✅ Setup complete. Run `node scripts/start-all.js` to start the app.\n');
