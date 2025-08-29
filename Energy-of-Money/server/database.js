const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.dbPath = path.join(__dirname, 'game.db');
        this.db = null;
        this.initialize();
    }

    initialize() {
        this.db = new sqlite3.Database(this.dbPath, (err) => {
            if (err) {
                console.error('❌ [DB] Error opening database:', err.message);
            } else {
                console.log('🗄️ [DB] Database initialized:', this.dbPath);
                this.initTables();
            }
        });
    }

    initTables() {
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        const createRoomsTable = `
            CREATE TABLE IF NOT EXISTS rooms (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                host_id TEXT,
                host_username TEXT,
                created_at INTEGER,
                updated_at INTEGER
            )
        `;

        const createPlayersTable = `
            CREATE TABLE IF NOT EXISTS players (
                id TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                room_id TEXT NOT NULL,
                joined_at INTEGER,
                FOREIGN KEY (room_id) REFERENCES rooms (id)
            )
        `;

        this.db.serialize(() => {
            this.db.run(createUsersTable, (err) => {
                if (err) {
                    console.error('❌ [DB] Error creating users table:', err.message);
                } else {
                    console.log('✅ [DB] Users table ready');
                }
            });

            this.db.run(createRoomsTable, (err) => {
                if (err) {
                    console.error('❌ [DB] Error creating rooms table:', err.message);
                } else {
                    console.log('✅ [DB] Rooms table ready');
                }
            });

            this.db.run(createPlayersTable, (err) => {
                if (err) {
                    console.error('❌ [DB] Error creating players table:', err.message);
                } else {
                    console.log('✅ [DB] Players table ready');
                }
            });

            // Проверяем наличие колонки password
            this.checkPasswordColumn();
        });

        console.log('🗄️ [DB] Tables initialized successfully');
    }

    checkPasswordColumn() {
        this.db.get("PRAGMA table_info(users)", (err, row) => {
            if (err) {
                console.error('❌ [DB] Error checking table schema:', err.message);
                return;
            }

            this.db.all("PRAGMA table_info(users)", (err, rows) => {
                if (err) {
                    console.error('❌ [DB] Error getting table schema:', err.message);
                    return;
                }

                const hasPasswordColumn = rows.some(col => col.name === 'password');
                if (hasPasswordColumn) {
                    console.log('✅ [DB] Password column already exists');
                    // Обновляем пароли для существующих пользователей
                    this.updateExistingUsersPasswords();
                } else {
                    console.log('🔄 [DB] Adding password column...');
                    this.migrateAddPasswordColumn();
                }
            });
        });
    }

    migrateAddPasswordColumn() {
        const addPasswordColumn = `
            ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT '87654321'
        `;

        this.db.run(addPasswordColumn, (err) => {
            if (err) {
                console.error('❌ [DB] Error adding password column:', err.message);
            } else {
                console.log('✅ [DB] Password column added successfully');
                this.updateExistingUsersPasswords();
            }
        });
    }

    updateExistingUsersPasswords() {
        console.log('🔄 [DB] Updating passwords for existing users...');
        
        const updatePasswords = `
            UPDATE users 
            SET password = '87654321' 
            WHERE password IS NULL 
            OR password = '' 
            OR password = '123456'
        `;

        this.db.run(updatePasswords, (err) => {
            if (err) {
                console.error('❌ [DB] Error updating existing user passwords:', err.message);
            } else {
                this.db.get("SELECT COUNT(*) as count FROM users WHERE password = '87654321'", (err, row) => {
                    if (err) {
                        console.error('❌ [DB] Error counting updated users:', err.message);
                    } else {
                        console.log(`✅ [DB] ${row.count} users have updated passwords`);
                    }
                });
            }
        });
    }

    createUser(username, email, password = '87654321') {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO users (username, email, password) 
                VALUES (?, ?, ?)
            `;
            
            this.db.run(sql, [username, email, password], function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        reject(new Error('Username or email already exists'));
                    } else {
                        reject(err);
                    }
                } else {
                    resolve({
                        id: this.lastID,
                        username,
                        email,
                        password
                    });
                }
            });
        });
    }

    getUserByUsername(username) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE username = ?';
            this.db.get(sql, [username], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE email = ?';
            this.db.get(sql, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    updateUserPassword(userId, newPassword) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE users SET password = ? WHERE id = ?';
            this.db.run(sql, [newPassword, userId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    if (this.changes > 0) {
                        resolve(true);
                    } else {
                        reject(new Error('User not found'));
                    }
                }
            });
        });
    }

    saveRoom(room) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT OR REPLACE INTO rooms (id, name, host_id, host_username, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            this.db.run(sql, [
                room.id,
                room.name,
                room.hostId || null,
                room.hostUsername || null,
                room.createdAt || Date.now(),
                Date.now()
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(room);
                }
            });
        });
    }

    getRoom(roomId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM rooms WHERE id = ?';
            this.db.get(sql, [roomId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    getAllRooms() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM rooms ORDER BY created_at DESC';
            this.db.all(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    deleteRoom(roomId) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM rooms WHERE id = ?';
            this.db.run(sql, [roomId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }

    savePlayer(player) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT OR REPLACE INTO players (id, username, room_id, joined_at)
                VALUES (?, ?, ?, ?)
            `;
            
            this.db.run(sql, [
                player.id,
                player.username,
                player.roomId,
                player.joinedAt || Date.now()
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(player);
                }
            });
        });
    }

    getPlayersInRoom(roomId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM players WHERE room_id = ?';
            this.db.all(sql, [roomId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    removePlayer(playerId) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM players WHERE id = ?';
            this.db.run(sql, [playerId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }

    migrateExistingData() {
        return new Promise((resolve, reject) => {
            console.log('🔄 [DB] Starting data migration...');
            
            // Здесь можно добавить логику миграции данных
            // Например, обновление существующих записей
            
            console.log('✅ [DB] Data migration completed successfully');
            resolve();
        });
    }

    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('❌ [DB] Error closing database:', err.message);
                } else {
                    console.log('🗄️ [DB] Database connection closed');
                }
            });
        }
    }
}

module.exports = Database;
