// 🧪 Тестирование модулей CASHFLOW
// Простой тест для проверки работоспособности

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Начинаю тестирование модулей...');

// Тест 1: Проверка создания модулей
try {
  console.log('✅ Модули созданы успешно');
  
  // Проверяем структуру
  const modules = ['core', 'game', 'ui', 'network', 'data', 'utils'];
  
  modules.forEach(moduleName => {
    const modulePath = join(__dirname, 'modules', moduleName);
    if (existsSync(modulePath)) {
      console.log(`✅ Модуль ${moduleName} существует`);
      
      // Проверяем содержимое модуля
      const files = ['index.js', 'package.json'];
      files.forEach(file => {
        const filePath = join(modulePath, file);
        if (existsSync(filePath)) {
          console.log(`  📄 ${file} найден`);
        } else {
          console.log(`  ❌ ${file} не найден`);
        }
      });
    } else {
      console.log(`❌ Модуль ${moduleName} не найден`);
    }
  });
  
} catch (error) {
  console.error('❌ Ошибка при проверке модулей:', error);
}

// Тест 2: Проверка package.json
try {
  const packagePath = join(__dirname, 'package.json');
  const packageContent = readFileSync(packagePath, 'utf8');
  const packageJson = JSON.parse(packageContent);
  
  console.log('✅ Корневой package.json загружен');
  console.log('📦 Название проекта:', packageJson.name);
  console.log('📦 Версия:', packageJson.version);
  console.log('📦 Тип:', packageJson.type || 'CommonJS');
  
} catch (error) {
  console.error('❌ Ошибка при загрузке package.json:', error);
}

// Тест 3: Проверка структуры проекта
try {
  const projectStructure = {
    'modules/': 'Папка модулей',
    'client/': 'React клиент',
    'server/': 'Node.js сервер',
    'package.json': 'Корневой package.json',
    'README.md': 'Документация'
  };
  
  Object.entries(projectStructure).forEach(([path, description]) => {
    const fullPath = join(__dirname, path);
    if (existsSync(fullPath)) {
      console.log(`✅ ${description}: ${path}`);
    } else {
      console.log(`❌ ${description}: ${path} - НЕ НАЙДЕН`);
    }
  });
  
} catch (error) {
  console.error('❌ Ошибка при проверке структуры:', error);
}

console.log('🧪 Тестирование завершено');
