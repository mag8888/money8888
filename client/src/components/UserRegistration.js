import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  InputAdornment
} from '@mui/material';
import {
  Email,
  ArrowBack,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { colors, textColors, buttonStyles, inputStyles, containerStyles, typographyStyles } from '../styles/component-styles.js';


const UserRegistration = ({ onRegister, onLogin, onBack }) => {
  const [formData, setFormData] = useState({
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Валидация email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email обязателен';
    if (!emailRegex.test(email)) return 'Введите корректный email';
    return '';
  };

  // Обработка изменения полей
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Очищаем ошибку при вводе
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация
    const emailError = validateEmail(formData.email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Проверяем, является ли это тестовым аккаунтом
      const testAccounts = ['romeoproo1@gmail.com', 'xqrmedia@gmail.com'];
      
      if (testAccounts.includes(formData.email)) {
        // Создаем тестовый аккаунт автоматически БЕЗ профессии
        const userData = {
          email: formData.email,
          username: formData.email.split('@')[0],
          displayId: Math.floor(Math.random() * 1000) + 100,
          isTestAccount: true
        };
        
        // Сохраняем в localStorage для тестирования
        localStorage.setItem('testUser', JSON.stringify(userData));
        
        // Сразу логинимся
        if (onLogin) {
          onLogin(userData);
        }
      } else {
        // Для других email - показываем сообщение о регистрации
        setMessage({
          type: 'info',
          text: 'Этот email не зарегистрирован. Используйте тестовые аккаунты: romeoproo1@gmail.com или xqrmedia@gmail.com'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Произошла ошибка при входе'
      });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <Box sx={{
      minHeight: '100vh',
      background: colors.roomSelection.background,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 4
    }}>
      {/* Основная форма */}
      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        elevation={8}
        sx={containerStyles.formContainer}
      >
          {/* Заголовок */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ 
              color: colors.primary.main, 
              fontWeight: 'bold',
              mb: 1
            }}>
              🎮 Вход в игру CASHFLOW
            </Typography>
            <Typography variant="body1" sx={{ color: textColors.secondary }}>
              Введите email для входа в игру
            </Typography>
          </Box>

          {/* Информация о тестовых аккаунтах */}
          <Box sx={{ 
            mb: 3, 
            p: 2, 
            bgcolor: colors.primary.light, 
            borderRadius: 2,
            border: `1px solid ${colors.primary.main}`
          }}>
            <Typography variant="body2" sx={{ color: textColors.secondary, textAlign: 'center' }}>
              💡 <strong>Тестовые аккаунты:</strong><br/>
              • romeoproo1@gmail.com<br/>
              • xqrmedia@gmail.com
            </Typography>
          </Box>

          {/* Форма */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
            {/* Email */}
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              sx={{
                ...inputStyles.primary,
                mb: 3
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: colors.primary.main }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Сообщения */}
            {message.text && (
              <Alert 
                severity={message.type} 
                sx={{ mb: 3 }}
                icon={message.type === 'success' ? <CheckCircle /> : <Error />}
              >
                {message.text}
              </Alert>
            )}

            {/* Кнопка отправки */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                ...buttonStyles.primary,
                py: 1.5,
                fontSize: '1.1rem'
              }}
            >
              {isLoading ? '⏳ Вход...' : '🎮 Войти в игру'}
            </Button>
          </Box>

          {/* Убираем переключение режимов - теперь только вход */}
          
          {/* Подсказка для новых пользователей */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: textColors.secondary, fontSize: '0.9rem' }}>
              💡 Просто введите email и нажмите "Войти в игру"
            </Typography>
          </Box>

          {/* Кнопка назад */}
          {onBack && (
            <Button
              fullWidth
              variant="text"
              onClick={onBack}
              startIcon={<ArrowBack />}
              sx={{
                mt: 2,
                color: textColors.secondary,
                '&:hover': {
                  bgcolor: colors.primary.light
                }
              }}
            >
              ← Назад
            </Button>
          )}
        </Paper>
      </Box>
    );
  };

export default UserRegistration;
