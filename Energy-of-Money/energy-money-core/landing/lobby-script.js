// Lobby Script
class LobbyManager {
    constructor() {
        this.currentUser = null;
        this.rooms = [];
        this.roomsUpdateInterval = null;
        
        this.init();
    }

    init() {
        console.log('🏠 [LobbyManager] Инициализация...');
        this.loadUser();
        this.setupEventListeners();
        this.loadAvailableRooms();
        this.startRoomsUpdate();
    }

    loadUser() {
        const savedUser = localStorage.getItem('energy_of_money_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                console.log('✅ [LobbyManager] Пользователь загружен:', this.currentUser);
                this.updateUserInfo();
            } catch (error) {
                console.error('❌ [LobbyManager] Ошибка загрузки пользователя:', error);
                this.redirectToAuth();
            }
        } else {
            console.log('⚠️ [LobbyManager] Пользователь не найден, перенаправляем на авторизацию');
            this.redirectToAuth();
        }
    }

    updateUserInfo() {
        const userInfo = document.getElementById('userInfo');
        if (userInfo && this.currentUser) {
            userInfo.textContent = `Добро пожаловать, ${this.currentUser.name}!`;
        }
    }

    redirectToAuth() {
        window.location.href = 'auth.html?return=lobby';
    }

    setupEventListeners() {
        // Кнопка выхода
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Кнопка создания комнаты
        const createRoomBtn = document.getElementById('createRoomBtn');
        if (createRoomBtn) {
            createRoomBtn.addEventListener('click', () => this.showCreateRoomModal());
        }

        // Кнопка обновления
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadAvailableRooms());
        }

        // Модалка создания комнаты
        const createRoomModal = document.getElementById('createRoomModal');
        const closeCreateModal = document.getElementById('closeCreateModal');
        const cancelCreate = document.getElementById('cancelCreate');
        
        if (closeCreateModal) {
            closeCreateModal.addEventListener('click', () => this.hideCreateRoomModal());
        }
        
        if (cancelCreate) {
            cancelCreate.addEventListener('click', () => this.hideCreateRoomModal());
        }

        // Форма создания комнаты
        const createRoomForm = document.getElementById('createRoomForm');
        if (createRoomForm) {
            createRoomForm.addEventListener('submit', (e) => this.handleCreateRoom(e));
        }

        // Закрытие модалки по клику вне её
        if (createRoomModal) {
            createRoomModal.addEventListener('click', (e) => {
                if (e.target === createRoomModal) {
                    this.hideCreateRoomModal();
                }
            });
        }
    }

    async loadAvailableRooms() {
        console.log('🏠 [LobbyManager] Загружаем доступные комнаты...');
        
        try {
            // Используем localStorage для демонстрации
            let rooms = JSON.parse(localStorage.getItem('gameRooms') || '[]');
            
            // Если комнат нет, создаем демо-комнаты
            if (rooms.length === 0) {
                rooms = [
                    {
                        id: 'demo1',
                        name: 'Демо комната 1',
                        currentPlayers: 2,
                        maxPlayers: 4,
                        status: 'waiting',
                        gameTime: 2,
                        password: null,
                        profession: 'engineer',
                        isPrivate: false,
                        createdAt: new Date().toISOString(),
                        creatorId: 'demo1',
                        creatorName: 'Демо игрок 1',
                        players: [
                            { id: 'demo1', name: 'Демо игрок 1', isReady: true, dream: 'financial_freedom' },
                            { id: 'demo2', name: 'Демо игрок 2', isReady: false, dream: null }
                        ]
                    }
                ];
                localStorage.setItem('gameRooms', JSON.stringify(rooms));
            }
            
            this.rooms = rooms;
            console.log('✅ [LobbyManager] Комнаты загружены:', rooms);
            this.displayRooms(rooms);
        } catch (error) {
            console.error('❌ [LobbyManager] Ошибка загрузки комнат:', error);
            this.showMessage('Ошибка загрузки комнат', 'error');
        }
    }

    displayRooms(rooms) {
        const roomsList = document.getElementById('roomsList');
        
        if (rooms.length === 0) {
            roomsList.innerHTML = '<div class="no-rooms">Нет доступных комнат</div>';
            return;
        }

        roomsList.innerHTML = rooms.map(room => `
            <div class="room-card" data-room-id="${room.id}">
                <div class="room-header">
                    <h3>${room.name}</h3>
                    <span class="status-badge ${room.status}">${this.getStatusText(room.status)}</span>
                </div>
                <div class="room-info">
                    <div class="room-creator">
                        <span class="label">Создатель:</span>
                        <span class="value">${room.creatorName}</span>
                    </div>
                    <div class="room-players">
                        <span class="label">Игроки:</span>
                        <span class="value">${room.currentPlayers}/${room.maxPlayers}</span>
                    </div>
                    <div class="room-details">
                        <span class="label">Время:</span>
                        <span class="value">${room.gameTime}ч</span>
                        <span class="label">Профессия:</span>
                        <span class="value">${this.getProfessionName(room.profession)}</span>
                    </div>
                    ${room.password ? '<div class="room-password">🔒 Защищена паролем</div>' : ''}
                </div>
                <div class="room-actions">
                    <button class="btn-primary join-room-btn" data-room-id="${room.id}">
                        Присоединиться
                    </button>
                </div>
            </div>
        `).join('');

        // Добавляем обработчики для кнопок присоединения
        document.querySelectorAll('.join-room-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roomId = e.target.getAttribute('data-room-id');
                this.joinRoom(roomId);
            });
        });
    }

    getStatusText(status) {
        const statusMap = {
            'waiting': 'Ожидание',
            'playing': 'Игра идет',
            'finished': 'Завершена'
        };
        return statusMap[status] || status;
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

    showCreateRoomModal() {
        const modal = document.getElementById('createRoomModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    hideCreateRoomModal() {
        const modal = document.getElementById('createRoomModal');
        if (modal) {
            modal.style.display = 'none';
            // Очищаем форму
            const form = document.getElementById('createRoomForm');
            if (form) {
                form.reset();
            }
        }
    }

    async handleCreateRoom(event) {
        event.preventDefault();
        console.log('🏠 [LobbyManager] Создаем комнату...');
        
        const formData = new FormData(event.target);
        const roomData = {
            name: formData.get('roomName'),
            maxPlayers: parseInt(formData.get('maxPlayers')),
            gameTime: parseInt(formData.get('gameTime')),
            password: formData.get('roomPassword') || null,
            profession: formData.get('profession'),
            isPrivate: formData.get('isPrivate') === 'on',
            creatorId: this.currentUser.id,
            creatorName: this.currentUser.name
        };
        
        // Показываем индикатор загрузки
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Создание...</span>';
        submitBtn.disabled = true;
        
        try {
            // Создаем комнату в localStorage
            const newRoom = {
                id: 'room' + Date.now(),
                name: roomData.name || 'Новая комната',
                currentPlayers: 1,
                maxPlayers: roomData.maxPlayers || 4,
                status: 'waiting',
                gameTime: roomData.gameTime || 2,
                password: roomData.password || null,
                profession: roomData.profession || null,
                isPrivate: roomData.isPrivate || false,
                createdAt: new Date().toISOString(),
                creatorId: roomData.creatorId || 'unknown',
                creatorName: roomData.creatorName || 'Неизвестный',
                players: [
                    { id: roomData.creatorId || 'unknown', name: roomData.creatorName || 'Неизвестный', isReady: false, dream: null }
                ]
            };
            
            // Сохраняем в localStorage
            let rooms = JSON.parse(localStorage.getItem('gameRooms') || '[]');
            rooms.push(newRoom);
            localStorage.setItem('gameRooms', JSON.stringify(rooms));
            
            console.log('✅ [LobbyManager] Комната создана:', newRoom);
            this.showMessage('Комната создана успешно!', 'success');
            
            // Закрываем модалку и обновляем список
            this.hideCreateRoomModal();
            this.loadAvailableRooms();
            
            // Переходим в комнату
            setTimeout(() => {
                this.joinRoom(newRoom.id);
            }, 1000);
            
        } catch (error) {
            console.error('❌ [LobbyManager] Ошибка создания комнаты:', error);
            this.showMessage('Ошибка создания комнаты', 'error');
        } finally {
            // Восстанавливаем кнопку
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    joinRoom(roomId) {
        console.log('🏠 [LobbyManager] Присоединяемся к комнате:', roomId);
        
        // Сохраняем ID комнаты для игры
        localStorage.setItem('currentRoomId', roomId);
        
        // Переходим на страницу игры
        window.location.href = `game.html?room=${roomId}`;
    }

    startRoomsUpdate() {
        // Обновляем комнаты каждые 5 секунд
        this.roomsUpdateInterval = setInterval(() => {
            this.loadAvailableRooms();
        }, 5000);
    }

    stopRoomsUpdate() {
        if (this.roomsUpdateInterval) {
            clearInterval(this.roomsUpdateInterval);
            this.roomsUpdateInterval = null;
        }
    }

    logout() {
        console.log('🚪 [LobbyManager] Выход из системы');
        localStorage.removeItem('energy_of_money_user');
        localStorage.removeItem('currentRoomId');
        this.stopRoomsUpdate();
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

// Инициализируем лобби при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new LobbyManager();
});
