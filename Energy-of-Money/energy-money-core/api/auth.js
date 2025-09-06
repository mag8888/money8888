// Mock API для авторизации
export default function handler(req, res) {
    const { method } = req;
    
    // Включаем CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (method === 'POST') {
        const { action, email, password, name } = req.body;
        
        if (action === 'login') {
            // Простая проверка логина
            if (email && password) {
                res.status(200).json({
                    success: true,
                    user: {
                        id: 'user_' + Date.now(),
                        name: name || email.split('@')[0],
                        email: email,
                        token: 'mock_token_' + Date.now()
                    },
                    message: 'Вход выполнен успешно'
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Неверные данные для входа'
                });
            }
        } else if (action === 'register') {
            // Простая регистрация
            if (email && password && name) {
                res.status(200).json({
                    success: true,
                    user: {
                        id: 'user_' + Date.now(),
                        name: name,
                        email: email,
                        token: 'mock_token_' + Date.now()
                    },
                    message: 'Регистрация выполнена успешно'
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Не все поля заполнены'
                });
            }
        } else {
            res.status(400).json({
                success: false,
                message: 'Неизвестное действие'
            });
        }
    } else {
        res.status(405).json({
            success: false,
            message: 'Метод не поддерживается'
        });
    }
}
