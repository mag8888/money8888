#!/usr/bin/env node

/**
 * 🧪 ТЕСТ ФУНКЦИОНАЛЬНОСТИ АКТИВОВ
 * Проверяет покупку и отображение активов в игре
 */

const io = require('socket.io-client');
const http = require('http');

console.log('🧪 [ASSETS-TEST] Запуск теста функциональности активов...\n');

// Конфигурация
const SERVER_URL = 'http://localhost:5000';
const SOCKET_URL = 'http://localhost:5000';

// Тестовые данные
const testRoom = {
  displayName: 'Тест Активов',
  maxPlayers: 2
};

const testPlayer1 = {
  username: 'test_assets_1',
  email: 'test1@assets.com'
};

const testPlayer2 = {
  username: 'test_assets_2', 
  email: 'test2@assets.com'
};

// Тестовая карточка для покупки
const testCard = {
  name: 'Тестовые Акции',
  type: 'stock',
  symbol: 'TEST',
  cost: 1000,
  cashflow: 100,
  description: 'Тестовые акции для проверки функциональности'
};

let currentRoomId = null;
let player1Socket = null;
let player2Socket = null;

// Функция для ожидания
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Функция для проверки API
const checkAPI = async () => {
  console.log('🔍 [ASSETS-TEST] Проверка API сервера...');
  
  try {
    const response = await new Promise((resolve, reject) => {
      const req = http.request(`${SERVER_URL}/api/admin/rooms`, {
        method: 'GET'
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      });
      
      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('API timeout')));
      req.end();
    });
    
    if (response.statusCode === 200) {
      console.log('✅ [ASSETS-TEST] API сервер доступен');
      return true;
    } else {
      console.log(`❌ [ASSETS-TEST] API вернул статус: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ [ASSETS-TEST] Ошибка API: ${error.message}`);
    return false;
  }
};

// Функция для создания комнаты
const createRoom = async (socket) => {
  console.log('🏠 [ASSETS-TEST] Создание тестовой комнаты...');
  
  return new Promise((resolve, reject) => {
    socket.emit('createRoom', testRoom.displayName, testRoom.maxPlayers, (success, roomId, error) => {
      if (success && roomId) {
        console.log(`✅ [ASSETS-TEST] Комната создана: ${roomId}`);
        resolve(roomId);
      } else {
        console.log(`❌ [ASSETS-TEST] Ошибка создания комнаты: ${error}`);
        reject(error);
      }
    });
  });
};

// Функция для присоединения к комнате
const joinRoom = async (socket, roomId) => {
  console.log(`🚪 [ASSETS-TEST] Присоединение к комнате: ${roomId}`);
  
  return new Promise((resolve, reject) => {
    socket.emit('joinRoom', roomId, (success, error) => {
      if (success) {
        console.log(`✅ [ASSETS-TEST] Успешно присоединились к комнате`);
        resolve();
      } else {
        console.log(`❌ [ASSETS-TEST] Ошибка присоединения: ${error}`);
        reject(error);
      }
    });
  });
};

// Функция для установки готовности
const setReady = async (socket, roomId, readyState) => {
  console.log(`🎯 [ASSETS-TEST] Установка готовности: ${readyState}`);
  
  return new Promise((resolve, reject) => {
    socket.emit('setReady', roomId, readyState, (success, error) => {
      if (success) {
        console.log(`✅ [ASSETS-TEST] Готовность установлена: ${readyState}`);
        resolve();
      } else {
        console.log(`❌ [ASSETS-TEST] Ошибка установки готовности: ${error}`);
        reject(error);
      }
    });
  });
};

// Функция для запуска игры
const startGame = async (socket, roomId) => {
  console.log(`🎮 [ASSETS-TEST] Запуск игры в комнате: ${roomId}`);
  
  return new Promise((resolve, reject) => {
    socket.emit('startGame', roomId, (success, error) => {
      if (success) {
        console.log(`✅ [ASSETS-TEST] Игра запущена успешно`);
        resolve();
      } else {
        console.log(`❌ [ASSETS-TEST] Ошибка запуска игры: ${error}`);
        reject(error);
      }
    });
  });
};

// Функция для покупки актива
const buyAsset = async (socket, roomId, card) => {
  console.log(`💰 [ASSETS-TEST] Покупка актива: ${card.name}`);
  
  return new Promise((resolve, reject) => {
    socket.emit('buyDeal', roomId, card, (success, error) => {
      if (success) {
        console.log(`✅ [ASSETS-TEST] Актив куплен успешно`);
        resolve();
      } else {
        console.log(`❌ [ASSETS-TEST] Ошибка покупки актива: ${error}`);
        reject(error);
      }
    });
  });
};

// Функция для проверки активов игрока
const checkPlayerAssets = async (socket, roomId) => {
  console.log(`🔍 [ASSETS-TEST] Проверка активов игрока...`);
  
  return new Promise((resolve, reject) => {
    // Запрашиваем обновленную информацию об игроке
    socket.emit('getPlayerInfo', roomId, (success, playerData, error) => {
      if (success && playerData) {
        console.log(`✅ [ASSETS-TEST] Получены данные игрока:`, {
          username: playerData.username,
          balance: playerData.balance,
          assetsCount: playerData.assets?.length || 0,
          assets: playerData.assets
        });
        resolve(playerData);
      } else {
        console.log(`❌ [ASSETS-TEST] Ошибка получения данных игрока: ${error}`);
        reject(error);
      }
    });
  });
};

// Основной тест
const runAssetsTest = async () => {
  try {
    // 1. Проверяем API
    const apiAvailable = await checkAPI();
    if (!apiAvailable) {
      throw new Error('API сервер недоступен');
    }
    
    // 2. Создаем сокеты для игроков
    console.log('\n🔌 [ASSETS-TEST] Создание сокетов для игроков...');
    
    player1Socket = io(SOCKET_URL);
    player2Socket = io(SOCKET_URL);
    
    // 3. Ждем подключения
    await Promise.all([
      new Promise(resolve => player1Socket.on('connect', resolve)),
      new Promise(resolve => player2Socket.on('connect', resolve))
    ]);
    
    console.log('✅ [ASSETS-TEST] Оба игрока подключены');
    
    // 4. Создаем комнату
    currentRoomId = await createRoom(player1Socket);
    
    // 5. Второй игрок присоединяется к комнате
    await joinRoom(player2Socket, currentRoomId);
    
    // 6. Оба игрока устанавливают готовность
    await Promise.all([
      setReady(player1Socket, currentRoomId, true),
      setReady(player2Socket, currentRoomId, true)
    ]);
    
    // 7. Ждем немного для синхронизации
    await wait(1000);
    
    // 8. Запускаем игру
    await startGame(player1Socket, currentRoomId);
    
    // 9. Ждем запуска игры
    await wait(2000);
    
    // 10. Первый игрок покупает актив
    await buyAsset(player1Socket, currentRoomId, testCard);
    
    // 11. Ждем обработки покупки
    await wait(1000);
    
    // 12. Проверяем активы первого игрока
    const player1Data = await checkPlayerAssets(player1Socket, currentRoomId);
    
    // 13. Анализируем результаты
    if (player1Data.assets && player1Data.assets.length > 0) {
      console.log('\n🎉 [ASSETS-TEST] ТЕСТ ПРОЙДЕН УСПЕШНО!');
      console.log(`✅ Активы игрока: ${player1Data.assets.length}`);
      console.log(`✅ Баланс игрока: $${player1Data.balance}`);
      console.log(`✅ Купленные активы:`, player1Data.assets);
    } else {
      console.log('\n❌ [ASSETS-TEST] ТЕСТ ПРОВАЛЕН!');
      console.log(`❌ Активы не найдены у игрока`);
      console.log(`❌ Данные игрока:`, player1Data);
    }
    
  } catch (error) {
    console.log(`\n💥 [ASSETS-TEST] КРИТИЧЕСКАЯ ОШИБКА: ${error.message}`);
    console.log(`❌ [ASSETS-TEST] Тест провален`);
  } finally {
    // Очистка
    console.log('\n🧹 [ASSETS-TEST] Очистка ресурсов...');
    
    if (player1Socket) {
      player1Socket.disconnect();
    }
    if (player2Socket) {
      player2Socket.disconnect();
    }
    
    console.log('✅ [ASSETS-TEST] Тест завершен');
    process.exit(0);
  }
};

// Запуск теста
runAssetsTest();
