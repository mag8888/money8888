const express = require('express');
const router = express.Router();

// Базовые роуты аутентификации
router.post('/register', (req, res) => {
  res.json({ message: 'Registration endpoint' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint' });
});

module.exports = router;
