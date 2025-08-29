const nodemailer = require('nodemailer');
const { getEmailConfig } = require('./email-config');

// Создание транспорта для отправки email
function createTransporter() {
  const config = getEmailConfig();
  
  // Для тестирования без реальной отправки
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('📧 [EMAIL] Creating test transporter (emails will not be sent)');
    return {
      sendMail: (options) => {
        console.log('📧 [EMAIL] TEST MODE - Email would be sent:');
        console.log('📧 [EMAIL] To:', options.to);
        console.log('📧 [EMAIL] Subject:', options.subject);
        console.log('📧 [EMAIL] Text:', options.text);
        console.log('📧 [EMAIL] HTML:', options.html);
        
        // Возвращаем успешный результат для тестирования
        return Promise.resolve({
          messageId: 'test-message-id',
          response: 'Test mode - email not sent'
        });
      }
    };
  }
  
  return nodemailer.createTransporter(config);
}

// Функция для отправки email с восстановлением пароля
async function sendPasswordResetEmail(email, username, newPassword) {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@energymoney.com',
      to: email,
      subject: '🔐 Восстановление пароля - Energy of Money',
      text: `
Здравствуйте, ${username}!

Ваш новый пароль для игры "Energy of Money": ${newPassword}

Рекомендуем сменить пароль после входа в игру.

С уважением,
Команда Energy of Money
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🔐 Восстановление пароля</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Energy of Money</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Здравствуйте, ${username}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Мы получили запрос на восстановление пароля для вашего аккаунта.
            </p>
            
            <div style="background-color: #f0f8ff; border: 2px solid #4CAF50; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; font-size: 18px; color: #333; font-weight: bold;">
                Ваш новый пароль:
              </p>
              <p style="margin: 10px 0 0 0; font-size: 24px; color: #4CAF50; font-weight: bold; letter-spacing: 2px;">
                ${newPassword}
              </p>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                ⚠️ <strong>Важно:</strong> Рекомендуем сменить пароль после входа в игру для безопасности.
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:3000" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                Войти в игру
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              С уважением,<br>
              Команда Energy of Money
            </p>
          </div>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL] Password reset email sent successfully to ${email}`);
    console.log(`✅ [EMAIL] Message ID: ${result.messageId}`);
    
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error(`❌ [EMAIL] Error sending password reset email to ${email}:`, error);
    return { success: false, error: error.message };
  }
}

// Функция для генерации случайного пароля
function generateRandomPassword(length = 8) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}

module.exports = {
  sendPasswordResetEmail,
  generateRandomPassword,
  createTransporter
};

