const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Конфигурация JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

// Регистрация нового пользователя
router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Валидация входных данных
    if (!email || !username || !password) {
      return res.status(400).json({
        error: 'Все поля обязательны для заполнения'
      });
    }

    // Проверка длины пароля
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Пароль должен содержать минимум 6 символов'
      });
    }

    // Проверка длины имени пользователя
    if (username.length < 3) {
      return res.status(400).json({
        error: 'Имя пользователя должно содержать минимум 3 символа'
      });
    }

    // Проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Введите корректный email адрес'
      });
    }

    // Проверка, существует ли пользователь с таким email
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: 'Пользователь с таким email уже существует'
      });
    }

    // Проверка, существует ли пользователь с таким именем
    const existingUsername = await User.findOne({ username: username });
    if (existingUsername) {
      return res.status(400).json({
        error: 'Пользователь с таким именем уже существует'
      });
    }

    // Получение следующего userId
    const nextUserId = await User.getNextUserId();

    // Хеширование пароля
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Создание нового пользователя
    const newUser = new User({
      userId: nextUserId,
      email: email.toLowerCase(),
      username: username,
      passwordHash: passwordHash
    });

    // Сохранение пользователя
    await newUser.save();

    // Создание JWT токена
    const token = jwt.sign(
      { 
        userId: newUser.userId, 
        email: newUser.email,
        username: newUser.username 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Отправка ответа (без пароля)
    const userResponse = {
      userId: newUser.userId,
      email: newUser.email,
      username: newUser.username,
      displayId: newUser.displayId,
      registeredAt: newUser.registeredAt,
      role: newUser.role,
      gameStats: newUser.gameStats,
      preferences: newUser.preferences
    };

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: userResponse,
      token: token
    });

  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Вход пользователя
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Валидация входных данных
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email и пароль обязательны'
      });
    }

    // Поиск пользователя по email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Неверный email или пароль'
      });
    }

    // Проверка статуса аккаунта
    if (user.status !== 'active') {
      return res.status(401).json({
        error: 'Аккаунт заблокирован или удален'
      });
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Неверный email или пароль'
      });
    }

    // Обновление времени последнего входа
    await user.updateLastLogin();

    // Создание JWT токена
    const token = jwt.sign(
      { 
        userId: user.userId, 
        email: user.email,
        username: user.username 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Отправка ответа (без пароля)
    const userResponse = {
      userId: user.userId,
      email: user.email,
      username: user.username,
      displayId: user.displayId,
      lastLogin: user.lastLogin,
      role: user.role,
      gameStats: user.gameStats,
      preferences: user.preferences
    };

    res.json({
      message: 'Вход выполнен успешно',
      user: userResponse,
      token: token
    });

  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Проверка токена (middleware)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Токен доступа не предоставлен'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: 'Токен недействителен или истек'
      });
    }
    req.user = user;
    next();
  });
};

// Получение профиля пользователя
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByUserId(req.user.userId);
    if (!user) {
      return res.status(404).json({
        error: 'Пользователь не найден'
      });
    }

    // Отправка ответа (без пароля)
    const userResponse = {
      userId: user.userId,
      email: user.email,
      username: user.username,
      displayId: user.displayId,
      registeredAt: user.registeredAt,
      lastLogin: user.lastLogin,
      role: user.role,
      gameStats: user.gameStats,
      preferences: user.preferences
    };

    res.json({
      user: userResponse
    });

  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Обновление профиля пользователя
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, preferences } = req.body;
    const user = await User.findByUserId(req.user.userId);

    if (!user) {
      return res.status(404).json({
        error: 'Пользователь не найден'
      });
    }

    // Обновление имени пользователя (если предоставлено)
    if (username && username !== user.username) {
      // Проверка, не занято ли имя другим пользователем
      const existingUsername = await User.findOne({ 
        username: username,
        userId: { $ne: user.userId }
      });
      
      if (existingUsername) {
        return res.status(400).json({
          error: 'Пользователь с таким именем уже существует'
        });
      }

      user.username = username;
    }

    // Обновление настроек (если предоставлены)
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    // Отправка обновленного профиля
    const userResponse = {
      userId: user.userId,
      email: user.email,
      username: user.username,
      displayId: user.displayId,
      registeredAt: user.registeredAt,
      lastLogin: user.lastLogin,
      role: user.role,
      gameStats: user.gameStats,
      preferences: user.preferences
    };

    res.json({
      message: 'Профиль обновлен успешно',
      user: userResponse
    });

  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Изменение пароля
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Текущий и новый пароль обязательны'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Новый пароль должен содержать минимум 6 символов'
      });
    }

    const user = await User.findByUserId(req.user.userId);
    if (!user) {
      return res.status(404).json({
        error: 'Пользователь не найден'
      });
    }

    // Проверка текущего пароля
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: 'Неверный текущий пароль'
      });
    }

    // Хеширование нового пароля
    const saltRounds = 12;
    user.passwordHash = await bcrypt.hash(newPassword, saltRounds);
    await user.save();

    res.json({
      message: 'Пароль успешно изменен'
    });

  } catch (error) {
    console.error('Ошибка изменения пароля:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
});

module.exports = router;
