import React, { useState } from 'react';
import { motion } from 'framer-motion';
import socket from '../socket';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Star as StarIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';

const Registration = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setLogin] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // 1 - email, 2 - username, 3 - password
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetPasswordMessage, setResetPasswordMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('🎯 [Registration] Form submitted!');
    
    // Дополнительная защита: если это существующий пользователь и не шаг 1, то что-то пошло не так
    if (isExistingUser && currentStep > 1) {
      console.log('❌ [Registration] Existing user on step > 1 - this should not happen');
      setError('Ошибка в процессе входа. Попробуйте еще раз.');
      return;
    }

    // Дополнительная защита: для существующих пользователей username не должен проверяться
    if (isExistingUser && username && username.trim()) {
      console.log('🔐 [Registration] Existing user has username - this should not trigger validation');
    }
    
    if (currentStep === 1) {
      // Шаг 1: Проверка email и пароля
      if (!email.trim()) {
        setError('Введите email');
        return;
      }

      // Простая валидация email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError('Введите корректный email');
        return;
      }

      // Убираем проверку пароля - пароль не обязателен
      // if (!password.trim()) {
      //   setError('Введите пароль');
      //   return;
      // }

      // if (password.trim().length < 6) {
      //   setError('Пароль должен содержать минимум 6 символов');
      //   return;
      // }

      // Проверяем, существует ли пользователь с таким email
      checkUserExists();
      return;
    }

    // Шаг 2: Проверка username для новых пользователей
    if (currentStep === 2) {
      // Дополнительная проверка: если это шаг 2, то пользователь должен быть новым
      // (существующие пользователи не должны доходить до шага 2)
      if (isExistingUser) {
        console.log('❌ [Registration] Existing user reached step 2 - this should not happen');
        setError('Ошибка в процессе входа. Попробуйте еще раз.');
        return;
      }

      if (!username.trim()) {
        setError('Введите имя игрока');
        return;
      }

      if (username.trim().length < 2) {
        setError('Имя должно содержать минимум 2 символа');
        return;
      }

      // Проверяем уникальность username
      socket.emit('checkUsernameUnique', username.trim(), (response) => {
        if (!response.unique) {
          setError('Пользователь с таким именем уже существует. Выберите другое имя.');
          return;
        }
        
        // Переходим к следующему шагу
        setCurrentStep(3);
        setError('');
      });
      return;
    }

    // Шаг 3: Завершение регистрации для новых пользователей
    if (currentStep === 3 && !isExistingUser) {
      completeRegistration();
      return;
    }


  };

  const checkUserExists = () => {
    // Проверяем, существует ли пользователь с таким email
    socket.emit('checkUserExists', email.trim(), (response) => {
      if (response.exists) {
        // Пользователь существует - выполняем вход сразу (имя уже привязано к email)
        setIsExistingUser(true);
        setLogin(true);
        // Не вызываем performLogin здесь, так как isExistingUser еще не обновился
        // Вместо этого выполняем вход напрямую
        performLoginDirectly();
      } else {
        // Пользователь не существует - продолжаем регистрацию
        setIsExistingUser(false);
        setLogin(false);
        setCurrentStep(2); // Переходим к вводу имени
        setError('');
      }
    });
  };

  const handleResetPassword = () => {
    if (!email.trim()) {
      setError('Введите email для восстановления пароля');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Введите корректный email');
      return;
    }

    setIsResettingPassword(true);
    setError('');
    setResetPasswordMessage('');

    socket.emit('resetPassword', email.trim(), (response) => {
      setIsResettingPassword(false);
      
      if (response.success) {
        setResetPasswordMessage(response.message);
        setError('');
      } else {
        setError(response.error);
        setResetPasswordMessage('');
      }
    });
  };

  const performLogin = () => {
    // Эта функция только для существующих пользователей
    if (!isExistingUser) {
      console.log('❌ [Registration] performLogin called for new user - this should not happen');
      return;
    }

    console.log('🔐 [Registration] Performing login for existing user');
    
    // Выполняем вход существующего пользователя (имя уже есть в базе)
    socket.emit('authenticateUser', null, email.trim(), password.trim(), (response) => {
      console.log('📡 [Registration] Login response:', response);
      
      if (response.success) {
        // Создаем данные игрока с серверным ID
        const playerData = {
          id: response.userData.id,
          username: response.userData.username,
          email: response.userData.email
        };

        // Сохраняем в localStorage
        localStorage.setItem('energy_of_money_user', JSON.stringify(playerData));
        localStorage.setItem('energy_of_money_player_name', response.userData.username);
        localStorage.setItem('energy_of_money_player_email', response.userData.email);
        
        console.log('✅ [Registration] User logged in successfully:', playerData);
        
        // Вызываем callback для перехода в лобби
        onRegister(playerData);
      } else {
        setError(response.error || 'Неверный пароль');
      }
    });
  };

  const performLoginDirectly = () => {
    console.log('🔐 [Registration] Performing direct login for existing user');
    
    // Дополнительная проверка: для существующих пользователей username не нужен
    console.log('🔐 [Registration] Login attempt for existing user - no username validation needed');
    
    // Выполняем вход существующего пользователя (имя уже есть в базе)
    socket.emit('authenticateUser', null, email.trim(), password.trim(), (response) => {
      console.log('📡 [Registration] Direct login response:', response);
      
      if (response.success) {
        // Создаем данные игрока с серверным ID
        const playerData = {
          id: response.userData.id,
          username: response.userData.username,
          email: response.userData.email
        };

        // Сохраняем в localStorage
        localStorage.setItem('energy_of_money_user', JSON.stringify(playerData));
        localStorage.setItem('energy_of_money_player_name', response.userData.username);
        localStorage.setItem('energy_of_money_player_email', response.userData.email);
        
        console.log('✅ [Registration] User logged in successfully:', playerData);
        
        // Вызываем callback для перехода в лобби
        onRegister(playerData);
      } else {
        setError(response.error || 'Неверный пароль');
      }
    });
  };

  const completeRegistration = () => {
    // Эта функция только для новых пользователей
    if (isExistingUser) {
      console.log('❌ [Registration] completeRegistration called for existing user - this should not happen');
      return;
    }

    // Дополнительная проверка: username должен быть заполнен для новых пользователей
    if (!username || !username.trim()) {
      console.log('❌ [Registration] Username is empty for new user');
      setError('Имя игрока обязательно для регистрации');
      return;
    }

    if (username.trim().length < 2) {
      console.log('❌ [Registration] Username too short for new user');
      setError('Имя должно содержать минимум 2 символа');
      return;
    }

    console.log('🚀 [Registration] Completing registration:', {
      username: username.trim(),
      email: email.trim(),
      password: password.trim()
    });

    // Отправляем запрос на вход/регистрацию на сервер
    socket.emit('authenticateUser', username.trim(), email.trim(), password.trim(), (response) => {
      console.log('📡 [Registration] Server response:', response);
      
      if (response.success) {
        // Создаем данные игрока с серверным ID
        const playerData = {
          id: response.userData.id,
          username: response.userData.username,
          email: response.userData.email
        };

        // Сохраняем в localStorage
        localStorage.setItem('energy_of_money_user', JSON.stringify(playerData));
        localStorage.setItem('energy_of_money_player_name', response.userData.username);
        localStorage.setItem('energy_of_money_player_email', response.userData.email);
        
        if (response.isLogin) {
          console.log('✅ [Registration] User logged in successfully:', playerData);
        } else {
          console.log('✅ [Registration] User registered successfully:', playerData);
        }
        
        // Вызываем callback для перехода в лобби
        onRegister(playerData);
      } else {
        setError(response.error || 'Ошибка аутентификации');
      }
    });
  };

      const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: { xs: 2, md: 4 },
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Стильные фоновые элементы */}
      <Box sx={{
        position: 'absolute',
        top: -100,
        right: -100,
        width: 400,
        height: 400,
        background: 'radial-gradient(circle, rgba(120, 119, 198, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 0,
        animation: 'float 6s ease-in-out infinite'
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: -150,
        left: -150,
        width: 500,
        height: 500,
        background: 'radial-gradient(circle, rgba(255, 119, 198, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 0,
        animation: 'float 8s ease-in-out infinite reverse'
      }} />
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        height: 600,
        background: 'radial-gradient(circle, rgba(100, 200, 255, 0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 0,
        animation: 'pulse 10s ease-in-out infinite'
      }} />

      {/* Основной контент */}
      <Box sx={{ 
        position: 'relative', 
        zIndex: 1, 
        width: '100%', 
        maxWidth: 520,
        textAlign: 'center'
      }}>
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Заголовок с градиентом */}
          <Box sx={{ mb: 6 }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography 
                variant="h1" 
                sx={{
                  background: 'linear-gradient(135deg, #64b5f6 0%, #e1bee7 50%, #ffb74d 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  mb: 2,
                  textShadow: '0 0 30px rgba(100, 181, 246, 0.3)'
                }}
              >
                Energy of Money
              </Typography>
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <AttachMoneyIcon sx={{ 
                  fontSize: '2rem', 
                  color: '#ffd700', 
                  mr: 1,
                  filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))'
                }} />
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: '#ffffff',
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    fontWeight: 300,
                    letterSpacing: '0.02em'
                  }}
                >
                  Игра финансовой свободы
                </Typography>
              </Box>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#b0bec5',
                  fontSize: '1.125rem',
                  fontWeight: 400,
                  letterSpacing: '0.01em',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                Добро пожаловать в мир финансовых возможностей
              </Typography>
            </motion.div>
          </Box>

          {/* Форма регистрации с неоморфизмом */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Paper 
              elevation={0}
              sx={{
                p: 4,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: `
                  0 8px 32px rgba(0, 0, 0, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                `,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Декоративные элементы формы */}
              <Box sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                background: 'linear-gradient(135deg, rgba(100, 181, 246, 0.2) 0%, rgba(225, 190, 231, 0.2) 100%)',
                borderRadius: '50%',
                zIndex: 0
              }} />
              <Box sx={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 100,
                height: 100,
                background: 'linear-gradient(135deg, rgba(255, 183, 77, 0.15) 0%, rgba(255, 119, 198, 0.15) 100%)',
                borderRadius: '50%',
                zIndex: 0
              }} />

              {/* Индикатор прогресса */}
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                  {(isExistingUser ? [1, 2] : [1, 2, 3]).map((step) => (
                    <Box key={step} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.125rem',
                          fontWeight: 600,
                          color: currentStep >= step ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
                          background: currentStep >= step 
                            ? 'linear-gradient(135deg, #64b5f6 0%, #e1bee7 50%, #ffb74d 100%)'
                            : 'rgba(255, 255, 255, 0.1)',
                          border: currentStep >= step 
                            ? 'none'
                            : '2px solid rgba(255, 255, 255, 0.2)',
                          transition: 'all 0.3s ease',
                          boxShadow: currentStep >= step 
                            ? '0 4px 16px rgba(100, 181, 246, 0.3)'
                            : 'none'
                        }}
                      >
                        {step}
                      </Box>
                      {step < (isExistingUser ? 2 : 3) && (
                        <Box
                          sx={{
                            width: 60,
                            height: 2,
                            background: currentStep > step 
                              ? 'linear-gradient(90deg, #64b5f6 0%, #e1bee7 100%)'
                              : 'rgba(255, 255, 255, 0.2)',
                            mx: 2,
                            borderRadius: 1,
                            transition: 'all 0.3s ease'
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9rem'
                  }}
                >
                  {currentStep === 1 && (isExistingUser ? 'Введите email и пароль для входа' : 'Шаг 1: Введите email и пароль')}
                  {currentStep === 2 && !isExistingUser && 'Шаг 2: Введите имя игрока'}
                  {currentStep === 3 && !isExistingUser && 'Шаг 3: Подтверждение'}
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit} sx={{ position: 'relative', zIndex: 1 }}>
                {/* Шаг 1: Email + Пароль */}
                {currentStep === 1 && (
                  <>
                    {/* Email */}
                    <Box sx={{ mb: 4 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: '#ffffff',
                          mb: 2,
                          fontWeight: 600,
                          textAlign: 'left'
                        }}
                      >
                        Email
                      </Typography>
                      <TextField
                        fullWidth
                        type="email"
                        placeholder="Введите ваш email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        variant="outlined"
                        InputProps={{
                          sx: {
                            borderRadius: '16px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            fontSize: '1.125rem',
                            padding: '20px 24px',
                            color: '#ffffff',
                            '&:hover': {
                              background: 'rgba(255, 255, 255, 0.12)',
                              borderColor: 'rgba(100, 181, 246, 0.5)'
                            },
                            '&.Mui-focused': {
                              background: 'rgba(255, 255, 255, 0.15)',
                              borderColor: '#64b5f6',
                              boxShadow: '0 0 20px rgba(100, 181, 246, 0.3)'
                            },
                            '&::placeholder': {
                              color: 'rgba(255, 255, 255, 0.5)',
                              opacity: 1
                            }
                          }
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              border: 'none'
                            }
                          }
                        }}
                      />
                    </Box>

                    {/* Пароль */}
                    <Box sx={{ mb: 4 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: '#ffffff',
                          mb: 2,
                          fontWeight: 600,
                          textAlign: 'left'
                        }}
                      >
                        {isExistingUser ? 'Пароль (не обязателен)' : 'Пароль (не обязателен)'}
                      </Typography>
                      <TextField
                        fullWidth
                        type="password"
                        placeholder={isExistingUser ? "Пароль (не обязателен)" : "Пароль (не обязателен)"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        variant="outlined"
                        InputProps={{
                          sx: {
                            borderRadius: '16px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            fontSize: '1.125rem',
                            padding: '20px 24px',
                            color: '#ffffff',
                            '&:hover': {
                              background: 'rgba(255, 255, 255, 0.12)',
                              borderColor: 'rgba(100, 181, 246, 0.5)'
                            },
                            '&.Mui-focused': {
                              background: 'rgba(255, 255, 255, 0.15)',
                              borderColor: '#64b5f6',
                              boxShadow: '0 0 20px rgba(100, 181, 246, 0.3)'
                            },
                            '&::placeholder': {
                              color: 'rgba(255, 255, 255, 0.5)',
                              opacity: 1
                            }
                          }
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              border: 'none'
                            }
                          }
                        }}
                      />
                      
                      {/* Кнопка "Забыли пароль?" для существующих пользователей */}
                      {isExistingUser && (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                          <Button
                            onClick={handleResetPassword}
                            disabled={isResettingPassword}
                            sx={{
                              color: '#64b5f6',
                              textTransform: 'none',
                              fontSize: '0.9rem',
                              fontWeight: 500,
                              '&:hover': {
                                color: '#90caf9',
                                textDecoration: 'underline'
                              },
                              '&:disabled': {
                                color: 'rgba(255, 255, 255, 0.3)'
                              }
                            }}
                          >
                            {isResettingPassword ? 'Отправляем...' : 'Забыли пароль?'}
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </>
                )}

                {/* Шаг 2: Имя игрока (только для новых пользователей) */}
                {currentStep === 2 && !isExistingUser && (
                  <Box sx={{ mb: 4 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#ffffff',
                        mb: 2,
                        fontWeight: 600,
                        textAlign: 'left'
                      }}
                    >
                      Имя игрока
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Введите ваше имя"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      variant="outlined"
                      InputProps={{
                        sx: {
                          borderRadius: '16px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          fontSize: '1.125rem',
                          padding: '20px 24px',
                          color: '#ffffff',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.12)',
                            borderColor: 'rgba(100, 181, 246, 0.5)'
                          },
                          '&.Mui-focused': {
                            background: 'rgba(255, 255, 255, 0.15)',
                            borderColor: '#64b5f6',
                            boxShadow: '0 0 20px rgba(100, 181, 246, 0.3)'
                          },
                          '&::placeholder': {
                            color: 'rgba(255, 255, 255, 0.5)',
                            opacity: 1
                          }
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            border: 'none'
                          }
                        }
                      }}
                    />
                  </Box>
                )}

                {/* Шаг 3: Дополнительная информация (только для новых пользователей) */}
                {currentStep === 3 && !isExistingUser && (
                  <Box sx={{ mb: 4 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#ffffff',
                        mb: 2,
                        fontWeight: 600,
                        textAlign: 'left'
                      }}
                    >
                      Подтверждение
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        textAlign: 'center',
                        p: 2,
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      Проверьте введенные данные и нажмите "Завершить регистрацию"
                    </Typography>
                  </Box>
                )}

                {/* Ошибка с неоморфизмом */}
                {error && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 4, 
                        borderRadius: '16px',
                        background: 'rgba(244, 67, 54, 0.1)',
                        border: '1px solid rgba(244, 67, 54, 0.3)',
                        color: '#ffcdd2',
                        backdropFilter: 'blur(10px)',
                        '& .MuiAlert-icon': {
                          color: '#ffcdd2'
                        }
                      }}
                    >
                      {error}
                    </Alert>
                  </motion.div>
                )}

                {/* Сообщение о восстановлении пароля */}
                {resetPasswordMessage && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert 
                      severity="success" 
                      sx={{ 
                        mb: 4, 
                        borderRadius: '16px',
                        background: 'rgba(76, 175, 80, 0.1)',
                        border: '1px solid rgba(76, 175, 80, 0.3)',
                        color: '#c8e6c9',
                        backdropFilter: 'blur(10px)',
                        '& .MuiAlert-icon': {
                          color: '#c8e6c9'
                        }
                      }}
                    >
                      {resetPasswordMessage}
                    </Alert>
                  </motion.div>
                )}

                {/* Кнопки навигации */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  {/* Кнопка "Назад" */}
                  {currentStep > 1 && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={goBack}
                        variant="outlined"
                        size="large"
                        sx={{
                          flex: 1,
                          border: '2px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '20px',
                          padding: '24px',
                          fontSize: '1.125rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          letterSpacing: '0.02em',
                          color: '#ffffff',
                          background: 'rgba(255, 255, 255, 0.05)',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: 'rgba(255, 255, 255, 0.4)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        ← Назад
                      </Button>
                    </motion.div>
                  )}

                  {/* Основная кнопка */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ flex: 1 }}
                  >
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      sx={{
                        background: 'linear-gradient(135deg, #64b5f6 0%, #e1bee7 50%, #ffb74d 100%)',
                        color: '#ffffff',
                        borderRadius: '20px',
                        padding: '24px',
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        letterSpacing: '0.02em',
                        border: 'none',
                        boxShadow: `
                          0 8px 32px rgba(100, 181, 246, 0.3),
                          0 4px 16px rgba(255, 183, 77, 0.2),
                          inset 0 1px 0 rgba(255, 255, 255, 0.2)
                        `,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #42a5f5 0%, #ce93d8 50%, #ffa726 100%)',
                          boxShadow: `
                            0 12px 40px rgba(100, 181, 246, 0.4),
                            0 6px 20px rgba(255, 183, 77, 0.3),
                            inset 0 1px 0 rgba(255, 255, 255, 0.3)
                          `,
                          transform: 'translateY(-2px)'
                        },
                        '&:active': {
                          transform: 'translateY(0px)'
                        }
                      }}
                    >
                      {currentStep === 1 && (
                        <>
                          <PlayIcon sx={{ mr: 1, fontSize: '1.5rem' }} />
                          Продолжить
                        </>
                      )}
                      {currentStep === 2 && (
                        <>
                          <PlayIcon sx={{ mr: 1, fontSize: '1.5rem' }} />
                          Продолжить
                        </>
                      )}
                      {currentStep === 3 && (
                        <>
                          <PlayIcon sx={{ mr: 1, fontSize: '1.5rem' }} />
                          {isLogin ? 'Войти в игру' : 'Начать игру'}
                        </>
                      )}
                    </Button>
                  </motion.div>
                </Box>
              </Box>
            </Paper>
          </motion.div>

          {/* Информация с неоморфизмом */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <Paper 
              sx={{ 
                mt: 4, 
                p: 3, 
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StarIcon sx={{ 
                  color: '#ffd700', 
                  mr: 1,
                  filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.4))'
                }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#ffffff',
                    fontWeight: 600
                  }}
                >
                  Совет
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#b0bec5',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  fontWeight: 400,
                  textAlign: 'left'
                }}
              >
                Выберите запоминающееся имя, чтобы другие игроки могли вас найти и пригласить в игру
              </Typography>
            </Paper>
          </motion.div>
        </motion.div>
      </Box>

      {/* CSS анимации через sx */}
      <Box sx={{
        '@keyframes float': {
          '0%, 100%': { 
            transform: 'translateY(0px) rotate(0deg)' 
          },
          '50%': { 
            transform: 'translateY(-20px) rotate(180deg)' 
          }
        },
        '@keyframes pulse': {
          '0%, 100%': { 
            transform: 'translate(-50%, -50%) scale(1)', 
            opacity: 0.5 
          },
          '50%': { 
            transform: 'translate(-50%, -50%) scale(1.1)', 
            opacity: 0.8 
          }
        }
      }} />
    </Box>
  );
};

export default Registration;
