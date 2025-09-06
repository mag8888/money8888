// Game Integration for Energy of Money Landing
class GameIntegration {
    constructor() {
        this.currentUser = null;
        this.currentRoom = null;
        this.socket = null;
        this.gameComponents = {};
        this.professions = this.loadProfessions();
        this.init();
    }

    init() {
        console.log('🎮 [GameIntegration] Инициализация...');
        this.loadUserFromStorage();
        this.setupEventListeners();
        this.checkUrlParams();
    }

    loadUserFromStorage() {
        const savedUser = localStorage.getItem('energy_of_money_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                console.log('✅ [GameIntegration] Пользователь загружен:', this.currentUser);
            } catch (error) {
                console.error('❌ [GameIntegration] Ошибка загрузки пользователя:', error);
            }
        }
    }

    setupEventListeners() {
        // Обработчики для кнопок
        window.openGame = () => this.openGame();
        window.openAuthModal = () => this.openAuthModal();
        window.showLanding = () => this.showLanding();
        window.logout = () => this.logout();
    }

    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        
        if (action === 'play') {
            console.log('🎮 [GameIntegration] Обнаружен параметр action=play, открываем игру');
            setTimeout(() => {
                this.openGame();
            }, 500); // Небольшая задержка для загрузки страницы
        }
    }

    openGame() {
        console.log('🎮 [GameIntegration] Открываем игру...');
        console.log('🔍 [GameIntegration] Текущий пользователь:', this.currentUser);
        console.log('🔍 [GameIntegration] localStorage user:', localStorage.getItem('energy_of_money_user'));
        
        if (!this.currentUser) {
            console.log('⚠️ [GameIntegration] Пользователь не авторизован, перенаправляем на страницу авторизации');
            // Перенаправляем на страницу авторизации с параметром для возврата в игру
            window.location.href = 'auth.html?return=game';
            return;
        }

        this.showGamePage();
        this.loadGameComponents();
    }

    openAuthModal() {
        console.log('🔐 [GameIntegration] Показываем модалку авторизации');
        // Создаем простое модальное окно для авторизации
        this.createAuthModal();
    }

    createAuthModal() {
        // Удаляем существующее модальное окно если есть
        const existingModal = document.getElementById('authModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'authModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Вход в игру</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="auth-tabs">
                        <button class="tab-btn active" onclick="gameIntegration.switchAuthTab('login')">Вход</button>
                        <button class="tab-btn" onclick="gameIntegration.switchAuthTab('register')">Регистрация</button>
                    </div>
                    
                    <div id="loginForm" class="auth-form active">
                        <form onsubmit="gameIntegration.handleLogin(event)">
                            <div class="form-group">
                                <label for="loginEmail">Email</label>
                                <input type="email" id="loginEmail" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="loginPassword">Пароль</label>
                                <input type="password" id="loginPassword" name="password" required>
                            </div>
                            <button type="submit" class="btn-primary btn-full">Войти</button>
                        </form>
                    </div>
                    
                    <div id="registerForm" class="auth-form">
                        <form onsubmit="gameIntegration.handleRegister(event)">
                            <div class="form-group">
                                <label for="registerName">Имя</label>
                                <input type="text" id="registerName" name="name" required>
                            </div>
                            <div class="form-group">
                                <label for="registerEmail">Email</label>
                                <input type="email" id="registerEmail" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="registerPassword">Пароль</label>
                                <input type="password" id="registerPassword" name="password" required minlength="6">
                            </div>
                            <div class="form-group">
                                <label for="confirmPassword">Подтвердите пароль</label>
                                <input type="password" id="confirmPassword" name="confirmPassword" required>
                            </div>
                            <button type="submit" class="btn-primary btn-full">Зарегистрироваться</button>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.addModalStyles();
    }

    addModalStyles() {
        if (document.getElementById('modalStyles')) return;

        const styles = document.createElement('style');
        styles.id = 'modalStyles';
        styles.textContent = `
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(10px);
            }

            .modal-content {
                background: var(--space-dark);
                border-radius: 20px;
                padding: 0;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                border: 2px solid var(--gold-primary);
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 30px;
                border-bottom: 1px solid rgba(255, 215, 0, 0.2);
            }

            .modal-title {
                color: var(--gold-primary);
                font-size: 24px;
                font-weight: 700;
                margin: 0;
            }

            .modal-close {
                background: none;
                border: none;
                color: var(--gold-primary);
                font-size: 32px;
                cursor: pointer;
                padding: 0;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            }

            .modal-close:hover {
                background: rgba(255, 215, 0, 0.1);
            }

            .modal-body {
                padding: 30px;
            }

            .auth-tabs {
                display: flex;
                margin-bottom: 30px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 4px;
            }

            .tab-btn {
                flex: 1;
                padding: 12px 20px;
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.7);
                font-weight: 600;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .tab-btn.active {
                background: var(--gold-primary);
                color: var(--space-dark);
            }

            .auth-form {
                display: none;
            }

            .auth-form.active {
                display: block;
            }

            .form-group {
                margin-bottom: 20px;
            }

            .form-group label {
                display: block;
                color: rgba(255, 255, 255, 0.9);
                font-weight: 600;
                margin-bottom: 8px;
            }

            .form-group input {
                width: 100%;
                padding: 12px 16px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 215, 0, 0.3);
                border-radius: 8px;
                color: white;
                font-size: 16px;
                transition: all 0.3s ease;
            }

            .form-group input:focus {
                outline: none;
                border-color: var(--gold-primary);
                background: rgba(255, 255, 255, 0.15);
            }

            .form-group input::placeholder {
                color: rgba(255, 255, 255, 0.5);
            }

            .btn-full {
                width: 100%;
                justify-content: center;
            }
        `;
        document.head.appendChild(styles);
    }

    switchAuthTab(tab) {
        console.log('🔄 [GameIntegration] Переключаем на вкладку:', tab);
        
        // Убираем активный класс со всех вкладок и форм
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        
        // Активируем выбранную вкладку и форму
        document.querySelector(`[onclick="gameIntegration.switchAuthTab('${tab}')"]`).classList.add('active');
        document.getElementById(`${tab}Form`).classList.add('active');
    }

    async handleLogin(event) {
        event.preventDefault();
        console.log('🔐 [GameIntegration] Обрабатываем вход...');
        
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');
        
        try {
            // Простая локальная авторизация
            const user = {
                id: Date.now().toString(),
                email: email,
                name: email.split('@')[0],
                username: email.split('@')[0]
            };
            
            this.currentUser = user;
            localStorage.setItem('energy_of_money_user', JSON.stringify(user));
            console.log('✅ [GameIntegration] Пользователь авторизован:', user);
            
            // Закрываем модалку и открываем игру
            document.getElementById('authModal').remove();
            this.showSuccessMessage('Вход выполнен успешно!');
            setTimeout(() => {
                this.openGame();
            }, 1000);
        } catch (error) {
            console.error('❌ [GameIntegration] Ошибка входа:', error);
            this.showErrorMessage('Ошибка авторизации');
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        console.log('📝 [GameIntegration] Обрабатываем регистрацию...');
        
        const formData = new FormData(event.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        if (password !== confirmPassword) {
            alert('Пароли не совпадают!');
            return;
        }
        
        try {
            // Простая локальная регистрация
            const user = {
                id: Date.now().toString(),
                email: email,
                name: name,
                username: name
            };
            
            this.currentUser = user;
            localStorage.setItem('energy_of_money_user', JSON.stringify(user));
            console.log('✅ [GameIntegration] Пользователь зарегистрирован:', user);
            
            // Закрываем модалку и открываем игру
            document.getElementById('authModal').remove();
            this.showSuccessMessage('Регистрация выполнена успешно!');
            setTimeout(() => {
                this.openGame();
            }, 1000);
        } catch (error) {
            console.error('❌ [GameIntegration] Ошибка регистрации:', error);
            this.showErrorMessage('Ошибка регистрации');
        }
    }

    showGamePage() {
        console.log('🎮 [GameIntegration] Показываем страницу игры');
        document.getElementById('gamePage').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    showLanding() {
        console.log('🏠 [GameIntegration] Возвращаемся к лендингу');
        document.getElementById('gamePage').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    logout() {
        console.log('🚪 [GameIntegration] Выход из системы');
        this.currentUser = null;
        localStorage.removeItem('energy_of_money_user');
        this.showLanding();
    }

    loadGameComponents() {
        console.log('🎮 [GameIntegration] Загружаем компоненты игры...');
        
        const gameContainer = document.getElementById('gameContainer');
        
        // Создаем интерфейс лобби
        gameContainer.innerHTML = `
            <div class="lobby-interface">
                <div class="lobby-header">
                    <h2>Лобби - Добро пожаловать, ${this.currentUser.name}!</h2>
                    <button class="btn-outline" onclick="gameIntegration.logout()">Выйти</button>
                </div>
                
                <div class="lobby-actions">
                    <button class="btn-primary btn-large" onclick="gameIntegration.createRoom()">
                        <span>Создать комнату</span>
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                    </button>
                    <button class="btn-outline btn-large" onclick="gameIntegration.refreshRooms()">
                        <span>Обновить</span>
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                    </button>
                </div>
                
                <div class="rooms-section">
                    <h3>Доступные комнаты</h3>
                    <div id="roomsList" class="rooms-grid">
                        <div class="loading-rooms">Загружаем комнаты...</div>
                    </div>
                </div>
            </div>
        `;
        
        this.addLobbyStyles();
        this.loadAvailableRooms();
        
        // Обновляем комнаты каждые 5 секунд
        this.roomsUpdateInterval = setInterval(() => {
            this.loadAvailableRooms();
        }, 5000);
    }

    async loadAvailableRooms() {
        console.log('🏠 [GameIntegration] Загружаем доступные комнаты...');
        
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
            
            console.log('✅ [GameIntegration] Комнаты загружены:', rooms);
            this.displayRooms(rooms);
        } catch (error) {
            console.error('❌ [GameIntegration] Ошибка загрузки комнат:', error);
            this.showRoomsError('Ошибка загрузки комнат. Попробуйте позже.');
        }
    }

    displayRooms(rooms) {
        const roomsList = document.getElementById('roomsList');
        
        if (rooms.length === 0) {
            roomsList.innerHTML = `
                <div class="no-rooms">
                    <div class="no-rooms-icon">🏠</div>
                    <h3>Нет доступных комнат</h3>
                    <p>Создайте новую комнату или подождите, пока кто-то создаст</p>
                    <button class="btn-primary" onclick="gameIntegration.createRoom()">Создать комнату</button>
                </div>
            `;
            return;
        }
        
        let roomsHtml = '';
        
        rooms.forEach(room => {
            const professionName = this.getProfessionName(room.profession);
            const passwordStatus = room.password ? '🔒 Защищена паролем' : '🔓 Открытая';
            const gameTimeText = room.gameTime ? `${room.gameTime} ч` : 'Не указано';
            const readyPlayers = room.players ? room.players.filter(p => p.isReady).length : 0;
            const isUserInRoom = room.players ? room.players.some(p => p.id === this.currentUser.id) : false;
            const canJoin = room.currentPlayers < room.maxPlayers && !isUserInRoom && room.status === 'waiting';
            
            roomsHtml += `
                <div class="room-card ${isUserInRoom ? 'user-in-room' : ''}">
                    <div class="room-header">
                        <div class="room-title">
                            <h3>${room.name}</h3>
                            <span class="room-id">ID: ${room.id}</span>
                        </div>
                        <div class="room-status">
                            <span class="status-badge status-${room.status}">
                                ${room.status === 'waiting' ? 'Ожидание' : room.status === 'playing' ? 'Игра' : 'Завершена'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="room-creator">
                        <span class="creator-label">Создатель:</span>
                        <span class="creator-name">${room.creatorName}</span>
                    </div>
                    
                    <div class="room-players">
                        <div class="players-info">
                            <span class="players-count">${room.currentPlayers}/${room.maxPlayers}</span>
                            <span class="players-label">игроков</span>
                        </div>
                        <div class="ready-info">
                            <span class="ready-count">${readyPlayers}</span>
                            <span class="ready-label">готовы</span>
                        </div>
                    </div>
                    
                    <div class="room-details">
                        <div class="room-detail">
                            <span class="detail-icon">⏱️</span>
                            <span class="detail-text">${gameTimeText}</span>
                        </div>
                        <div class="room-detail">
                            <span class="detail-icon">👤</span>
                            <span class="detail-text">${professionName}</span>
                        </div>
                        <div class="room-detail">
                            <span class="detail-icon">${room.password ? '🔒' : '🔓'}</span>
                            <span class="detail-text">${room.password ? 'Защищена' : 'Открытая'}</span>
                        </div>
                    </div>
                    
                    <div class="room-actions">
                        ${isUserInRoom ? `
                            <button class="btn-outline" onclick="gameIntegration.leaveRoom('${room.id}')">
                                Покинуть
                            </button>
                            <button class="btn-primary" onclick="gameIntegration.toggleReady('${room.id}')">
                                ${room.players.find(p => p.id === this.currentUser.id)?.isReady ? 'Не готов' : 'Готов'}
                            </button>
                            ${room.creatorId === this.currentUser.id ? `
                                <button class="btn-success" onclick="gameIntegration.startGame('${room.id}')">
                                    Начать игру
                                </button>
                            ` : ''}
                        ` : `
                            <button class="btn-primary" onclick="gameIntegration.joinRoomById('${room.id}')" ${!canJoin ? 'disabled' : ''}>
                                ${!canJoin ? 'Нельзя присоединиться' : 'Присоединиться'}
                            </button>
                        `}
                    </div>
                </div>
            `;
        });
        
        roomsList.innerHTML = roomsHtml;
    }

    loadProfessions() {
        return [
            { id: 1, name: "Уборщик", icon: "🧹", salary: 1800, cashFlow: 1296, difficulty: "easy", description: "Уборка помещений и территорий" },
            { id: 2, name: "Курьер", icon: "🚚", salary: 2200, cashFlow: 1430, difficulty: "easy", description: "Доставка товаров и документов" },
            { id: 3, name: "Продавец", icon: "🛍️", salary: 2800, cashFlow: 1820, difficulty: "easy", description: "Работа в торговле и розничных продажах" },
            { id: 4, name: "Водитель", icon: "🚗", salary: 3200, cashFlow: 2080, difficulty: "easy", description: "Управление транспортными средствами" },
            { id: 5, name: "Учитель", icon: "📚", salary: 3500, cashFlow: 1900, difficulty: "medium", description: "Преподавание в школе" },
            { id: 6, name: "Медсестра", icon: "🏥", salary: 4200, cashFlow: 2270, difficulty: "medium", description: "Медицинское обслуживание" },
            { id: 7, name: "Инженер", icon: "⚙️", salary: 5500, cashFlow: 3000, difficulty: "medium", description: "Техническое проектирование и разработка" },
            { id: 8, name: "IT-разработчик", icon: "💻", salary: 6000, cashFlow: 3250, difficulty: "medium", description: "Разработка программного обеспечения" },
            { id: 9, name: "Врач", icon: "👨‍⚕️", salary: 7500, cashFlow: 4100, difficulty: "hard", description: "Медицинская практика" },
            { id: 10, name: "Юрист", icon: "⚖️", salary: 6500, cashFlow: 3445, difficulty: "hard", description: "Юридические услуги и консультации" },
            { id: 11, name: "Бизнесмен", icon: "💼", salary: 8000, cashFlow: 5600, difficulty: "hard", description: "Владелец малого бизнеса" },
            { id: 12, name: "Предприниматель", icon: "🚀", salary: 10000, cashFlow: 3800, difficulty: "hard", description: "Владелец успешного бизнеса" }
        ];
    }

    getProfessionById(id) {
        return this.professions.find(p => p.id === parseInt(id));
    }

    getProfessionName(professionKey) {
        const profession = this.getProfessionById(professionKey);
        return profession ? profession.name : professionKey;
    }

    updateProfessionPreview() {
        const select = document.getElementById('profession');
        const preview = document.getElementById('professionPreview');
        const detailsBtn = document.getElementById('professionDetailsBtn');
        
        if (select.value) {
            const profession = this.getProfessionById(select.value);
            if (profession) {
                const difficultyText = {
                    'easy': 'Легкая',
                    'medium': 'Средняя', 
                    'hard': 'Сложная'
                };
                
                preview.innerHTML = `
                    <div class="profession-preview-card">
                        <div class="profession-header">
                            <span class="profession-icon">${profession.icon}</span>
                            <div class="profession-info">
                                <h4>${profession.name}</h4>
                                <span class="difficulty-badge difficulty-${profession.difficulty}">${difficultyText[profession.difficulty]}</span>
                            </div>
                        </div>
                        <div class="profession-stats">
                            <div class="stat-item">
                                <span class="stat-label">Зарплата:</span>
                                <span class="stat-value">$${profession.salary.toLocaleString()}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Денежный поток:</span>
                                <span class="stat-value">$${profession.cashFlow.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                `;
                preview.style.display = 'block';
                detailsBtn.disabled = false;
            }
        } else {
            preview.style.display = 'none';
            detailsBtn.disabled = true;
        }
    }

    showProfessionDetails() {
        const select = document.getElementById('profession');
        if (!select.value) return;
        
        const profession = this.getProfessionById(select.value);
        if (!profession) return;
        
        // Создаем модальное окно с детальной информацией
        this.createProfessionModal(profession);
    }

    createProfessionModal(profession) {
        // Удаляем существующее модальное окно если есть
        const existingModal = document.getElementById('professionModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Получаем полные данные профессии
        const fullProfession = this.getFullProfessionData(profession);

        const modal = document.createElement('div');
        modal.id = 'professionModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content profession-modal-full">
                <div class="modal-header">
                    <h2>${profession.icon} ${profession.name}</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="profession-card-full">
                        <!-- Заголовок профессии -->
                        <div class="profession-card-header">
                            <div class="profession-icon-large">${profession.icon}</div>
                            <div class="profession-title-section">
                                <h1 class="profession-title">${profession.name}</h1>
                                <p class="profession-subtitle">${profession.description}</p>
                            </div>
                        </div>

                        <!-- Финансовые блоки -->
                        <div class="financial-summary">
                            <div class="financial-box income-box">
                                <div class="financial-amount income-amount">$${profession.salary.toLocaleString()}</div>
                                <div class="financial-label">Зарплата</div>
                            </div>
                            <div class="financial-box expenses-box">
                                <div class="financial-amount expenses-amount">$${fullProfession.totalExpenses.toLocaleString()}</div>
                                <div class="financial-label">Расходы</div>
                            </div>
                            <div class="financial-box cashflow-box">
                                <div class="financial-amount cashflow-amount">$${profession.cashFlow.toLocaleString()}</div>
                                <div class="financial-label">Денежный поток</div>
                            </div>
                        </div>

                        <!-- Детальная информация о расходах -->
                        <div class="expenses-details">
                            <div class="expense-item">
                                <span class="expense-name">Налоги</span>
                                <span class="expense-amount">$${fullProfession.taxAmount.toLocaleString()} (${Math.round(fullProfession.taxRate * 100)}%)</span>
                            </div>
                            <div class="expense-item">
                                <span class="expense-name">Прочие расходы</span>
                                <span class="expense-amount">$${fullProfession.otherExpenses.toLocaleString()}</span>
                            </div>
                            ${fullProfession.creditAuto > 0 ? `
                            <div class="expense-item">
                                <span class="expense-name">Кредит на авто</span>
                                <span class="expense-amount">$${fullProfession.creditAuto.toLocaleString()} <span class="principal">$${fullProfession.creditAutoPrincipal.toLocaleString()} (тело)</span></span>
                            </div>
                            ` : ''}
                            ${fullProfession.creditEducation > 0 ? `
                            <div class="expense-item">
                                <span class="expense-name">Образовательный кредит</span>
                                <span class="expense-amount">$${fullProfession.creditEducation.toLocaleString()} <span class="principal">$${fullProfession.creditEducationPrincipal.toLocaleString()} (тело)</span></span>
                            </div>
                            ` : ''}
                            ${fullProfession.creditHousing > 0 ? `
                            <div class="expense-item">
                                <span class="expense-name">Ипотека</span>
                                <span class="expense-amount">$${fullProfession.creditHousing.toLocaleString()} <span class="principal">$${fullProfession.creditHousingPrincipal.toLocaleString()} (тело)</span></span>
                            </div>
                            ` : ''}
                            ${fullProfession.creditCards > 0 ? `
                            <div class="expense-item">
                                <span class="expense-name">Кредитные карты</span>
                                <span class="expense-amount">$${fullProfession.creditCards.toLocaleString()} <span class="principal">$${fullProfession.creditCardsPrincipal.toLocaleString()} (тело)</span></span>
                            </div>
                            ` : ''}
                            ${fullProfession.childExpenses > 0 ? `
                            <div class="expense-item">
                                <span class="expense-name">Расходы на ребенка</span>
                                <span class="expense-amount">$${fullProfession.childExpenses.toLocaleString()}</span>
                            </div>
                            ` : ''}
                        </div>

                        <!-- Итого кредитов -->
                        ${fullProfession.totalLoanPrincipal > 0 ? `
                        <div class="total-loans">
                            <span class="total-loans-label">Итого тело кредитов</span>
                            <span class="total-loans-amount">$${fullProfession.totalLoanPrincipal.toLocaleString()}</span>
                        </div>
                        ` : ''}

                        <!-- Бонусы и особенности -->
                        <div class="profession-bonuses">
                            ${fullProfession.bonusCards > 0 ? `
                            <div class="bonus-item">
                                <span class="bonus-icon">🎯</span>
                                <span class="bonus-text">+${fullProfession.bonusCards} карт(ы) возможности</span>
                            </div>
                            ` : ''}
                            <div class="bonus-item">
                                <span class="bonus-icon">💰</span>
                                <span class="bonus-text">Начальный баланс: $${fullProfession.balance.toLocaleString()}</span>
                            </div>
                        </div>

                        <!-- Кнопки действий -->
                        <div class="profession-actions">
                            <button class="btn-profession ${profession.category}" disabled>
                                ${this.getCategoryName(profession.category)}
                            </button>
                            <button class="btn-difficulty difficulty-${profession.difficulty}" disabled>
                                ${profession.difficulty === 'easy' ? 'Легкий' : profession.difficulty === 'medium' ? 'Средний' : 'Сложный'}
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="this.closest('.modal').remove()">Понятно</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.addProfessionModalStyles();
    }

    getFullProfessionData(profession) {
        // Полные данные профессий из Energy of Money
        const fullProfessions = {
            1: { // Уборщик
                taxRate: 0.13, taxAmount: 234, otherExpenses: 270,
                creditAuto: 0, creditEducation: 0, creditHousing: 0, creditCards: 0,
                creditAutoPrincipal: 0, creditEducationPrincipal: 0, creditHousingPrincipal: 0, creditCardsPrincipal: 0,
                childExpenses: 0, bonusCards: 2, balance: 1000, category: 'service'
            },
            2: { // Курьер
                taxRate: 0.13, taxAmount: 286, otherExpenses: 330,
                creditAuto: 154, creditEducation: 0, creditHousing: 0, creditCards: 0,
                creditAutoPrincipal: 14000, creditEducationPrincipal: 0, creditHousingPrincipal: 0, creditCardsPrincipal: 0,
                childExpenses: 0, bonusCards: 1, balance: 1500, category: 'service'
            },
            3: { // Продавец
                taxRate: 0.13, taxAmount: 364, otherExpenses: 420,
                creditAuto: 196, creditEducation: 0, creditHousing: 0, creditCards: 0,
                creditAutoPrincipal: 14000, creditEducationPrincipal: 0, creditHousingPrincipal: 0, creditCardsPrincipal: 0,
                childExpenses: 0, bonusCards: 1, balance: 2000, category: 'sales'
            },
            4: { // Водитель
                taxRate: 0.13, taxAmount: 416, otherExpenses: 480,
                creditAuto: 224, creditEducation: 0, creditHousing: 0, creditCards: 0,
                creditAutoPrincipal: 14000, creditEducationPrincipal: 0, creditHousingPrincipal: 0, creditCardsPrincipal: 0,
                childExpenses: 0, bonusCards: 1, balance: 2500, category: 'transport'
            },
            5: { // Учитель
                taxRate: 0.13, taxAmount: 455, otherExpenses: 525,
                creditAuto: 245, creditEducation: 175, creditHousing: 0, creditCards: 0,
                creditAutoPrincipal: 14000, creditEducationPrincipal: 10000, creditHousingPrincipal: 0, creditCardsPrincipal: 0,
                childExpenses: 200, bonusCards: 0, balance: 3000, category: 'education'
            },
            6: { // Медсестра
                taxRate: 0.13, taxAmount: 546, otherExpenses: 630,
                creditAuto: 294, creditEducation: 210, creditHousing: 0, creditCards: 0,
                creditAutoPrincipal: 14000, creditEducationPrincipal: 10000, creditHousingPrincipal: 0, creditCardsPrincipal: 0,
                childExpenses: 250, bonusCards: 0, balance: 3500, category: 'healthcare'
            },
            7: { // Инженер
                taxRate: 0.13, taxAmount: 715, otherExpenses: 825,
                creditAuto: 385, creditEducation: 275, creditHousing: 0, creditCards: 0,
                creditAutoPrincipal: 14000, creditEducationPrincipal: 10000, creditHousingPrincipal: 0, creditCardsPrincipal: 0,
                childExpenses: 300, bonusCards: 0, balance: 4500, category: 'engineering'
            },
            8: { // IT-разработчик
                taxRate: 0.13, taxAmount: 780, otherExpenses: 900,
                creditAuto: 420, creditEducation: 300, creditHousing: 0, creditCards: 0,
                creditAutoPrincipal: 14000, creditEducationPrincipal: 10000, creditHousingPrincipal: 0, creditCardsPrincipal: 0,
                childExpenses: 350, bonusCards: 0, balance: 5000, category: 'technology'
            },
            9: { // Врач
                taxRate: 0.13, taxAmount: 975, otherExpenses: 1125,
                creditAuto: 525, creditEducation: 375, creditHousing: 0, creditCards: 0,
                creditAutoPrincipal: 14000, creditEducationPrincipal: 10000, creditHousingPrincipal: 0, creditCardsPrincipal: 0,
                childExpenses: 400, bonusCards: 0, balance: 6000, category: 'healthcare'
            },
            10: { // Юрист
                taxRate: 0.13, taxAmount: 845, otherExpenses: 975,
                creditAuto: 455, creditEducation: 325, creditHousing: 0, creditCards: 0,
                creditAutoPrincipal: 14000, creditEducationPrincipal: 10000, creditHousingPrincipal: 0, creditCardsPrincipal: 0,
                childExpenses: 400, bonusCards: 0, balance: 5000, category: 'legal'
            },
            11: { // Бизнесмен
                taxRate: 0.13, taxAmount: 1040, otherExpenses: 1200,
                creditAuto: 560, creditEducation: 400, creditHousing: 0, creditCards: 0,
                creditAutoPrincipal: 14000, creditEducationPrincipal: 10000, creditHousingPrincipal: 0, creditCardsPrincipal: 0,
                childExpenses: 400, bonusCards: 0, balance: 7000, category: 'business'
            },
            12: { // Предприниматель
                taxRate: 0.13, taxAmount: 1300, otherExpenses: 1500,
                creditAuto: 700, creditEducation: 500, creditHousing: 1200, creditCards: 1000,
                creditAutoPrincipal: 14000, creditEducationPrincipal: 10000, creditHousingPrincipal: 240000, creditCardsPrincipal: 20000,
                childExpenses: 400, bonusCards: 0, balance: 3000, category: 'business'
            }
        };

        const fullData = fullProfessions[profession.id] || {};
        const totalExpenses = fullData.taxAmount + fullData.otherExpenses + fullData.creditAuto + 
                            fullData.creditEducation + fullData.creditHousing + fullData.creditCards + fullData.childExpenses;
        const totalLoanPrincipal = fullData.creditAutoPrincipal + fullData.creditEducationPrincipal + 
                                 fullData.creditHousingPrincipal + fullData.creditCardsPrincipal;

        return {
            ...fullData,
            totalExpenses,
            totalLoanPrincipal
        };
    }

    getCategoryName(category) {
        const categories = {
            'service': 'Сервис',
            'sales': 'Продажи',
            'transport': 'Транспорт',
            'education': 'Образование',
            'healthcare': 'Здравоохранение',
            'engineering': 'Инженерия',
            'technology': 'Технологии',
            'legal': 'Право',
            'business': 'Бизнес'
        };
        return categories[category] || category;
    }

    getDifficultyDescription(difficulty) {
        const descriptions = {
            'easy': 'Идеально для новичков. Простые профессии с небольшим доходом, но и небольшими расходами.',
            'medium': 'Для опытных игроков. Средний уровень сложности с балансом дохода и расходов.',
            'hard': 'Для экспертов. Высокий доход, но и высокие расходы. Требует стратегического планирования.'
        };
        return descriptions[difficulty] || '';
    }

    addProfessionModalStyles() {
        if (document.getElementById('professionModalStyles')) return;

        const styles = document.createElement('style');
        styles.id = 'professionModalStyles';
        styles.textContent = `
            .profession-selector {
                display: flex;
                gap: 10px;
                align-items: center;
            }

            .profession-selector select {
                flex: 1;
            }

            .profession-preview {
                margin-top: 15px;
            }

            .profession-preview-card {
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 215, 0, 0.3);
                border-radius: 12px;
                padding: 15px;
                backdrop-filter: blur(10px);
            }

            .profession-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 15px;
            }

            .profession-icon {
                font-size: 24px;
            }

            .profession-info h4 {
                color: var(--gold-primary);
                margin: 0 0 5px 0;
                font-size: 18px;
            }

            .difficulty-badge {
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
            }

            .difficulty-easy {
                background: rgba(16, 185, 129, 0.2);
                color: #10b981;
            }

            .difficulty-medium {
                background: rgba(245, 158, 11, 0.2);
                color: #f59e0b;
            }

            .difficulty-hard {
                background: rgba(239, 68, 68, 0.2);
                color: #ef4444;
            }

            .profession-stats {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }

            .stat-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .stat-label {
                color: rgba(255, 255, 255, 0.8);
                font-size: 14px;
            }

            .stat-value {
                color: var(--gold-primary);
                font-weight: 600;
                font-size: 16px;
            }

            .profession-modal-full {
                max-width: 800px;
                width: 95%;
                max-height: 90vh;
                overflow-y: auto;
            }

            .profession-card-full {
                background: white;
                border-radius: 20px;
                padding: 30px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                color: #333;
                font-family: 'Arial', sans-serif;
            }

            .profession-card-header {
                display: flex;
                align-items: center;
                gap: 20px;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #f0f0f0;
            }

            .profession-icon-large {
                font-size: 60px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                width: 80px;
                height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            }

            .profession-title-section h1 {
                font-size: 32px;
                font-weight: bold;
                color: #2d3748;
                margin: 0 0 8px 0;
            }

            .profession-subtitle {
                font-size: 16px;
                color: #718096;
                margin: 0;
            }

            .financial-summary {
                display: grid;
                grid-template-columns: 1fr 1fr 2fr;
                gap: 20px;
                margin-bottom: 30px;
            }

            .financial-box {
                padding: 20px;
                border-radius: 15px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }

            .income-box {
                background: linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%);
                border: 2px solid #38b2ac;
            }

            .expenses-box {
                background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
                border: 2px solid #e53e3e;
            }

            .cashflow-box {
                background: linear-gradient(135deg, #e6f3ff 0%, #bee3f8 100%);
                border: 2px solid #3182ce;
            }

            .financial-amount {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 8px;
            }

            .income-amount { color: #2c7a7b; }
            .expenses-amount { color: #c53030; }
            .cashflow-amount { color: #2b6cb0; }

            .financial-label {
                font-size: 14px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .expenses-details {
                background: #f8f9fa;
                border-radius: 15px;
                padding: 25px;
                margin-bottom: 25px;
            }

            .expense-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid #e2e8f0;
            }

            .expense-item:last-child {
                border-bottom: none;
            }

            .expense-name {
                font-weight: 600;
                color: #4a5568;
            }

            .expense-amount {
                font-weight: bold;
                color: #2d3748;
            }

            .principal {
                color: #a0aec0;
                font-size: 14px;
                margin-left: 8px;
            }

            .total-loans {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #fef5e7;
                border: 2px solid #f6ad55;
                border-radius: 12px;
                padding: 15px 20px;
                margin-bottom: 25px;
            }

            .total-loans-label {
                font-weight: 600;
                color: #744210;
            }

            .total-loans-amount {
                font-size: 20px;
                font-weight: bold;
                color: #744210;
            }

            .profession-bonuses {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
                margin-bottom: 25px;
            }

            .bonus-item {
                display: flex;
                align-items: center;
                gap: 8px;
                background: #f0fff4;
                border: 1px solid #9ae6b4;
                border-radius: 20px;
                padding: 8px 16px;
                font-size: 14px;
                font-weight: 600;
                color: #22543d;
            }

            .bonus-icon {
                font-size: 16px;
            }

            .profession-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
            }

            .btn-profession, .btn-difficulty {
                padding: 12px 24px;
                border-radius: 25px;
                font-weight: 600;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                cursor: not-allowed;
                opacity: 0.7;
            }

            .btn-profession {
                background: #f7fafc;
                border: 2px solid #e2e8f0;
                color: #4a5568;
            }

            .btn-difficulty {
                color: white;
            }

            .btn-difficulty.difficulty-easy {
                background: #48bb78;
            }

            .btn-difficulty.difficulty-medium {
                background: #ed8936;
            }

            .btn-difficulty.difficulty-hard {
                background: #f56565;
            }

            .profession-details {
                text-align: left;
            }

            .profession-description {
                margin-bottom: 25px;
            }

            .profession-description p {
                color: rgba(255, 255, 255, 0.9);
                font-size: 16px;
                line-height: 1.6;
                margin: 0;
            }

            .profession-financials h3,
            .profession-difficulty h3 {
                color: var(--gold-primary);
                font-size: 18px;
                margin-bottom: 15px;
            }

            .financial-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                margin-bottom: 25px;
            }

            .financial-item {
                padding: 15px;
                border-radius: 10px;
                text-align: center;
            }

            .financial-item.income {
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid rgba(16, 185, 129, 0.3);
            }

            .financial-item.expenses {
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.3);
            }

            .financial-item.cashflow {
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.3);
            }

            .financial-label {
                color: rgba(255, 255, 255, 0.8);
                font-size: 14px;
                margin-bottom: 5px;
            }

            .financial-value {
                color: white;
                font-size: 18px;
                font-weight: bold;
            }

            .difficulty-info {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .difficulty-info p {
                color: rgba(255, 255, 255, 0.8);
                font-size: 14px;
                line-height: 1.5;
                margin: 0;
            }
        `;
        document.head.appendChild(styles);
    }

    showRoomsError(message) {
        const roomsList = document.getElementById('roomsList');
        roomsList.innerHTML = `
            <div class="rooms-error">
                <div class="error-icon">⚠️</div>
                <h4>Ошибка загрузки</h4>
                <p>${message}</p>
                <button class="btn-outline" onclick="gameIntegration.loadAvailableRooms()">Попробовать снова</button>
            </div>
        `;
    }

    addGameStyles() {
        if (document.getElementById('gameStyles')) return;

        const styles = document.createElement('style');
        styles.id = 'gameStyles';
        styles.textContent = `
            .game-page {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: var(--space-gradient);
                z-index: 9999;
                overflow-y: auto;
            }

            .game-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 40px;
                background: rgba(0, 0, 0, 0.3);
                border-bottom: 1px solid rgba(255, 215, 0, 0.2);
            }

            .game-logo {
                display: flex;
                align-items: center;
                gap: 12px;
                font-weight: 700;
                font-size: 24px;
                color: var(--gold-primary);
            }

            .game-actions {
                display: flex;
                gap: 16px;
            }

            .game-content {
                padding: 40px;
                max-width: 1200px;
                margin: 0 auto;
            }

            .rooms-interface {
                text-align: center;
            }

            .rooms-welcome h2 {
                color: var(--gold-primary);
                font-size: 32px;
                margin-bottom: 16px;
            }

            .rooms-welcome p {
                color: rgba(255, 255, 255, 0.8);
                font-size: 18px;
                margin-bottom: 40px;
            }

            .rooms-actions {
                display: flex;
                gap: 20px;
                justify-content: center;
                margin-bottom: 50px;
                flex-wrap: wrap;
            }

            .rooms-list-section {
                text-align: left;
            }

            .rooms-list-section h3 {
                color: var(--gold-primary);
                font-size: 24px;
                margin-bottom: 20px;
                text-align: center;
            }

            .rooms-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .room-card {
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 215, 0, 0.3);
                border-radius: 15px;
                padding: 20px;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }

            .room-card.joinable {
                cursor: pointer;
            }

            .room-card.joinable:hover {
                transform: translateY(-5px);
                border-color: var(--gold-primary);
                background: rgba(255, 215, 0, 0.1);
                box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2);
            }

            .room-card.full {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .room-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }

            .room-header h4 {
                color: var(--gold-primary);
                font-size: 18px;
                margin: 0;
            }

            .room-status {
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
            }

            .status-waiting {
                background: rgba(16, 185, 129, 0.2);
                color: #10b981;
            }

            .status-playing {
                background: rgba(59, 130, 246, 0.2);
                color: #3b82f6;
            }

            .room-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }

            .room-players {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .players-count {
                color: var(--gold-primary);
                font-size: 20px;
                font-weight: bold;
            }

            .players-label {
                color: rgba(255, 255, 255, 0.7);
                font-size: 14px;
            }

            .room-time {
                color: var(--gold-primary);
                font-size: 14px;
                font-weight: 600;
            }

            .room-details {
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px solid rgba(255, 215, 0, 0.2);
            }

            .room-profession {
                color: rgba(255, 255, 255, 0.8);
                font-size: 14px;
                margin-bottom: 5px;
            }

            .room-password {
                color: rgba(255, 215, 0, 0.8);
                font-size: 12px;
                font-weight: 600;
            }

            .btn-small {
                padding: 8px 16px;
                font-size: 14px;
            }

            .room-full {
                color: rgba(255, 255, 255, 0.5);
                font-size: 14px;
                text-align: center;
                padding: 8px;
            }

            .no-rooms, .rooms-error {
                text-align: center;
                padding: 40px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 15px;
                border: 2px solid rgba(255, 215, 0, 0.2);
            }

            .no-rooms-icon, .error-icon {
                font-size: 48px;
                margin-bottom: 20px;
            }

            .no-rooms h4, .rooms-error h4 {
                color: var(--gold-primary);
                font-size: 20px;
                margin-bottom: 10px;
            }

            .no-rooms p, .rooms-error p {
                color: rgba(255, 255, 255, 0.8);
                margin-bottom: 20px;
            }

            .loading-rooms {
                text-align: center;
                padding: 40px;
                color: rgba(255, 255, 255, 0.8);
                font-size: 18px;
            }
        `;
        document.head.appendChild(styles);
    }

    addCreateRoomStyles() {
        if (document.getElementById('createRoomStyles')) return;

        const styles = document.createElement('style');
        styles.id = 'createRoomStyles';
        styles.textContent = `
            .create-room-interface {
                max-width: 600px;
                margin: 0 auto;
                text-align: center;
            }

            .create-room-header h2 {
                color: var(--gold-primary);
                font-size: 28px;
                margin-bottom: 16px;
            }

            .create-room-header p {
                color: rgba(255, 255, 255, 0.8);
                font-size: 16px;
                margin-bottom: 40px;
            }

            .create-room-form {
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 215, 0, 0.3);
                border-radius: 20px;
                padding: 40px;
                backdrop-filter: blur(10px);
            }

            .create-room-form .form-group {
                margin-bottom: 25px;
                text-align: left;
            }

            .create-room-form .form-group label {
                display: block;
                color: rgba(255, 255, 255, 0.9);
                font-weight: 600;
                margin-bottom: 10px;
                font-size: 16px;
            }

            .create-room-form .form-group input,
            .create-room-form .form-group select {
                width: 100%;
                padding: 15px 20px;
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 215, 0, 0.3);
                border-radius: 12px;
                color: white;
                font-size: 16px;
                transition: all 0.3s ease;
                box-sizing: border-box;
            }

            .create-room-form .form-group input:focus,
            .create-room-form .form-group select:focus {
                outline: none;
                border-color: var(--gold-primary);
                background: rgba(255, 255, 255, 0.15);
                box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
            }

            .create-room-form .form-group input::placeholder {
                color: rgba(255, 255, 255, 0.5);
            }

            .create-room-form .form-group select option {
                background: var(--space-dark);
                color: white;
            }

            .checkbox-label {
                display: flex;
                align-items: center;
                cursor: pointer;
                font-size: 16px;
                color: rgba(255, 255, 255, 0.9);
            }

            .checkbox-label input[type="checkbox"] {
                display: none;
            }

            .checkmark {
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255, 215, 0, 0.3);
                border-radius: 4px;
                margin-right: 12px;
                position: relative;
                transition: all 0.3s ease;
            }

            .checkbox-label input[type="checkbox"]:checked + .checkmark {
                background: var(--gold-primary);
                border-color: var(--gold-primary);
            }

            .checkbox-label input[type="checkbox"]:checked + .checkmark::after {
                content: '✓';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: var(--space-dark);
                font-weight: bold;
                font-size: 14px;
            }

            .form-actions {
                display: flex;
                gap: 20px;
                justify-content: center;
                margin-top: 30px;
            }

            .form-actions button {
                min-width: 150px;
            }
        `;
        document.head.appendChild(styles);
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Удаляем существующие сообщения
        const existingMessage = document.querySelector('.game-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `game-message game-message-${type}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <span class="message-icon">${type === 'success' ? '✅' : '❌'}</span>
                <span class="message-text">${message}</span>
            </div>
        `;

        // Добавляем стили для сообщения
        if (!document.getElementById('gameMessageStyles')) {
            const styles = document.createElement('style');
            styles.id = 'gameMessageStyles';
            styles.textContent = `
                .game-message {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    padding: 15px 20px;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    backdrop-filter: blur(10px);
                    animation: slideInRight 0.3s ease;
                }

                .game-message-success {
                    background: rgba(16, 185, 129, 0.9);
                    border: 1px solid rgba(16, 185, 129, 0.5);
                    color: white;
                }

                .game-message-error {
                    background: rgba(239, 68, 68, 0.9);
                    border: 1px solid rgba(239, 68, 68, 0.5);
                    color: white;
                }

                .message-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .message-icon {
                    font-size: 18px;
                }

                .message-text {
                    font-weight: 600;
                }

                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(messageDiv);

        // Автоматически удаляем сообщение через 5 секунд
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.animation = 'slideInRight 0.3s ease reverse';
                setTimeout(() => {
                    messageDiv.remove();
                }, 300);
            }
        }, 5000);
    }

    createRoom() {
        console.log('🏠 [GameIntegration] Показываем форму создания комнаты...');
        
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.innerHTML = `
            <div class="create-room-interface">
                <div class="create-room-header">
                    <h2>Создать новую комнату</h2>
                    <p>Настройте параметры вашей игровой комнаты</p>
                </div>
                
                <form class="create-room-form" onsubmit="gameIntegration.handleCreateRoom(event)">
                    <div class="form-group">
                        <label for="roomName">Название комнаты</label>
                        <input type="text" id="roomName" name="roomName" placeholder="Введите название комнаты" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="maxPlayers">Максимум игроков</label>
                        <select id="maxPlayers" name="maxPlayers" required>
                            <option value="2">2 игрока</option>
                            <option value="4" selected>4 игрока</option>
                            <option value="6">6 игроков</option>
                            <option value="8">8 игроков</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="gameTime">Время игры</label>
                        <select id="gameTime" name="gameTime" required>
                            <option value="1">1 час</option>
                            <option value="2" selected>2 часа</option>
                            <option value="3">3 часа</option>
                            <option value="4">4 часа</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="roomPassword">Пароль комнаты (необязательно)</label>
                        <input type="password" id="roomPassword" name="roomPassword" placeholder="Введите пароль для входа в комнату">
                    </div>
                    
                    <div class="form-group">
                        <label for="profession">Профессия для всех игроков</label>
                        <div class="profession-selector">
                            <select id="profession" name="profession" required onchange="gameIntegration.updateProfessionPreview()">
                                <option value="">Выберите профессию</option>
                                <option value="1">Уборщик - Легкая</option>
                                <option value="2">Курьер - Легкая</option>
                                <option value="3">Продавец - Легкая</option>
                                <option value="4">Водитель - Легкая</option>
                                <option value="5">Учитель - Средняя</option>
                                <option value="6">Медсестра - Средняя</option>
                                <option value="7">Инженер - Средняя</option>
                                <option value="8">IT-разработчик - Средняя</option>
                                <option value="9">Врач - Сложная</option>
                                <option value="10">Юрист - Сложная</option>
                                <option value="11">Бизнесмен - Сложная</option>
                                <option value="12">Предприниматель - Сложная</option>
                            </select>
                            <button type="button" class="btn-outline btn-small" onclick="gameIntegration.showProfessionDetails()" id="professionDetailsBtn" disabled>
                                Подробнее
                            </button>
                        </div>
                        <div id="professionPreview" class="profession-preview" style="display: none;"></div>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="isPrivate" name="isPrivate">
                            <span class="checkmark"></span>
                            Приватная комната (только по приглашению)
                        </label>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-outline" onclick="gameIntegration.loadGameComponents()">Отмена</button>
                        <button type="submit" class="btn-primary">Создать комнату</button>
                    </div>
                </form>
            </div>
        `;
        
        this.addCreateRoomStyles();
    }

    async handleCreateRoom(event) {
        event.preventDefault();
        console.log('🏠 [GameIntegration] Обрабатываем создание комнаты...');
        
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
            
            const data = { success: true, room: newRoom };
            
            if (data.success) {
                this.currentRoom = data.room;
                console.log('✅ [GameIntegration] Комната создана:', data.room);
                this.showSuccessMessage('Комната создана успешно!');
                // Переходим в комнату
                setTimeout(() => {
                    this.enterRoom(data.room);
                }, 1500);
            } else {
                this.showErrorMessage('Ошибка создания комнаты: ' + data.message);
            }
        } catch (error) {
            console.error('❌ [GameIntegration] Ошибка создания комнаты:', error);
            this.showErrorMessage('Ошибка создания комнаты. Попробуйте позже.');
        } finally {
            // Восстанавливаем кнопку
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async joinRoomById(roomId) {
        console.log('🚪 [GameIntegration] Присоединяемся к комнате:', roomId);
        
        try {
            const response = await fetch('/api/rooms', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    roomId: roomId,
                    action: 'join',
                    userId: this.currentUser.id,
                    userName: this.currentUser.name
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentRoom = data.room;
                this.showSuccessMessage('Вы присоединились к комнате!');
                // Переходим в комнату
                setTimeout(() => {
                    this.enterRoom(data.room);
                }, 1000);
            } else {
                this.showErrorMessage('Ошибка присоединения: ' + data.message);
            }
        } catch (error) {
            console.error('❌ [GameIntegration] Ошибка присоединения:', error);
            this.showErrorMessage('Ошибка присоединения. Попробуйте позже.');
        }
    }

    async leaveRoom(roomId) {
        console.log('🚪 [GameIntegration] Покидаем комнату:', roomId);
        
        try {
            const response = await fetch('/api/rooms', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    roomId: roomId,
                    action: 'leave',
                    userId: this.currentUser.id,
                    userName: this.currentUser.name
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showSuccessMessage('Вы покинули комнату');
                this.loadAvailableRooms();
            } else {
                this.showErrorMessage('Ошибка выхода: ' + data.message);
            }
        } catch (error) {
            console.error('❌ [GameIntegration] Ошибка выхода:', error);
            this.showErrorMessage('Ошибка выхода. Попробуйте позже.');
        }
    }

    async toggleReady(roomId) {
        console.log('✅ [GameIntegration] Переключаем готовность в комнате:', roomId);
        
        try {
            const response = await fetch('/api/rooms', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    roomId: roomId,
                    action: 'toggleReady',
                    userId: this.currentUser.id,
                    userName: this.currentUser.name
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.loadAvailableRooms();
            } else {
                this.showErrorMessage('Ошибка изменения готовности: ' + data.message);
            }
        } catch (error) {
            console.error('❌ [GameIntegration] Ошибка изменения готовности:', error);
            this.showErrorMessage('Ошибка изменения готовности. Попробуйте позже.');
        }
    }

    async startGame(roomId) {
        console.log('🎮 [GameIntegration] Начинаем игру в комнате:', roomId);
        
        try {
            const response = await fetch('/api/rooms', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    roomId: roomId,
                    action: 'start',
                    userId: this.currentUser.id,
                    userName: this.currentUser.name
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showSuccessMessage('Игра началась!');
                this.loadAvailableRooms();
            } else {
                this.showErrorMessage('Ошибка начала игры: ' + data.message);
            }
        } catch (error) {
            console.error('❌ [GameIntegration] Ошибка начала игры:', error);
            this.showErrorMessage('Ошибка начала игры. Попробуйте позже.');
        }
    }

    refreshRooms() {
        console.log('🔄 [GameIntegration] Обновляем список комнат');
        this.loadAvailableRooms();
    }

    enterRoom(room) {
        console.log('🚪 [GameIntegration] Входим в комнату:', room);
        
        const gameContainer = document.getElementById('gameContainer');
        
        // Создаем интерфейс комнаты
        gameContainer.innerHTML = `
            <div class="room-interface">
                <div class="room-header">
                    <div class="room-info">
                        <h2>${room.name}</h2>
                        <span class="room-id">ID: ${room.id}</span>
                    </div>
                    <div class="room-actions-header">
                        <button class="btn-outline" onclick="gameIntegration.leaveRoom('${room.id}')">Покинуть комнату</button>
                        <button class="btn-outline" onclick="gameIntegration.returnToLobby()">Вернуться в лобби</button>
                    </div>
                </div>

                <div class="room-content">
                    <!-- Выбор мечты -->
                    <div class="dream-selection">
                        <h3>Выберите свою мечту</h3>
                        <div class="dreams-grid">
                            <div class="dream-card" onclick="gameIntegration.selectDream('financial_freedom')">
                                <div class="dream-icon">💰</div>
                                <h4>Финансовая свобода</h4>
                                <p>Пассивный доход превышает расходы</p>
                            </div>
                            <div class="dream-card" onclick="gameIntegration.selectDream('business_empire')">
                                <div class="dream-icon">🏢</div>
                                <h4>Бизнес-империя</h4>
                                <p>Сеть успешных предприятий</p>
                            </div>
                            <div class="dream-card" onclick="gameIntegration.selectDream('real_estate')">
                                <div class="dream-icon">🏠</div>
                                <h4>Недвижимость</h4>
                                <p>Портфель доходной недвижимости</p>
                            </div>
                            <div class="dream-card" onclick="gameIntegration.selectDream('investment_portfolio')">
                                <div class="dream-icon">📈</div>
                                <h4>Инвестиционный портфель</h4>
                                <p>Диверсифицированные инвестиции</p>
                            </div>
                        </div>
                    </div>

                    <!-- Карточка профессии -->
                    <div class="profession-card-room">
                        <h3>Профессия для всех игроков</h3>
                        <div class="profession-display">
                            ${this.renderProfessionCard(room.profession)}
                        </div>
                    </div>

                    <!-- Список игроков -->
                    <div class="players-section">
                        <h3>Игроки в комнате (${room.currentPlayers}/${room.maxPlayers})</h3>
                        <div class="players-list" id="playersList">
                            ${this.renderPlayersList(room.players, room.creatorId)}
                        </div>
                    </div>

                    <!-- Кнопки управления -->
                    <div class="room-controls">
                        <button class="btn-primary" onclick="gameIntegration.toggleReady('${room.id}')" id="readyBtn">
                            ${this.getPlayerReadyStatus(room.players) ? 'Не готов' : 'Готов'}
                        </button>
                        ${room.creatorId === this.currentUser.id ? `
                            <button class="btn-success" onclick="gameIntegration.startGame('${room.id}')" id="startBtn">
                                Начать игру
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        this.addRoomInterfaceStyles();
        this.currentRoom = room;
        
        // Обновляем комнату каждые 3 секунды
        this.roomUpdateInterval = setInterval(() => {
            this.updateRoomData();
        }, 3000);
    }

    renderProfessionCard(professionId) {
        const profession = this.getProfessionById(professionId);
        if (!profession) return '<p>Профессия не выбрана</p>';

        return `
            <div class="profession-card-mini">
                <div class="profession-icon">${profession.icon}</div>
                <div class="profession-info">
                    <h4>${profession.name}</h4>
                    <div class="profession-stats">
                        <span>Зарплата: $${profession.salary.toLocaleString()}</span>
                        <span>Денежный поток: $${profession.cashFlow.toLocaleString()}</span>
                    </div>
                </div>
                <button class="btn-outline btn-small" onclick="gameIntegration.showProfessionDetails()">
                    Подробнее
                </button>
            </div>
        `;
    }

    renderPlayersList(players, creatorId) {
        return players.map(player => `
            <div class="player-card ${player.isReady ? 'ready' : 'not-ready'}">
                <div class="player-info">
                    <div class="player-avatar">${player.name.charAt(0).toUpperCase()}</div>
                    <div class="player-details">
                        <h4>${player.name} ${player.id === creatorId ? '(Создатель)' : ''}</h4>
                        <span class="player-status">${player.isReady ? '✅ Готов' : '⏳ Не готов'}</span>
                        ${player.dream ? `<span class="player-dream">🎯 ${this.getDreamName(player.dream)}</span>` : ''}
                    </div>
                </div>
                ${creatorId === this.currentUser.id && player.id !== this.currentUser.id ? `
                    <button class="btn-danger btn-small" onclick="gameIntegration.removePlayer('${player.id}')">
                        Удалить
                    </button>
                ` : ''}
            </div>
        `).join('');
    }

    getPlayerReadyStatus(players) {
        const player = players.find(p => p.id === this.currentUser.id);
        return player ? player.isReady : false;
    }

    getDreamName(dream) {
        const dreams = {
            'financial_freedom': 'Финансовая свобода',
            'business_empire': 'Бизнес-империя',
            'real_estate': 'Недвижимость',
            'investment_portfolio': 'Инвестиционный портфель'
        };
        return dreams[dream] || dream;
    }

    async selectDream(dream) {
        if (!this.currentRoom) return;
        
        try {
            const response = await fetch('/api/rooms', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    roomId: this.currentRoom.id,
                    action: 'selectDream',
                    userId: this.currentUser.id,
                    userName: this.currentUser.name,
                    dream: dream
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentRoom = data.room;
                this.updateRoomDisplay();
            } else {
                this.showErrorMessage('Ошибка выбора мечты: ' + data.message);
            }
        } catch (error) {
            console.error('❌ [GameIntegration] Ошибка выбора мечты:', error);
            this.showErrorMessage('Ошибка выбора мечты. Попробуйте позже.');
        }
    }

    async removePlayer(playerId) {
        if (!this.currentRoom) return;
        
        try {
            const response = await fetch('/api/rooms', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    roomId: this.currentRoom.id,
                    action: 'removePlayer',
                    userId: this.currentUser.id,
                    userName: this.currentUser.name,
                    targetUserId: playerId
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentRoom = data.room;
                this.updateRoomDisplay();
                this.showSuccessMessage('Игрок удален из комнаты');
            } else {
                this.showErrorMessage('Ошибка удаления игрока: ' + data.message);
            }
        } catch (error) {
            console.error('❌ [GameIntegration] Ошибка удаления игрока:', error);
            this.showErrorMessage('Ошибка удаления игрока. Попробуйте позже.');
        }
    }

    async updateRoomData() {
        if (!this.currentRoom) return;
        
        try {
            const response = await fetch('/api/rooms');
            const data = await response.json();
            
            if (data.success) {
                const room = data.rooms.find(r => r.id === this.currentRoom.id);
                if (room) {
                    this.currentRoom = room;
                    this.updateRoomDisplay();
                } else {
                    // Комната удалена, возвращаемся в лобби
                    this.returnToLobby();
                }
            }
        } catch (error) {
            console.error('❌ [GameIntegration] Ошибка обновления комнаты:', error);
        }
    }

    updateRoomDisplay() {
        const playersList = document.getElementById('playersList');
        if (playersList) {
            playersList.innerHTML = this.renderPlayersList(this.currentRoom.players, this.currentRoom.creatorId);
        }

        const readyBtn = document.getElementById('readyBtn');
        if (readyBtn) {
            readyBtn.textContent = this.getPlayerReadyStatus(this.currentRoom.players) ? 'Не готов' : 'Готов';
        }
    }

    returnToLobby() {
        console.log('🏠 [GameIntegration] Возвращаемся в лобби');
        
        // Очищаем интервалы
        if (this.roomUpdateInterval) {
            clearInterval(this.roomUpdateInterval);
        }
        if (this.roomsUpdateInterval) {
            clearInterval(this.roomsUpdateInterval);
        }
        
        this.currentRoom = null;
        this.loadGameComponents();
    }

    async joinRoom() {
        console.log('🚪 [GameIntegration] Присоединяемся к комнате...');
        
        try {
            const response = await fetch('/api/rooms');
            const data = await response.json();
            
            if (data.success) {
                this.showRoomList(data.rooms);
            } else {
                alert('Ошибка загрузки комнат: ' + data.message);
            }
        } catch (error) {
            console.error('❌ [GameIntegration] Ошибка загрузки комнат:', error);
            alert('Ошибка загрузки комнат. Попробуйте позже.');
        }
    }

    showRoomList(rooms) {
        const gameContainer = document.getElementById('gameContainer');
        
        let roomsHtml = '<div class="rooms-list"><h2>Доступные комнаты</h2><div class="rooms-grid">';
        
        rooms.forEach(room => {
            roomsHtml += `
                <div class="room-card" onclick="gameIntegration.joinRoomById('${room.id}')">
                    <h3>${room.name}</h3>
                    <p>Игроков: ${room.players}/${room.maxPlayers}</p>
                    <p>Статус: ${room.status === 'waiting' ? 'Ожидание' : 'В игре'}</p>
                    <button class="btn-primary">Присоединиться</button>
                </div>
            `;
        });
        
        roomsHtml += '</div><button class="btn-outline" onclick="gameIntegration.loadGameComponents()">Назад</button></div>';
        
        gameContainer.innerHTML = roomsHtml;
        this.addRoomStyles();
    }

    addRoomStyles() {
        if (document.getElementById('roomStyles')) return;

        const styles = document.createElement('style');
        styles.id = 'roomStyles';
        styles.textContent = `
            .rooms-list {
                text-align: center;
            }

            .rooms-list h2 {
                color: var(--gold-primary);
                font-size: 28px;
                margin-bottom: 30px;
            }

            .rooms-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .room-card {
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 215, 0, 0.3);
                border-radius: 15px;
                padding: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .room-card:hover {
                border-color: var(--gold-primary);
                background: rgba(255, 215, 0, 0.1);
                transform: translateY(-5px);
            }

            .room-card h3 {
                color: var(--gold-primary);
                margin-bottom: 10px;
            }

            .room-card p {
                color: rgba(255, 255, 255, 0.8);
                margin-bottom: 5px;
            }

            .room-card button {
                margin-top: 15px;
                width: 100%;
            }
        `;
        document.head.appendChild(styles);
    }

    joinRoomById(roomId) {
        console.log('🚪 [GameIntegration] Присоединяемся к комнате:', roomId);
        this.currentRoom = { id: roomId };
        this.loadGameBoard();
    }

    loadGameBoard() {
        console.log('🎮 [GameIntegration] Загружаем игровое поле...');
        
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.innerHTML = `
            <div class="game-board-container">
                <h2>Игровое поле</h2>
                <p>Комната: ${this.currentRoom.name || this.currentRoom.id}</p>
                <div class="game-board">
                    <div class="board-placeholder">
                        <h3>🎮 Игровое поле Energy of Money</h3>
                        <p>Здесь будет размещено игровое поле с модулями из Energy of Money</p>
                        <button class="btn-primary" onclick="gameIntegration.loadGameComponents()">Назад к меню</button>
                    </div>
                </div>
            </div>
        `;
        
        this.addGameBoardStyles();
    }

    addGameBoardStyles() {
        if (document.getElementById('gameBoardStyles')) return;

        const styles = document.createElement('style');
        styles.id = 'gameBoardStyles';
        styles.textContent = `
            .game-board-container {
                text-align: center;
            }

            .game-board-container h2 {
                color: var(--gold-primary);
                font-size: 28px;
                margin-bottom: 20px;
            }

            .game-board-container p {
                color: rgba(255, 255, 255, 0.8);
                font-size: 18px;
                margin-bottom: 30px;
            }

            .game-board {
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 215, 0, 0.3);
                border-radius: 20px;
                padding: 40px;
                margin: 20px 0;
            }

            .board-placeholder {
                text-align: center;
            }

            .board-placeholder h3 {
                color: var(--gold-primary);
                font-size: 24px;
                margin-bottom: 20px;
            }

            .board-placeholder p {
                color: rgba(255, 255, 255, 0.8);
                margin-bottom: 30px;
            }
        `;
        document.head.appendChild(styles);
    }

    addLobbyStyles() {
        if (document.getElementById('lobbyStyles')) return;

        const styles = document.createElement('style');
        styles.id = 'lobbyStyles';
        styles.textContent = `
            .lobby-interface {
                max-width: 1400px;
                margin: 0 auto;
                padding: 20px;
                color: white;
            }

            .lobby-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid rgba(255, 215, 0, 0.3);
            }

            .lobby-header h2 {
                font-size: 2.2rem;
                margin: 0;
                background: linear-gradient(135deg, var(--gold-primary), var(--gold-secondary));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .lobby-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                margin-bottom: 30px;
                flex-wrap: wrap;
            }

            .btn-large {
                padding: 12px 24px;
                font-size: 1rem;
                min-width: 160px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .btn-icon {
                width: 18px;
                height: 18px;
            }

            .rooms-section h3 {
                font-size: 1.6rem;
                margin-bottom: 20px;
                text-align: center;
                color: var(--gold-primary);
            }

            .rooms-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: 20px;
            }

            .room-card {
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 215, 0, 0.3);
                border-radius: 15px;
                padding: 20px;
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
                position: relative;
            }

            .room-card:hover {
                transform: translateY(-3px);
                border-color: var(--gold-primary);
                box-shadow: 0 8px 25px rgba(255, 215, 0, 0.2);
            }

            .room-card.user-in-room {
                border-color: rgba(34, 197, 94, 0.5);
                background: rgba(34, 197, 94, 0.1);
            }

            .room-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 15px;
            }

            .room-title h3 {
                margin: 0 0 5px 0;
                font-size: 1.3rem;
                color: var(--gold-primary);
            }

            .room-id {
                font-size: 0.8rem;
                color: rgba(255, 255, 255, 0.6);
                font-family: monospace;
            }

            .status-badge {
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 600;
                text-transform: uppercase;
            }

            .status-waiting {
                background: rgba(34, 197, 94, 0.2);
                color: #22c55e;
            }

            .status-playing {
                background: rgba(239, 68, 68, 0.2);
                color: #ef4444;
            }

            .room-creator {
                margin-bottom: 15px;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
            }

            .creator-label {
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.9rem;
            }

            .creator-name {
                color: var(--gold-primary);
                font-weight: 600;
                margin-left: 8px;
            }

            .room-players {
                display: flex;
                justify-content: space-between;
                margin-bottom: 15px;
                padding: 10px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
            }

            .players-info, .ready-info {
                text-align: center;
            }

            .players-count, .ready-count {
                font-size: 1.4rem;
                font-weight: bold;
                color: var(--gold-primary);
                display: block;
            }

            .players-label, .ready-label {
                font-size: 0.8rem;
                color: rgba(255, 255, 255, 0.7);
            }

            .room-details {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 20px;
            }

            .room-detail {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.9rem;
            }

            .detail-icon {
                font-size: 1rem;
            }

            .detail-text {
                color: rgba(255, 255, 255, 0.8);
            }

            .room-actions {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }

            .room-actions button {
                flex: 1;
                min-width: 80px;
                padding: 8px 12px;
                font-size: 0.85rem;
            }

            .btn-success {
                background: linear-gradient(135deg, #22c55e, #16a34a);
                border: none;
                color: white;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .btn-success:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
            }

            .loading-rooms {
                text-align: center;
                padding: 40px;
                color: rgba(255, 255, 255, 0.7);
                font-size: 1.1rem;
            }

            .no-rooms {
                text-align: center;
                padding: 40px;
                color: rgba(255, 255, 255, 0.7);
            }

            .no-rooms-icon {
                font-size: 4rem;
                margin-bottom: 20px;
            }

            .no-rooms h3 {
                font-size: 1.5rem;
                margin-bottom: 10px;
                color: var(--gold-primary);
            }

            @media (max-width: 768px) {
                .lobby-header {
                    flex-direction: column;
                    gap: 15px;
                    text-align: center;
                }

                .lobby-actions {
                    flex-direction: column;
                    align-items: center;
                }

                .btn-large {
                    width: 100%;
                    max-width: 280px;
                }

                .rooms-grid {
                    grid-template-columns: 1fr;
                }

                .room-actions {
                    flex-direction: column;
                }

                .room-actions button {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    addRoomInterfaceStyles() {
        if (document.getElementById('roomInterfaceStyles')) return;

        const styles = document.createElement('style');
        styles.id = 'roomInterfaceStyles';
        styles.textContent = `
            .room-interface {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                color: white;
            }

            .room-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid rgba(255, 215, 0, 0.3);
            }

            .room-info h2 {
                font-size: 2rem;
                margin: 0 0 5px 0;
                color: var(--gold-primary);
            }

            .room-id {
                font-size: 0.9rem;
                color: rgba(255, 255, 255, 0.6);
                font-family: monospace;
            }

            .room-actions-header {
                display: flex;
                gap: 10px;
            }

            .room-content {
                display: grid;
                gap: 30px;
            }

            .dream-selection h3 {
                color: var(--gold-primary);
                font-size: 1.5rem;
                margin-bottom: 20px;
                text-align: center;
            }

            .dreams-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .dream-card {
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 215, 0, 0.3);
                border-radius: 15px;
                padding: 20px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }

            .dream-card:hover {
                transform: translateY(-5px);
                border-color: var(--gold-primary);
                background: rgba(255, 215, 0, 0.1);
                box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2);
            }

            .dream-icon {
                font-size: 3rem;
                margin-bottom: 15px;
            }

            .dream-card h4 {
                color: var(--gold-primary);
                font-size: 1.2rem;
                margin: 0 0 10px 0;
            }

            .dream-card p {
                color: rgba(255, 255, 255, 0.8);
                font-size: 0.9rem;
                margin: 0;
            }

            .profession-card-room {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 15px;
                padding: 20px;
            }

            .profession-card-room h3 {
                color: var(--gold-primary);
                font-size: 1.3rem;
                margin-bottom: 15px;
            }

            .profession-card-mini {
                display: flex;
                align-items: center;
                gap: 15px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                padding: 15px;
            }

            .profession-card-mini .profession-icon {
                font-size: 2rem;
            }

            .profession-card-mini .profession-info h4 {
                color: var(--gold-primary);
                margin: 0 0 5px 0;
                font-size: 1.1rem;
            }

            .profession-stats {
                display: flex;
                flex-direction: column;
                gap: 3px;
            }

            .profession-stats span {
                color: rgba(255, 255, 255, 0.8);
                font-size: 0.9rem;
            }

            .players-section h3 {
                color: var(--gold-primary);
                font-size: 1.3rem;
                margin-bottom: 15px;
            }

            .players-list {
                display: grid;
                gap: 10px;
            }

            .player-card {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                padding: 15px;
                transition: all 0.3s ease;
            }

            .player-card.ready {
                border-left: 4px solid #22c55e;
                background: rgba(34, 197, 94, 0.1);
            }

            .player-card.not-ready {
                border-left: 4px solid #f59e0b;
            }

            .player-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .player-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--gold-primary), var(--gold-secondary));
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: white;
                font-size: 1.2rem;
            }

            .player-details h4 {
                margin: 0 0 5px 0;
                color: var(--gold-primary);
                font-size: 1rem;
            }

            .player-status {
                color: rgba(255, 255, 255, 0.8);
                font-size: 0.9rem;
                display: block;
                margin-bottom: 3px;
            }

            .player-dream {
                color: #fbbf24;
                font-size: 0.8rem;
                font-weight: 600;
            }

            .btn-danger {
                background: linear-gradient(135deg, #ef4444, #dc2626);
                border: none;
                color: white;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .btn-danger:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
            }

            .room-controls {
                display: flex;
                gap: 15px;
                justify-content: center;
                margin-top: 30px;
            }

            .room-controls button {
                padding: 12px 24px;
                font-size: 1rem;
                min-width: 120px;
            }

            @media (max-width: 768px) {
                .room-header {
                    flex-direction: column;
                    gap: 15px;
                    text-align: center;
                }

                .room-actions-header {
                    flex-direction: column;
                    width: 100%;
                }

                .dreams-grid {
                    grid-template-columns: 1fr;
                }

                .profession-card-mini {
                    flex-direction: column;
                    text-align: center;
                }

                .player-card {
                    flex-direction: column;
                    gap: 10px;
                }

                .room-controls {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    quickPlay() {
        console.log('⚡ [GameIntegration] Быстрая игра...');
        // Создаем комнату для быстрой игры
        this.currentRoom = {
            id: 'quick_' + Date.now(),
            name: 'Быстрая игра',
            maxPlayers: 4
        };
        this.loadGameBoard();
    }
}

// Инициализируем интеграцию с игрой
const gameIntegration = new GameIntegration();
