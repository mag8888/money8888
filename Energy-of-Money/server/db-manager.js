#!/usr/bin/env node

const GameDatabase = require('./database');

class DatabaseManager {
  constructor() {
    this.db = new GameDatabase();
  }

  // Показать статистику БД
  showStats() {
    console.log('\n📊 Database Statistics:');
    console.log('========================');
    
    try {
      // Пользователи
      const users = this.db.getAllUsers();
      console.log(`👥 Users: ${users.length}`);
      
      // Комнаты
      const rooms = this.db.getAllRooms();
      console.log(`🏠 Rooms: ${rooms.length}`);
      
      // Активные игры
      const activeGames = rooms.filter(r => r.status === 'determining_order' || r.status === 'playing');
      console.log(`🎮 Active Games: ${activeGames.length}`);
      
      console.log('\n📋 Recent Users:');
      users.slice(0, 5).forEach(user => {
        console.log(`  - ${user.username} (${user.email}) - ${user.createdAt}`);
      });
      
      console.log('\n🏠 Recent Rooms:');
      rooms.slice(0, 5).forEach(room => {
        console.log(`  - ${room.displayName} (${room.status}) - ${room.createdAt}`);
      });
      
    } catch (error) {
      console.error('❌ Error getting stats:', error.message);
    }
  }

  // Очистить все данные
  clearAll() {
    console.log('\n🗑️ Clearing all data...');
    
    try {
      this.db.db.exec('DELETE FROM game_moves');
      this.db.db.exec('DELETE FROM games');
      this.db.db.exec('DELETE FROM room_players');
      this.db.db.exec('DELETE FROM rooms');
      this.db.db.exec('DELETE FROM users');
      
      console.log('✅ All data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing data:', error.message);
    }
  }

  // Экспорт данных
  exportData() {
    console.log('\n📤 Exporting data...');
    
    try {
      const users = this.db.getAllUsers();
      const rooms = this.db.getAllRooms();
      
      const exportData = {
        timestamp: new Date().toISOString(),
        users: users,
        rooms: rooms
      };
      
      const fs = require('fs');
      const exportPath = `./db-export-${Date.now()}.json`;
      fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
      
      console.log(`✅ Data exported to: ${exportPath}`);
      console.log(`📊 Exported ${users.length} users and ${rooms.length} rooms`);
      
    } catch (error) {
      console.error('❌ Error exporting data:', error.message);
    }
  }

  // Показать помощь
  showHelp() {
    console.log(`
🗄️ Database Manager - Energy of Money Game

Usage: node db-manager.js [command]

Commands:
  stats     - Show database statistics
  clear     - Clear all data (DANGEROUS!)
  export    - Export all data to JSON file
  help      - Show this help message

Examples:
  node db-manager.js stats
  node db-manager.js export
  node db-manager.js clear
`);
  }

  // Запуск менеджера
  run() {
    const command = process.argv[2] || 'stats';
    
    switch (command) {
      case 'stats':
        this.showStats();
        break;
      case 'clear':
        this.clearAll();
        break;
      case 'export':
        this.exportData();
        break;
      case 'help':
      default:
        this.showHelp();
        break;
    }
    
    this.db.close();
  }
}

// Запускаем менеджер
if (require.main === module) {
  const manager = new DatabaseManager();
  manager.run();
}

module.exports = DatabaseManager;
