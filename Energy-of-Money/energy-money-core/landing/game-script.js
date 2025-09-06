// Game Script
class GameManager {
    constructor() {
        this.currentUser = null;
        this.currentRoom = null;
        this.selectedDream = null;
        this.roomUpdateInterval = null;
        
        this.init();
    }

    init() {
        console.log('🎮 [GameManager] Инициализация...');
        this.loadUser();
        this.loadRoom();
        this.setupEventListeners();
        this.updateRoomDisplay();
    }

    loadUser() {
        const savedUser = localStorage.getItem('energy_of_money_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                console.log('✅ [GameManager] Пользователь загружен:', this.currentUser);
                this.updateUserInfo();
            } catch (error) {
                console.error('❌ [GameManager] Ошибка загрузки пользователя:', error);
                this.redirectToAuth();
            }
        } else {
            console.log('⚠️ [GameManager] Пользователь не найден, перенаправляем на авторизацию');
            this.redirectToAuth();
        }
    }

    loadRoom() {
        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('room') || localStorage.getItem('currentRoomId');
        
        if (!roomId) {
            console.log('⚠️ [GameManager] ID комнаты не найден, перенаправляем в лобби');
            this.redirectToLobby();
            return;
        }

        // Загружаем комнату из localStorage
        const rooms = JSON.parse(localStorage.getItem('gameRooms') || '[]');
        this.currentRoom = rooms.find(room => room.id === roomId);
        
        if (!this.currentRoom) {
            console.log('❌ [GameManager] Комната не найдена, перенаправляем в лобби');
            this.redirectToLobby();
            return;
        }

        console.log('✅ [GameManager] Комната загружена:', this.currentRoom);
        this.updateRoomInfo();
    }

    updateUserInfo() {
        const userInfo = document.getElementById('userInfo');
        if (userInfo && this.currentUser) {
            userInfo.textContent = this.currentUser.name;
        }
    }

    updateRoomInfo() {
        const roomTitle = document.getElementById('roomTitle');
        const roomStatus = document.getElementById('roomStatus');
        const roomPlayers = document.getElementById('roomPlayers');
        
        if (roomTitle) {
            roomTitle.textContent = this.currentRoom.name;
        }
        
        if (roomStatus) {
            roomStatus.textContent = this.getStatusText(this.currentRoom.status);
            roomStatus.className = `status-badge ${this.currentRoom.status}`;
        }
        
        if (roomPlayers) {
            roomPlayers.textContent = `${this.currentRoom.currentPlayers}/${this.currentRoom.maxPlayers} игроков`;
        }
    }

    getStatusText(status) {
        const statusMap = {
            'waiting': 'Ожидание',
            'playing': 'Игра идет',
            'finished': 'Завершена'
        };
        return statusMap[status] || status;
    }

    setupEventListeners() {
        // Кнопка возврата в лобби
        const backToLobbyBtn = document.getElementById('backToLobbyBtn');
        if (backToLobbyBtn) {
            backToLobbyBtn.addEventListener('click', () => this.redirectToLobby());
        }

        // Кнопка выхода
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Выбор мечты
        document.querySelectorAll('.dream-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const dream = e.currentTarget.getAttribute('data-dream');
                this.selectDream(dream);
            });
        });

        // Кнопка готовности
        const readyBtn = document.getElementById('readyBtn');
        if (readyBtn) {
            readyBtn.addEventListener('click', () => this.toggleReady());
        }

        // Кнопка начала игры
        const startGameBtn = document.getElementById('startGameBtn');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => this.startGame());
        }
    }

    selectDream(dream) {
        console.log('🎯 [GameManager] Выбираем мечту:', dream);
        
        // Убираем выделение с предыдущих карточек
        document.querySelectorAll('.dream-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Выделяем выбранную карточку
        const selectedCard = document.querySelector(`[data-dream="${dream}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        this.selectedDream = dream;
        
        // Показываем интерфейс комнаты
        this.showRoomInterface();
        
        this.showMessage('Мечта выбрана!', 'success');
    }

    showRoomInterface() {
        const dreamSelection = document.getElementById('dreamSelection');
        const roomInterface = document.getElementById('roomInterface');
        
        if (dreamSelection) {
            dreamSelection.style.display = 'none';
        }
        
        if (roomInterface) {
            roomInterface.style.display = 'block';
        }
        
        // Загружаем данные комнаты
        this.loadProfessionCard();
        this.loadPlayersList();
        this.updateRoomControls();
        
        // Начинаем обновление данных комнаты
        this.startRoomUpdate();
    }

    loadProfessionCard() {
        const professionCard = document.getElementById('professionCard');
        if (!professionCard || !this.currentRoom) return;
        
        const profession = this.currentRoom.profession;
        const professionName = this.getProfessionName(profession);
        
        professionCard.innerHTML = `
            <div class="profession-info">
                <h4>${professionName}</h4>
                <p>Профессия для всех игроков в комнате</p>
            </div>
        `;
    }

    getProfessionName(profession) {
        const professionMap = {
            'engineer': 'Инженер',
            'doctor': 'Врач',
            'teacher': 'Учитель',
            'lawyer': 'Юрист',
            'businessman': 'Бизнесмен'
        };
        return professionMap[profession] || profession;
    }

    loadPlayersList() {
        const playersList = document.getElementById('playersList');
        if (!playersList || !this.currentRoom) return;
        
        const players = this.currentRoom.players || [];
        const isCreator = this.currentRoom.creatorId === this.currentUser.id;
        
        playersList.innerHTML = players.map(player => `
            <div class="player-card ${player.isReady ? 'ready' : 'not-ready'}">
                <div class="player-info">
                    <div class="player-avatar">
                        ${player.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="player-details">
                        <div class="player-name">${player.name}</div>
                        <div class="player-status">
                            ${player.isReady ? '✅ Готов' : '⏳ Не готов'}
                        </div>
                        ${player.dream ? `<div class="player-dream">🎯 ${this.getDreamName(player.dream)}</div>` : ''}
                    </div>
                </div>
                ${isCreator && player.id !== this.currentUser.id ? 
                    `<button class="btn-danger remove-player-btn" data-player-id="${player.id}">Удалить</button>` : 
                    ''
                }
            </div>
        `).join('');
        
        // Добавляем обработчики для кнопок удаления
        document.querySelectorAll('.remove-player-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playerId = e.target.getAttribute('data-player-id');
                this.removePlayer(playerId);
            });
        });
    }

    getDreamName(dream) {
        const dreamMap = {
            'financial_freedom': 'Финансовая свобода',
            'business_empire': 'Бизнес-империя',
            'real_estate': 'Недвижимость',
            'investment_portfolio': 'Инвестиционный портфель'
        };
        return dreamMap[dream] || dream;
    }

    updateRoomControls() {
        const readyBtn = document.getElementById('readyBtn');
        const startGameBtn = document.getElementById('startGameBtn');
        const isCreator = this.currentRoom.creatorId === this.currentUser.id;
        
        if (readyBtn) {
            const currentPlayer = this.currentRoom.players.find(p => p.id === this.currentUser.id);
            if (currentPlayer) {
                readyBtn.textContent = currentPlayer.isReady ? 'Не готов' : 'Готов';
                readyBtn.className = currentPlayer.isReady ? 'btn-secondary' : 'btn-primary';
            }
        }
        
        if (startGameBtn) {
            startGameBtn.style.display = isCreator ? 'block' : 'none';
        }
    }

    async toggleReady() {
        console.log('🎮 [GameManager] Переключаем готовность');
        
        try {
            // Обновляем статус готовности в localStorage
            const rooms = JSON.parse(localStorage.getItem('gameRooms') || '[]');
            const room = rooms.find(r => r.id === this.currentRoom.id);
            
            if (room) {
                const player = room.players.find(p => p.id === this.currentUser.id);
                if (player) {
                    player.isReady = !player.isReady;
                    localStorage.setItem('gameRooms', JSON.stringify(rooms));
                    
                    // Обновляем текущую комнату
                    this.currentRoom = room;
                    this.updateRoomDisplay();
                    
                    this.showMessage(player.isReady ? 'Вы готовы!' : 'Вы не готовы', 'success');
                }
            }
        } catch (error) {
            console.error('❌ [GameManager] Ошибка переключения готовности:', error);
            this.showMessage('Ошибка обновления статуса', 'error');
        }
    }

    async startGame() {
        console.log('🎮 [GameManager] Начинаем игру');
        
        try {
            // Проверяем, что все игроки готовы
            const allReady = this.currentRoom.players.every(p => p.isReady);
            if (!allReady) {
                this.showMessage('Не все игроки готовы!', 'error');
                return;
            }
            
            // Обновляем статус комнаты
            const rooms = JSON.parse(localStorage.getItem('gameRooms') || '[]');
            const room = rooms.find(r => r.id === this.currentRoom.id);
            
            if (room) {
                room.status = 'playing';
                localStorage.setItem('gameRooms', JSON.stringify(rooms));
                
                this.currentRoom = room;
                this.updateRoomInfo();
                
                this.showMessage('Игра началась!', 'success');
                
                // Здесь можно добавить переход к игровому полю
                setTimeout(() => {
                    this.showMessage('Игровое поле будет добавлено в следующих версиях', 'info');
                }, 2000);
            }
        } catch (error) {
            console.error('❌ [GameManager] Ошибка начала игры:', error);
            this.showMessage('Ошибка начала игры', 'error');
        }
    }

    async removePlayer(playerId) {
        console.log('🎮 [GameManager] Удаляем игрока:', playerId);
        
        try {
            const rooms = JSON.parse(localStorage.getItem('gameRooms') || '[]');
            const room = rooms.find(r => r.id === this.currentRoom.id);
            
            if (room) {
                room.players = room.players.filter(p => p.id !== playerId);
                room.currentPlayers = room.players.length;
                localStorage.setItem('gameRooms', JSON.stringify(rooms));
                
                this.currentRoom = room;
                this.updateRoomDisplay();
                
                this.showMessage('Игрок удален', 'success');
            }
        } catch (error) {
            console.error('❌ [GameManager] Ошибка удаления игрока:', error);
            this.showMessage('Ошибка удаления игрока', 'error');
        }
    }

    updateRoomDisplay() {
        this.updateRoomInfo();
        this.loadPlayersList();
        this.updateRoomControls();
    }

    startRoomUpdate() {
        // Обновляем данные комнаты каждые 3 секунды
        this.roomUpdateInterval = setInterval(() => {
            this.loadRoom();
            this.updateRoomDisplay();
        }, 3000);
    }

    stopRoomUpdate() {
        if (this.roomUpdateInterval) {
            clearInterval(this.roomUpdateInterval);
            this.roomUpdateInterval = null;
        }
    }

    redirectToLobby() {
        this.stopRoomUpdate();
        window.location.href = 'lobby.html';
    }

    redirectToAuth() {
        this.stopRoomUpdate();
        window.location.href = 'auth.html?return=game';
    }

    logout() {
        console.log('🚪 [GameManager] Выход из системы');
        localStorage.removeItem('energy_of_money_user');
        localStorage.removeItem('currentRoomId');
        this.stopRoomUpdate();
        window.location.href = 'index.html';
    }

    showMessage(message, type = 'info') {
        const container = document.getElementById('messageContainer');
        if (!container) return;

        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        
        container.appendChild(messageEl);
        
        // Автоматически удаляем через 3 секунды
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 3000);
    }
}

// Инициализируем игру при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new GameManager();
});
