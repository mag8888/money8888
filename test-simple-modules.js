// 🧪 Простой тест модулей CASHFLOW
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Простой тест модулей...');

// Тест 1: Проверка структуры
const modules = ['core', 'game', 'ui', 'network', 'data', 'utils'];
let allModulesExist = true;

modules.forEach(moduleName => {
  const modulePath = join(__dirname, 'modules', moduleName);
  const indexPath = join(modulePath, 'index.js');
  
  if (existsSync(modulePath) && existsSync(indexPath)) {
    console.log(`✅ ${moduleName}: OK`);
  } else {
    console.log(`❌ ${moduleName}: MISSING FILES`);
    allModulesExist = false;
  }
});

// Тест 2: Проверка package.json
try {
  const packagePath = join(__dirname, 'package.json');
  const packageContent = readFileSync(packagePath, 'utf8');
  const packageJson = JSON.parse(packageContent);
  
  console.log(`\n📦 Проект: ${packageJson.name}`);
  console.log(`📦 Версия: ${packageJson.version}`);
  console.log(`📦 Тип: ${packageJson.type || 'CommonJS'}`);
  
} catch (error) {
  console.error('❌ Ошибка package.json:', error.message);
}

// Тест 3: Итог
console.log(`\n🎯 ИТОГ: ${allModulesExist ? 'ВСЕ МОДУЛИ ГОТОВЫ' : 'ЕСТЬ ПРОБЛЕМЫ'}`);

if (allModulesExist) {
  console.log('🚀 Можно начинать работу с модулями!');
} else {
  console.log('🔧 Нужно исправить недостающие файлы');
}
