import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Registration from './components/Registration';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [user, setUser] = useState(null);

  // Загружаем сохраненного пользователя
  useEffect(() => {
    const savedUser = localStorage.getItem('energy_of_money_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (error) {
        console.error('Ошибка парсинга пользователя:', error);
      }
    }
  }, []);

  const handleRegister = (playerData) => {
    setUser(playerData);
    localStorage.setItem('energy_of_money_user', JSON.stringify(playerData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('energy_of_money_user');
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center'
          }}>
            {user ? (
              <div>
                <h1 style={{ color: '#333', marginBottom: '30px' }}>
                  Добро пожаловать, {user.username}!
                </h1>
                <p style={{ color: '#666', marginBottom: '30px' }}>
                  Email: {user.email}
                </p>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '15px 30px',
                    fontSize: '16px',
                    background: 'linear-gradient(45deg, #FF6B6B, #E53E3E)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 7px 20px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                  }}
                >
                  Выйти
                </button>
              </div>
            ) : (
              <Registration onRegister={handleRegister} />
            )}
          </div>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;