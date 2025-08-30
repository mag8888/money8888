// Конфигурация для отправки email
const emailConfig = {
  // Gmail SMTP настройки (можно использовать и другие сервисы)
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true для 465, false для других портов
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com', // Ваш Gmail
    pass: process.env.EMAIL_PASS || 'your-app-password' // Пароль приложения Gmail
  }
};

// Альтернативная конфигурация для тестирования (без реальной отправки)
const testConfig = {
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'test@example.com',
    pass: 'test-password'
  }
};

// Функция для получения конфигурации
function getEmailConfig() {
  // Если есть реальные email настройки, используем их
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return emailConfig;
  }
  
  // Иначе используем тестовую конфигурацию
  console.log('⚠️ [EMAIL] Using test configuration. Set EMAIL_USER and EMAIL_PASS environment variables for real email sending.');
  return testConfig;
}

module.exports = {
  getEmailConfig,
  emailConfig,
  testConfig
};

