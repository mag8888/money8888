#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 [AUTO-START] Starting automated system startup...');

// Функция запуска процесса
function startProcess(name, command, args, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`🔧 [AUTO-START] Starting ${name}...`);
    
    const process = spawn(command, args, {
      cwd: cwd || process.cwd(),
      stdio: 'pipe',
      shell: true
    });
    
    process.stdout.on('data', (data) => {
      console.log(`[${name}] ${data.toString().trim()}`);
    });
    
    process.stderr.on('data', (data) => {
      console.log(`[${name}] ERROR: ${data.toString().trim()}`);
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ [AUTO-START] ${name} started successfully`);
        resolve(process);
      } else {
        console.log(`❌ [AUTO-START] ${name} failed with code ${code}`);
        reject(new Error(`${name} failed with code ${code}`));
      }
    });
    
    process.on('error', (error) => {
      console.log(`❌ [AUTO-START] ${name} error: ${error.message}`);
      reject(error);
    });
    
    // Ждем немного для стабилизации
    setTimeout(() => resolve(process), 3000);
  });
}

// Главная функция запуска
async function startAll() {
  try {
    console.log('🔄 [AUTO-START] Cleaning up existing processes...');
    
    // Очищаем существующие процессы
    const { exec } = require('child_process');
    exec('pkill -f "npm start" && pkill -f "node index.js"', () => {});
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🚀 [AUTO-START] Starting server...');
    
    // Запускаем сервер
    const server = await startProcess('Server', 'npm', ['start'], process.cwd());
    
    console.log('⏳ [AUTO-START] Waiting for server to stabilize...');
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    console.log('🧪 [AUTO-START] Starting automated tests...');
    
    // Запускаем тесты
    const tests = await startProcess('Tests', 'node', ['test-automation.js'], process.cwd());
    
    console.log('🎉 [AUTO-START] All systems started successfully!');
    
  } catch (error) {
    console.log(`💥 [AUTO-START] Startup failed: ${error.message}`);
    process.exit(1);
  }
}

// Запускаем систему
startAll();

