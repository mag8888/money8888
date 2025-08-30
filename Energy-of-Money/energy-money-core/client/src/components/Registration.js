import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { connectSocket } from '../socket';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Email as EmailIcon,
  Person as PersonIcon,
  Lock as LockIcon
} from '@mui/icons-material';

const Registration = ({ onRegister }) => {
  // Состояние формы
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  // Состояние UI
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetPasswordMessage, setResetPasswordMessage] = useState('');

  // Шаги регистрации
  const steps = ['Email', 'Username', 'Password'];

  // Подключение к Socket.IO при монтировании
  useEffect(() => {
    console.log('🔌 [Registration] Component mounted, connecting to socket...');
    connectSocket().catch(console.error);
  }, []);

  // Очистка ошибок при изменении шага
  useEffect(() => {
    setError('');
  }, [currentStep]);

  // Обработчик изменения полей формы
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Очищаем ошибки при вводе
  }, []);

  // Валидация email
  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }, []);

  // Валидация username
  const validateUsername = useCallback((username) => {
    return username.trim().length >= 2;
  }, []);

  // Валидация password
  const validatePassword = useCallback((password) => {
    return password.length >= 6;
  }, []);

  // Проверка существования пользователя
  const checkUserExists = useCallback(async () => {
    if (!validateEmail(formData.email)) {
      setError('Введите корректный email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Эмулируем проверку пользователя (в реальном приложении здесь будет API вызов)
      const userExists = Math.random() > 0.5; // Временно для демонстрации
      
      if (userExists) {
        setIsExistingUser(true);
        setCurrentStep(1); // Переходим к вводу username
        console.log('🔍 [Registration] User exists, proceeding to username step');
      } else {
        setIsExistingUser(false);
        setCurrentStep(1); // Переходим к вводу username для нового пользователя
        console.log('🔍 [Registration] New user, proceeding to username step');
      }
    } catch (error) {
      console.error('❌ [Registration] Error checking user:', error);
      setError('Ошибка при проверке пользователя. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  }, [formData.email, validateEmail]);

  // Проверка уникальности username
  const checkUsernameUnique = useCallback(async () => {
    if (!validateUsername(formData.username)) {
      setError('Имя должно содержать минимум 2 символа');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Эмулируем проверку уникальности (в реальном приложении здесь будет API вызов)
      const isUnique = Math.random() > 0.3; // Временно для демонстрации
      
      if (isUnique) {
        if (isExistingUser) {
          // Существующий пользователь - переходим к вводу пароля
          setCurrentStep(2);
          console.log('✅ [Registration] Username confirmed for existing user');
        } else {
          // Новый пользователь - переходим к вводу пароля
          setCurrentStep(2);
          console.log('✅ [Registration] Username is unique for new user');
        }
      } else {
        setError('Пользователь с таким именем уже существует. Выберите другое имя.');
      }
    } catch (error) {
      console.error('❌ [Registration] Error checking username:', error);
      setError('Ошибка при проверке имени. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  }, [formData.username, validateUsername, isExistingUser]);

  // Финальная обработка формы
  const handleFinalSubmit = useCallback(async () => {
    if (isExistingUser && !validatePassword(formData.password)) {
      setError('Введите пароль');
      return;
    }

    if (!isExistingUser && !validatePassword(formData.password)) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Эмулируем регистрацию/вход (в реальном приложении здесь будет API вызов)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData = {
        id: `user_${Date.now()}`,
        username: formData.username,
        email: formData.email
      };

      console.log('✅ [Registration] User authenticated:', userData);
      onRegister(userData);
    } catch (error) {
      console.error('❌ [Registration] Error during authentication:', error);
      setError('Ошибка при аутентификации. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, validatePassword, isExistingUser, onRegister]);

  // Обработчик отправки формы
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    console.log('🎯 [Registration] Form submitted at step:', currentStep);

    switch (currentStep) {
      case 0:
        checkUserExists();
        break;
      case 1:
        checkUsernameUnique();
        break;
      case 2:
        handleFinalSubmit();
        break;
      default:
        console.error('❌ [Registration] Invalid step:', currentStep);
    }
  }, [currentStep, checkUserExists, checkUsernameUnique, handleFinalSubmit]);

  // Обработчик сброса пароля
  const handleResetPassword = useCallback(async () => {
    if (!validateEmail(formData.email)) {
      setError('Введите корректный email для сброса пароля');
      return;
    }

    setIsResettingPassword(true);
    setError('');

    try {
      // Эмулируем сброс пароля (в реальном приложении здесь будет API вызов)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResetPasswordMessage('Инструкции по сбросу пароля отправлены на ваш email');
      console.log('📧 [Registration] Password reset requested for:', formData.email);
    } catch (error) {
      console.error('❌ [Registration] Error resetting password:', error);
      setError('Ошибка при сбросе пароля. Попробуйте еще раз.');
    } finally {
      setIsResettingPassword(false);
    }
  }, [formData.email, validateEmail]);

  // Переход к предыдущему шагу
  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  }, [currentStep]);

  // Переход к следующему шагу
  const goToNextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setError('');
    }
  }, [currentStep, steps.length]);

  // Получение заголовка для текущего шага
  const getStepTitle = useCallback(() => {
    if (currentStep === 0) return 'Введите ваш email';
    if (currentStep === 1) return isExistingUser ? 'Подтвердите имя пользователя' : 'Выберите имя пользователя';
    if (currentStep === 2) return isExistingUser ? 'Введите пароль' : 'Создайте пароль';
    return '';
  }, [currentStep, isExistingUser]);

  // Получение описания для текущего шага
  const getStepDescription = useCallback(() => {
    if (currentStep === 0) return 'Мы проверим, есть ли у вас аккаунт';
    if (currentStep === 1) return isExistingUser ? 'Подтвердите ваше имя пользователя' : 'Выберите уникальное имя для игры';
    if (currentStep === 2) return isExistingUser ? 'Введите пароль для входа' : 'Создайте надежный пароль';
    return '';
  }, [currentStep, isExistingUser]);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: 500,
          width: '100%',
          padding: 4,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Заголовок */}
        <Box textAlign="center" mb={4}>
          <Box
            component={motion.div}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            sx={{ fontSize: '3rem', mb: 2 }}
          >
            🎮
          </Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Energy of Money
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {getStepTitle()}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            {getStepDescription()}
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Форма */}
        <Box component="form" onSubmit={handleSubmit}>
          {/* Шаг 0: Email */}
          {currentStep === 0 && (
            <Box>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="example@email.com"
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ mb: 2 }}
                disabled={isLoading}
              />
              
              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={isLoading || !formData.email.trim()}
                sx={{ mb: 2 }}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Продолжить'}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={handleResetPassword}
                disabled={isResettingPassword || !formData.email.trim()}
                size="small"
              >
                {isResettingPassword ? <CircularProgress size={16} /> : 'Забыли пароль?'}
              </Button>
            </Box>
          )}

          {/* Шаг 1: Username */}
          {currentStep === 1 && (
            <Box>
              <TextField
                fullWidth
                label="Имя пользователя"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Введите ваше имя"
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ mb: 2 }}
                disabled={isLoading}
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={goToPreviousStep}
                  disabled={isLoading}
                  sx={{ flex: 1 }}
                >
                  Назад
                </Button>
                <Button
                  variant="contained"
                  onClick={goToNextStep}
                  disabled={isLoading || !formData.username.trim()}
                  sx={{ flex: 1 }}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Продолжить'}
                </Button>
              </Box>
            </Box>
          )}

          {/* Шаг 2: Password */}
          {currentStep === 2 && (
            <Box>
              <TextField
                fullWidth
                label={isExistingUser ? "Пароль" : "Создайте пароль"}
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder={isExistingUser ? "Введите пароль" : "Минимум 6 символов"}
                InputProps={{
                  startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ mb: 2 }}
                disabled={isLoading}
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={goToPreviousStep}
                  disabled={isLoading}
                  sx={{ flex: 1 }}
                >
                  Назад
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={isLoading || !formData.password}
                  sx={{ flex: 1 }}
                >
                  {isLoading ? <CircularProgress size={24} /> : (isExistingUser ? 'Войти' : 'Создать аккаунт')}
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        {/* Сообщения об ошибках */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Сообщение о сбросе пароля */}
        {resetPasswordMessage && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {resetPasswordMessage}
          </Alert>
        )}

        {/* Информация о шаге */}
        <Box textAlign="center" mt={3}>
          <Typography variant="body2" color="text.secondary">
            Шаг {currentStep + 1} из {steps.length}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Registration;
