#!/usr/bin/env node

/**
 * Script de développement pour le service geo-tracking
 * Utilise nodemon pour le hot-reload
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Geo-Tracking Service in development mode...\n');

const nodemon = spawn('npx', ['nodemon', 'src/server.js'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  shell: true
});

nodemon.on('error', (err) => {
  console.error('Failed to start nodemon:', err);
  process.exit(1);
});

nodemon.on('close', (code) => {
  console.log(`Nodemon exited with code ${code}`);
  process.exit(code);
});
