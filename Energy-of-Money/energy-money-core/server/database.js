const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        // Создаем базу данных в памяти для Railway (более надежно)
        this.db = new sqlite3.Database(':memory:', (err) => {
            if (err) {
                console.error('❌ [DB] Error opening database:', err.message);
            } else {
                console.log('✅ [DB] Connected to SQLite database');
                this.initializeTables();
            }
        });
    }

    // Инициализация таблиц
    initializeTables() {
        // Таблица пользователей игры
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Таблица пользователей Telegram
        const createTelegramUsersTable = `
            CREATE TABLE IF NOT EXISTS telegram_users (
                telegram_id INTEGER PRIMARY KEY,
                balance INTEGER DEFAULT 10,
                referrals INTEGER DEFAULT 0,
                ref_code TEXT UNIQUE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Таблица комнат
        const createRoomsTable = `
            CREATE TABLE IF NOT EXISTS rooms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room_id TEXT UNIQUE NOT NULL,
                display_name TEXT NOT NULL,
                max_players INTEGER DEFAULT 4,
                current_players INTEGER DEFAULT 0,
                status TEXT DEFAULT 'waiting',
                password TEXT,
                host_id TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Выполняем создание таблиц
        this.db.run(createUsersTable, (err) => {
            if (err) {
                console.error('❌ [DB] Error creating users table:', err.message);
            } else {
                console.log('✅ [DB] Users table ready');
            }
        });

        this.db.run(createTelegramUsersTable, (err) => {
            if (err) {
                console.error('❌ [DB] Error creating telegram_users table:', err.message);
            } else {
                console.log('✅ [DB] Telegram users table ready');
            }
        });

        this.db.run(createRoomsTable, (err) => {
            if (err) {
                console.error('❌ [DB] Error creating rooms table:', err.message);
            } else {
                console.log('✅ [DB] Rooms table ready');
            }
        });
    }

    // Методы для пользователей игры
    async createUser(userData) {
        return new Promise((resolve, reject) => {
            const { username, email, password } = userData;
            const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
            
            this.db.run(sql, [username, email, password], function(err) {
                if (err) {
                    console.error('❌ [DB] Error creating user:', err.message);
                    reject(err);
                } else {
                    console.log(`✅ [DB] User created with ID: ${this.lastID}`);
                    resolve({ id: this.lastID, username, email });
                }
            });
        });
    }

    async getUser(email) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM users WHERE email = ?`;
            
            this.db.get(sql, [email], (err, row) => {
                if (err) {
                    console.error('❌ [DB] Error getting user:', err.message);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async updateUser(userData) {
        return new Promise((resolve, reject) => {
            const { id, username, email, last_seen } = userData;
            const sql = `UPDATE users SET username = ?, email = ?, last_seen = ? WHERE id = ?`;
            
            this.db.run(sql, [username, email, last_seen || new Date().toISOString(), id], function(err) {
                if (err) {
                    console.error('❌ [DB] Error updating user:', err.message);
                    reject(err);
                } else {
                    console.log(`✅ [DB] User updated: ${username}`);
                    resolve({ id, username, email });
                }
            });
        });
    }

    // Методы для Telegram пользователей
    async createTelegramUser(telegramUser) {
        return new Promise((resolve, reject) => {
            const { telegram_id, balance, referrals, ref_code } = telegramUser;
            const sql = `INSERT INTO telegram_users (telegram_id, balance, referrals, ref_code) VALUES (?, ?, ?, ?)`;
            
            this.db.run(sql, [telegram_id, balance || 10, referrals || 0, ref_code], function(err) {
                if (err) {
                    console.error('❌ [DB] Error creating telegram user:', err.message);
                    reject(err);
                } else {
                    console.log(`✅ [DB] Telegram user created with ID: ${telegram_id}`);
                    resolve({ telegram_id, balance, referrals, ref_code });
                }
            });
        });
    }

    async getTelegramUser(telegramId) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM telegram_users WHERE telegram_id = ?`;
            
            this.db.get(sql, [telegramId], (err, row) => {
                if (err) {
                    console.error('❌ [DB] Error getting telegram user:', err.message);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async updateTelegramUser(telegramUser) {
        return new Promise((resolve, reject) => {
            const { telegram_id, balance, referrals, ref_code } = telegramUser;
            const sql = `UPDATE telegram_users SET balance = ?, referrals = ?, ref_code = ?, updated_at = ? WHERE telegram_id = ?`;
            
            this.db.run(sql, [balance, referrals, ref_code, new Date().toISOString(), telegram_id], function(err) {
                if (err) {
                    console.error('❌ [DB] Error updating telegram user:', err.message);
                    reject(err);
                } else {
                    console.log(`✅ [DB] Telegram user updated: ${telegram_id}`);
                    resolve({ telegram_id, balance, referrals, ref_code });
                }
            });
        });
    }

    async getAllTelegramUsers() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM telegram_users ORDER BY created_at DESC`;
            
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    console.error('❌ [DB] Error getting all telegram users:', err.message);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Методы для комнат
    async createRoom(roomData) {
        return new Promise((resolve, reject) => {
            const { room_id, display_name, max_players, status, password, host_id } = roomData;
            const sql = `INSERT INTO rooms (room_id, display_name, max_players, status, password, host_id) VALUES (?, ?, ?, ?, ?, ?)`;
            
            this.db.run(sql, [room_id, display_name, max_players, status, password, host_id], function(err) {
                if (err) {
                    console.error('❌ [DB] Error creating room:', err.message);
                    reject(err);
                } else {
                    console.log(`✅ [DB] Room created: ${room_id}`);
                    resolve({ id: this.lastID, room_id, display_name });
                }
            });
        });
    }

    async getRoom(roomId) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM rooms WHERE room_id = ?`;
            
            this.db.get(sql, [roomId], (err, row) => {
                if (err) {
                    console.error('❌ [DB] Error getting room:', err.message);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async updateRoom(roomData) {
        return new Promise((resolve, reject) => {
            const { room_id, display_name, max_players, current_players, status, password, host_id } = roomData;
            const sql = `UPDATE rooms SET display_name = ?, max_players = ?, current_players = ?, status = ?, password = ?, host_id = ? WHERE room_id = ?`;
            
            this.db.run(sql, [display_name, max_players, current_players, status, password, host_id, room_id], function(err) {
                if (err) {
                    console.error('❌ [DB] Error updating room:', err.message);
                    reject(err);
                } else {
                    console.log(`✅ [DB] Room updated: ${room_id}`);
                    resolve({ room_id, display_name });
                }
            });
        });
    }

    async getAllRooms() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM rooms ORDER BY created_at DESC`;
            
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    console.error('❌ [DB] Error getting all rooms:', err.message);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Закрытие соединения
    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    console.error('❌ [DB] Error closing database:', err.message);
                    reject(err);
                } else {
                    console.log('✅ [DB] Database connection closed');
                    resolve();
                }
            });
        });
    }
}

module.exports = Database;
