import React, { useEffect, useState } from 'react';
import './App.css';

function TelegramAuth({ onAuthSuccess }) {
  console.log('🔐 TelegramAuth component loaded');
  const [telegramUser, setTelegramUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Проверяем, запущено ли приложение в Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      
      if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        setTelegramUser({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          language_code: user.language_code,
          is_premium: user.is_premium
        });
        
        // Авторизуем пользователя автоматически
        handleTelegramAuth(user);
      } else {
        setError('Не удалось получить данные пользователя из Telegram');
        setLoading(false);
      }
    } else {
      // Если не в Telegram WebApp, показываем обычную форму
      setLoading(false);
    }
  }, []);

  const handleTelegramAuth = async (userData) => {
    try {
      setLoading(true);
      
      // Отправляем данные пользователя на сервер
      const response = await fetch('/api/telegram/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_id: userData.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          language_code: userData.language_code,
          is_premium: userData.is_premium
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Успешная авторизация
        onAuthSuccess({
          id: `tg_${userData.id}`,
          username: userData.username || userData.first_name,
          email: `tg_${userData.id}@telegram.local`,
          telegramData: userData,
          isTelegramUser: true
        });
      } else {
        setError(result.error || 'Ошибка авторизации');
      }
    } catch (error) {
      console.error('Telegram auth error:', error);
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  const handleManualAuth = () => {
    // Переходим к обычной авторизации
    onAuthSuccess(null);
  };

  const handleTestAccount = () => {
    // Создаем тестовый аккаунт с заполненными данными
    const testUserData = {
      id: 'test_user_123',
      username: 'testuser',
      email: 'test@example.com',
      telegramData: {
        id: 123456789,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        language_code: 'ru',
        is_premium: false
      },
      isTelegramUser: true
    };
    
    console.log('🧪 Using test account:', testUserData);
    onAuthSuccess(testUserData);
  };

  if (loading) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>🔐 Авторизация через Telegram</h1>
          <p>⏳ Проверяем данные пользователя...</p>
        </header>
      </div>
    );
  }

  if (telegramUser) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>✅ Telegram авторизация</h1>
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '20px', 
            borderRadius: '10px',
            margin: '20px 0'
          }}>
            <h2>Добро пожаловать, {telegramUser.first_name}!</h2>
            <p>ID: {telegramUser.id}</p>
            {telegramUser.username && <p>Username: @{telegramUser.username}</p>}
            <p>Язык: {telegramUser.language_code}</p>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔐 Авторизация</h1>
        <p>Выберите способ входа в игру</p>
        
        {error && (
          <div style={{ 
            color: '#f44336', 
            margin: '20px 0',
            padding: '15px',
            background: 'rgba(244, 67, 54, 0.1)',
            borderRadius: '10px'
          }}>
            {error}
          </div>
        )}

        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '30px', 
          borderRadius: '10px',
          margin: '20px 0',
          minWidth: '300px'
        }}>
          <div style={{ margin: '20px 0' }}>
            <button 
              className="start-button"
              onClick={() => window.open('https://t.me/anreal_money_bot', '_blank')}
              style={{ 
                width: '100%', 
                margin: '10px 0',
                background: 'linear-gradient(45deg, #0088cc, #00aaff)'
              }}
            >
              🤖 Войти через Telegram бот
            </button>
          </div>
          
          <div style={{ margin: '20px 0' }}>
            <button 
              className="start-button"
              onClick={handleTestAccount}
              style={{ 
                width: '100%', 
                margin: '10px 0',
                background: 'linear-gradient(45deg, #ff6b35, #f7931e)'
              }}
            >
              🧪 Тест аккаунт
            </button>
          </div>
          
          <div style={{ margin: '20px 0' }}>
            <button 
              className="start-button"
              onClick={handleManualAuth}
              style={{ 
                width: '100%', 
                margin: '10px 0',
                background: 'linear-gradient(45deg, #666, #888)'
              }}
            >
              👤 Обычная авторизация
            </button>
          </div>
        </div>

        <div style={{ margin: '20px 0', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', opacity: 0.7 }}>
            🧪 <strong>Тест аккаунт</strong> - быстрый вход с готовыми данными для тестирования
          </p>
          <p style={{ fontSize: '12px', opacity: 0.5, marginTop: '5px' }}>
            Для полной функциональности рекомендуем войти через Telegram бот
          </p>
        </div>
      </header>
    </div>
  );
}

export default TelegramAuth;
