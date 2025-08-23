import React, { useState } from 'react';

const SimpleAuth = ({ onRegister, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Простая логика входа для тестирования
        if (email && password) {
          const userData = {
            id: Date.now().toString(),
            email: email,
            username: displayName || email.split('@')[0],
            displayId: Math.floor(Math.random() * 1000) + 1,
            gameStats: {
              gamesPlayed: Math.floor(Math.random() * 50),
              gamesWon: Math.floor(Math.random() * 25)
            }
          };
          
          // Имитируем задержку
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          onLogin(userData);
        } else {
          setError('Заполните все поля');
        }
      } else {
        // Простая логика регистрации для тестирования
        if (email && password && displayName) {
          const userData = {
            id: Date.now().toString(),
            email: email,
            username: displayName,
            displayId: Math.floor(Math.random() * 1000) + 1,
            gameStats: {
              gamesPlayed: 0,
              gamesWon: 0
            }
          };
          
          // Имитируем задержку
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          onRegister(userData);
        } else {
          setError('Заполните все поля');
        }
      }
    } catch (err) {
      setError('Произошла ошибка. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = (testEmail) => {
    setEmail(testEmail);
    setPassword('test123');
    setDisplayName(testEmail.split('@')[0]);
    setIsLogin(true);
  };

  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: '0 auto', 
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          color: '#1976D2', 
          marginBottom: '8px',
          margin: 0
        }}>
          🎮 Cashflow Game
        </h1>
        <p style={{ color: '#666', fontSize: '1.1rem', margin: 0 }}>
          {isLogin ? 'Вход в игру' : 'Регистрация'}
        </p>
      </div>

      {/* Тестовые аккаунты */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '32px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ 
            color: '#4CAF50', 
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            🧪 Тестовые аккаунты
          </h3>
          <p style={{ 
            fontSize: '0.9rem', 
            color: '#666', 
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            Нажмите на любой email для быстрого входа
          </p>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {['test1@cashflow.com', 'test2@cashflow.com', 'test3@cashflow.com'].map((testEmail) => (
              <button
                key={testEmail}
                style={{
                  background: 'transparent',
                  border: '1px solid #1976D2',
                  color: '#1976D2',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
                onMouseEnter={(e) => e.target.style.background = '#E3F2FD'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                onClick={() => handleTestLogin(testEmail)}
              >
                {testEmail}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Форма входа/регистрации */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            {/* Переключатель режима */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <button
                type="button"
                style={{
                  background: isLogin ? '#1976D2' : 'transparent',
                  color: isLogin ? 'white' : '#1976D2',
                  border: '1px solid #1976D2',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
                onClick={() => setIsLogin(true)}
              >
                Вход
              </button>
              <button
                type="button"
                style={{
                  background: !isLogin ? '#1976D2' : 'transparent',
                  color: !isLogin ? 'white' : '#1976D2',
                  border: '1px solid #1976D2',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
                onClick={() => setIsLogin(false)}
              >
                Регистрация
              </button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #E0E0E0', margin: '24px 0' }} />

            {/* Поле для отображаемого имени (только при регистрации) */}
            {!isLogin && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  color: '#333'
                }}>
                  <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>➕</span>
                  Имя игрока
                </label>
                <input
                  type="text"
                  placeholder="Введите ваше имя"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}

            {/* Поле email */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: 'bold', 
                marginBottom: '8px',
                color: '#333'
              }}>
                <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>📧</span>
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Поле пароля */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: 'bold', 
                marginBottom: '8px',
                color: '#333'
              }}>
                <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🔒</span>
                Пароль
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    padding: '12px 16px',
                    border: '1px solid #E0E0E0',
                    background: 'white',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontSize: '1.2rem',
                    minWidth: '60px'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Отображение ошибок */}
            {error && (
              <div style={{
                background: '#FFEBEE',
                color: '#C62828',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>❌</span>
                {error}
              </div>
            )}

            {/* Кнопка отправки */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: '#1976D2',
                color: 'white',
                border: 'none',
                padding: '16px',
                borderRadius: '4px',
                fontSize: '1.1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (isLogin ? 'Вход...' : 'Регистрация...') : (isLogin ? '🚀 Войти в игру' : '📝 Создать аккаунт')}
            </button>
          </div>
        </form>
      </div>

      {/* Информация */}
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <p style={{ fontSize: '0.9rem', color: '#999' }}>
          💡 Для тестирования используйте любые данные или нажмите на тестовый email выше
        </p>
      </div>
    </div>
  );
};

export default SimpleAuth;
