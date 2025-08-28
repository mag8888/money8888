import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  Alert,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon
} from '@mui/icons-material';

const AuthForm = ({ onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Форма регистрации
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Форма входа
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Валидация
    if (!registerForm.username.trim() || !registerForm.email.trim() || !registerForm.password) {
      setError('Заполните все обязательные поля');
      setLoading(false);
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    if (registerForm.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      setLoading(false);
      return;
    }

    try {
      // Имитация регистрации (в реальном приложении здесь будет API)
      const user = {
        id: Date.now().toString(),
        username: registerForm.username,
        email: registerForm.email,
        displayId: Math.floor(Math.random() * 1000) + 1,
        createdAt: new Date().toISOString(),
        gameStats: {
          gamesPlayed: 0,
          gamesWon: 0
        }
      };

      // Сохраняем в localStorage
      localStorage.setItem('energy_of_money_user', JSON.stringify(user));
      
      // Уведомляем родительский компонент
      onAuthSuccess(user);
      
      console.log('✅ Пользователь зарегистрирован:', user);
    } catch (error) {
      setError('Ошибка при регистрации: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!loginForm.email.trim() || !loginForm.password) {
      setError('Заполните все поля');
      setLoading(false);
      return;
    }

    try {
      // Имитация входа (в реальном приложении здесь будет API)
      const savedUser = localStorage.getItem('energy_of_money_user');
      
      if (!savedUser) {
        setError('Пользователь не найден. Сначала зарегистрируйтесь');
        setLoading(false);
        return;
      }

      const user = JSON.parse(savedUser);
      
      // Простая проверка email (в реальном приложении будет проверка пароля)
      if (user.email !== loginForm.email) {
        setError('Неверный email или пароль');
        setLoading(false);
        return;
      }

      // Уведомляем родительский компонент
      onAuthSuccess(user);
      
      console.log('✅ Пользователь вошел:', user);
    } catch (error) {
      setError('Ошибка при входе: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Быстрый старт с тестовым пользователем
  const handleQuickStart = () => {
    const testUser = {
      id: Date.now().toString(),
      username: 'Тестовый игрок',
      email: 'test@example.com',
      displayId: Math.floor(Math.random() * 1000) + 1,
      createdAt: new Date().toISOString(),
      gameStats: {
        gamesPlayed: 0,
        gamesWon: 0
      }
    };
    
    localStorage.setItem('energy_of_money_user', JSON.stringify(testUser));
    onAuthSuccess(testUser);
    console.log('✅ Быстрый старт с тестовым пользователем:', testUser);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" align="center" gutterBottom>
          🚀 Energy of Money
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Войдите или зарегистрируйтесь для начала игры
        </Typography>

        <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
          <Tab label="Вход" icon={<LoginIcon />} />
          <Tab label="Регистрация" icon={<RegisterIcon />} />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {activeTab === 0 ? (
          // Форма входа
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              margin="normal"
              required
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            
            <TextField
              fullWidth
              label="Пароль"
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              margin="normal"
              required
              InputProps={{
                startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
              startIcon={<LoginIcon />}
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>
        ) : (
          // Форма регистрации
          <form onSubmit={handleRegister}>
            <TextField
              fullWidth
              label="Имя пользователя"
              value={registerForm.username}
              onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
              margin="normal"
              required
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              margin="normal"
              required
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            
            <TextField
              fullWidth
              label="Пароль"
              type="password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              margin="normal"
              required
              InputProps={{
                startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            
            <TextField
              fullWidth
              label="Подтвердите пароль"
              type="password"
              value={registerForm.confirmPassword}
              onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
              margin="normal"
              required
              InputProps={{
                startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
              startIcon={<RegisterIcon />}
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
          </form>
        )}

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            ИЛИ
          </Typography>
        </Divider>

        <Button
          fullWidth
          variant="outlined"
          onClick={handleQuickStart}
        >
          🚀 Быстрый старт (тестовый пользователь)
        </Button>
      </Paper>
    </Box>
  );
};

export default AuthForm;
