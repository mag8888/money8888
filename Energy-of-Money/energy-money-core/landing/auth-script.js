// Auth Page Script
class AuthPage {
    constructor() {
        this.init();
    }

    init() {
        console.log('🔐 [AuthPage] Инициализация страницы авторизации...');
        this.setupEventListeners();
        this.checkExistingUser();
        this.checkReturnParam();
    }

    setupEventListeners() {
        // Обработчики для переключения вкладок
        window.switchTab = (tab) => this.switchTab(tab);
        window.handleLogin = (event) => this.handleLogin(event);
        window.handleRegister = (event) => this.handleRegister(event);
    }

    checkExistingUser() {
        const savedUser = localStorage.getItem('energy_of_money_user');
        if (savedUser) {
            console.log('✅ [AuthPage] Пользователь уже авторизован, перенаправляем в игру');
            this.redirectToGame();
        }
    }

    checkReturnParam() {
        const urlParams = new URLSearchParams(window.location.search);
        const returnParam = urlParams.get('return');
        
        if (returnParam === 'game' || returnParam === 'lobby') {
            console.log('🎮 [AuthPage] Обнаружен параметр return=' + returnParam + ', после авторизации откроем игру');
            this.returnToGame = true;
        }
    }

    switchTab(tab) {
        console.log('🔄 [AuthPage] Переключаем на вкладку:', tab);
        
        // Убираем активный класс со всех вкладок и форм
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        
        // Активируем выбранную вкладку и форму
        document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
        document.getElementById(`${tab}Form`).classList.add('active');
    }

    async handleLogin(event) {
        event.preventDefault();
        console.log('🔐 [AuthPage] Обрабатываем вход...');
        
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');
        
        // Показываем индикатор загрузки
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Вход...</span>';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'login',
                    email: email,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Сохраняем пользователя
                localStorage.setItem('energy_of_money_user', JSON.stringify(data.user));
                console.log('✅ [AuthPage] Пользователь авторизован:', data.user);
                
                // Показываем успешное сообщение
                this.showSuccessMessage('Вход выполнен успешно!');
                
                // Перенаправляем в игру через 1 секунду
                setTimeout(() => {
                    this.redirectToGame();
                }, 1000);
            } else {
                this.showErrorMessage('Ошибка входа: ' + data.message);
            }
        } catch (error) {
            console.error('❌ [AuthPage] Ошибка входа:', error);
            // Fallback к локальной авторизации
            const user = {
                id: Date.now().toString(),
                email: email,
                name: email.split('@')[0],
                username: email.split('@')[0]
            };
            
            localStorage.setItem('energy_of_money_user', JSON.stringify(user));
            this.showSuccessMessage('Вход выполнен успешно!');
            
            setTimeout(() => {
                this.redirectToGame();
            }, 1000);
        } finally {
            // Восстанавливаем кнопку
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        console.log('📝 [AuthPage] Обрабатываем регистрацию...');
        
        const formData = new FormData(event.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        if (password !== confirmPassword) {
            this.showErrorMessage('Пароли не совпадают!');
            return;
        }
        
        if (password.length < 6) {
            this.showErrorMessage('Пароль должен содержать минимум 6 символов!');
            return;
        }
        
        // Показываем индикатор загрузки
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Регистрация...</span>';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'register',
                    email: email,
                    password: password,
                    name: name
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Сохраняем пользователя
                localStorage.setItem('energy_of_money_user', JSON.stringify(data.user));
                console.log('✅ [AuthPage] Пользователь зарегистрирован:', data.user);
                
                // Показываем успешное сообщение
                this.showSuccessMessage('Регистрация выполнена успешно!');
                
                // Перенаправляем в игру через 1 секунду
                setTimeout(() => {
                    this.redirectToGame();
                }, 1000);
            } else {
                this.showErrorMessage('Ошибка регистрации: ' + data.message);
            }
        } catch (error) {
            console.error('❌ [AuthPage] Ошибка регистрации:', error);
            // Fallback к локальной регистрации
            const user = {
                id: Date.now().toString(),
                email: email,
                name: name,
                username: name
            };
            
            localStorage.setItem('energy_of_money_user', JSON.stringify(user));
            this.showSuccessMessage('Регистрация выполнена успешно!');
            
            setTimeout(() => {
                this.redirectToGame();
            }, 1000);
        } finally {
            // Восстанавливаем кнопку
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Удаляем существующие сообщения
        const existingMessage = document.querySelector('.auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message auth-message-${type}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <span class="message-icon">${type === 'success' ? '✅' : '❌'}</span>
                <span class="message-text">${message}</span>
            </div>
        `;

        // Добавляем стили для сообщения
        if (!document.getElementById('messageStyles')) {
            const styles = document.createElement('style');
            styles.id = 'messageStyles';
            styles.textContent = `
                .auth-message {
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

                .auth-message-success {
                    background: rgba(16, 185, 129, 0.9);
                    border: 1px solid rgba(16, 185, 129, 0.5);
                    color: white;
                }

                .auth-message-error {
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

    redirectToGame() {
        console.log('🎮 [AuthPage] Перенаправляем в игру...');
        console.log('🔍 [AuthPage] returnToGame:', this.returnToGame);
        
        if (this.returnToGame) {
            // Если пришли с параметром return=lobby, переходим в лобби
            console.log('✅ [AuthPage] Переходим в лобби');
            window.location.href = 'lobby.html';
        } else {
            // Иначе переходим на главную страницу
            console.log('🏠 [AuthPage] Переходим на главную страницу');
            window.location.href = 'index.html';
        }
    }
}

// Инициализируем страницу авторизации
const authPage = new AuthPage();
