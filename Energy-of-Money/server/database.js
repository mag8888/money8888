const Database = require('better-sqlite3');
const path = require('path');

class GameDatabase {
  constructor() {
    // Создаем БД в папке server
    const dbPath = path.join(__dirname, 'game.db');
    this.db = new Database(dbPath);
    
    console.log('🗄️ [DB] Database initialized:', dbPath);
    this.initTables();
  }

  initTables() {
    // Таблица пользователей
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastLogin DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Таблица комнат
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        displayName TEXT NOT NULL,
        isPublic BOOLEAN DEFAULT 1,
        password TEXT DEFAULT '',
        professionType TEXT DEFAULT 'individual',
        hostId TEXT NOT NULL,
        hostUsername TEXT NOT NULL,
        status TEXT DEFAULT 'waiting',
        maxPlayers INTEGER DEFAULT 4,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hostId) REFERENCES users(id)
      )
    `);

    // Таблица игроков в комнатах
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS room_players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roomId TEXT NOT NULL,
        playerId TEXT NOT NULL,
        username TEXT NOT NULL,
        socketId TEXT,
        seat INTEGER,
        ready BOOLEAN DEFAULT 0,
        profession TEXT,
        dream TEXT,
        balance INTEGER DEFAULT 0,
        salary INTEGER DEFAULT 0,
        expenses INTEGER DEFAULT 0,
        passiveIncome INTEGER DEFAULT 0,
        position INTEGER DEFAULT 0,
        offline BOOLEAN DEFAULT 0,
        joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (roomId) REFERENCES rooms(id),
        FOREIGN KEY (playerId) REFERENCES users(id)
      )
    `);

    // Таблица игр
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roomId TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        currentTurn TEXT,
        currentPhase TEXT DEFAULT 'playing',
        orderDetermination TEXT,
        startedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        endedAt DATETIME,
        FOREIGN KEY (roomId) REFERENCES rooms(id)
      )
    `);

    // Таблица ходов
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS game_moves (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gameId INTEGER NOT NULL,
        playerId TEXT NOT NULL,
        moveType TEXT NOT NULL,
        moveData TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (gameId) REFERENCES games(id),
        FOREIGN KEY (playerId) REFERENCES users(id)
      )
    `);

    console.log('🗄️ [DB] Tables initialized successfully');
  }

  // === USER OPERATIONS ===
  createUser(userData) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO users (id, username, email) 
        VALUES (?, ?, ?)
      `);
      stmt.run(userData.id, userData.username, userData.email);
      
      console.log('✅ [DB] User created:', userData.username);
      return true;
    } catch (error) {
      console.error('❌ [DB] Error creating user:', error.message);
      return false;
    }
  }

  getUserById(userId) {
    try {
      const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
      return stmt.get(userId);
    } catch (error) {
      console.error('❌ [DB] Error getting user:', error.message);
      return null;
    }
  }

  getUserByUsername(username) {
    try {
      const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?');
      return stmt.get(username);
    } catch (error) {
      console.error('❌ [DB] Error getting user by username:', error.message);
      return null;
    }
  }

  getAllUsers() {
    try {
      const stmt = this.db.prepare('SELECT * FROM users ORDER BY createdAt DESC');
      return stmt.all();
    } catch (error) {
      console.error('❌ [DB] Error getting all users:', error.message);
      return [];
    }
  }

  updateUserLastLogin(userId) {
    try {
      const stmt = this.db.prepare('UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?');
      stmt.run(userId);
      return true;
    } catch (error) {
      console.error('❌ [DB] Error updating user last login:', error.message);
      return false;
    }
  }

  // === ROOM OPERATIONS ===
  createRoom(roomData) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO rooms (id, name, displayName, isPublic, password, professionType, hostId, hostUsername, maxPlayers) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        roomData.id,
        roomData.name,
        roomData.displayName,
        roomData.isPublic,
        roomData.password,
        roomData.professionType,
        roomData.hostId,
        roomData.hostUsername,
        roomData.maxPlayers
      );
      
      console.log('✅ [DB] Room created:', roomData.displayName);
      return true;
    } catch (error) {
      console.error('❌ [DB] Error creating room:', error.message);
      return false;
    }
  }

  getRoomById(roomId) {
    try {
      const stmt = this.db.prepare('SELECT * FROM rooms WHERE id = ?');
      return stmt.get(roomId);
    } catch (error) {
      console.error('❌ [DB] Error getting room:', error.message);
      return null;
    }
  }

  updateRoomStatus(roomId, status) {
    try {
      const stmt = this.db.prepare(`
        UPDATE rooms 
        SET status = ?, updatedAt = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);
      stmt.run(status, roomId);
      return true;
    } catch (error) {
      console.error('❌ [DB] Error updating room status:', error.message);
      return false;
    }
  }

  getAllRooms() {
    try {
      const stmt = this.db.prepare('SELECT * FROM rooms ORDER BY createdAt DESC');
      return stmt.all();
    } catch (error) {
      console.error('❌ [DB] Error getting all rooms:', error.message);
      return [];
    }
  }

  // === ROOM PLAYERS OPERATIONS ===
  addPlayerToRoom(roomId, playerData) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO room_players (roomId, playerId, username, socketId, profession, dream, balance, salary, expenses) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        roomId,
        playerData.id,
        playerData.username,
        playerData.socketId,
        playerData.profession ? JSON.stringify(playerData.profession) : null,
        playerData.dream ? JSON.stringify(playerData.dream) : null,
        playerData.balance || 0,
        playerData.salary || 0,
        playerData.expenses || 0
      );
      
      console.log('✅ [DB] Player added to room:', playerData.username);
      return true;
    } catch (error) {
      console.error('❌ [DB] Error adding player to room:', error.message);
      return false;
    }
  }

  updatePlayerInRoom(roomId, playerId, updates) {
    try {
      let query = 'UPDATE room_players SET ';
      const values = [];
      const setClauses = [];
      
      Object.keys(updates).forEach(key => {
        if (key === 'profession' || key === 'dream') {
          setClauses.push(`${key} = ?`);
          values.push(JSON.stringify(updates[key]));
        } else {
          setClauses.push(`${key} = ?`);
          values.push(updates[key]);
        }
      });
      
      query += setClauses.join(', ') + ' WHERE roomId = ? AND playerId = ?';
      values.push(roomId, playerId);
      
      const stmt = this.db.prepare(query);
      stmt.run(...values);
      
      return true;
    } catch (error) {
      console.error('❌ [DB] Error updating player:', error.message);
      return false;
    }
  }

  getRoomPlayers(roomId) {
    try {
      const stmt = this.db.prepare('SELECT * FROM room_players WHERE roomId = ? ORDER BY seat ASC');
      const players = stmt.all(roomId);
      
      // Парсим JSON поля
      return players.map(player => ({
        ...player,
        profession: player.profession ? JSON.parse(player.profession) : null,
        dream: player.dream ? JSON.parse(player.dream) : null
      }));
    } catch (error) {
      console.error('❌ [DB] Error getting room players:', error.message);
      return [];
    }
  }

  removePlayerFromRoom(roomId, playerId) {
    try {
      const stmt = this.db.prepare('DELETE FROM room_players WHERE roomId = ? AND playerId = ?');
      stmt.run(roomId, playerId);
      return true;
    } catch (error) {
      console.error('❌ [DB] Error removing player from room:', error.message);
      return false;
    }
  }

  // === GAME OPERATIONS ===
  createGame(roomId) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO games (roomId, status, currentPhase) 
        VALUES (?, 'active', 'determining_order')
      `);
      const result = stmt.run(roomId);
      
      console.log('✅ [DB] Game created for room:', roomId);
      return result.lastInsertRowid;
    } catch (error) {
      console.error('❌ [DB] Error creating game:', error.message);
      return null;
    }
  }

  updateGameStatus(gameId, status, phase = null) {
    try {
      let query = 'UPDATE games SET status = ?';
      const values = [status];
      
      if (phase) {
        query += ', currentPhase = ?';
        values.push(phase);
      }
      
      query += ' WHERE id = ?';
      values.push(gameId);
      
      const stmt = this.db.prepare(query);
      stmt.run(...values);
      return true;
    } catch (error) {
      console.error('❌ [DB] Error updating game status:', error.message);
      return false;
    }
  }

  // === UTILITY METHODS ===
  close() {
    this.db.close();
    console.log('🗄️ [DB] Database connection closed');
  }

  // Миграция существующих данных
  async migrateExistingData(users, rooms) {
    console.log('🔄 [DB] Starting data migration...');
    
    try {
      // Мигрируем пользователей
      if (users && users.size > 0) {
        for (const [userId, userData] of users) {
          this.createUser({
            id: userId,
            username: userData.username,
            email: userData.email
          });
        }
        console.log(`✅ [DB] Migrated ${users.size} users`);
      }

      // Мигрируем комнаты
      if (rooms && rooms.size > 0) {
        for (const [roomId, roomData] of rooms) {
          this.createRoom({
            id: roomId,
            name: roomData.name,
            displayName: roomData.displayName,
            isPublic: roomData.isPublic,
            password: roomData.password,
            professionType: roomData.professionType,
            hostId: roomData.hostId,
            hostUsername: roomData.hostUsername,
            maxPlayers: roomData.maxPlayers
          });

          // Мигрируем игроков в комнате
          if (roomData.currentPlayers) {
            for (const player of roomData.currentPlayers) {
              this.addPlayerToRoom(roomId, player);
            }
          }
        }
        console.log(`✅ [DB] Migrated ${rooms.size} rooms`);
      }

      console.log('✅ [DB] Data migration completed successfully');
    } catch (error) {
      console.error('❌ [DB] Error during data migration:', error);
    }
  }
}

module.exports = GameDatabase;
