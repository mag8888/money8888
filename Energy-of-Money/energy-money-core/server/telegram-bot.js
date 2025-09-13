const { Telegraf, Markup } = require('telegraf');

class TelegramBot {
    constructor(botToken, gameUrl, dbManager) {
        this.bot = new Telegraf(botToken);
        this.gameUrl = gameUrl;
        this.dbManager = dbManager;
        this.googleDriveUrl = 'https://drive.google.com/uc?export=view&id=';
        
        // ID файлов из Google Drive
        this.driveFileIds = {
            '1.png': '1DVFh1fEm5CG0crg_OYWKBrLIjnmgwjm8', // Приветственное изображение
            '3.png': '1oZKXefyAPKIgxQ0tYrewUhhb5cewtUWS', // О проекте
            '6.png': '1TKi83s951WoB4FRONr8DnAITmZ8jCyfA', // Играть
            '10.png': '1Yvt736pFZgnkDT-wcyIzJfsqD573sK3B', // Доход (первое)
            '15.png': '1P_RJ8gYipADlTL8zHVXmyEdgzTbwJn_8', // Доход (второе) и Получить клиентов
            '16.png': '1gLf1Nwna9WFtu99thlo7ic8k51CBBnsR'  // Доход (третье)
        };
        
        this.setupHandlers();
    }

    // Функция для получения URL изображений
    getImageUrls() {
        return {
            welcome: `${this.googleDriveUrl}${this.driveFileIds['1.png']}`,
            about: `${this.googleDriveUrl}${this.driveFileIds['3.png']}`,
            income: `${this.googleDriveUrl}${this.driveFileIds['10.png']}`,
            clients: `${this.googleDriveUrl}${this.driveFileIds['15.png']}`,
            play: `${this.googleDriveUrl}${this.driveFileIds['6.png']}`,
            balance: `${this.googleDriveUrl}${this.driveFileIds['15.png']}`,
            ref: `${this.googleDriveUrl}${this.driveFileIds['15.png']}`,
            franchise: `${this.googleDriveUrl}${this.driveFileIds['16.png']}`
        };
    }

    // Функция для получения или создания пользователя
    async getUser(userId) {
        try {
            let user = await this.dbManager.getUser(userId);
            if (!user) {
                user = {
                    telegram_id: userId,
                    balance: 10, // 10$ за регистрацию
                    referrals: 0,
                    ref_code: `ref_${userId}`,
                    created_at: new Date().toISOString()
                };
                await this.dbManager.createUser(user);
            }
            return user;
        } catch (error) {
            console.error('Error getting user:', error);
            // Fallback к in-memory storage
            return {
                telegram_id: userId,
                balance: 10,
                referrals: 0,
                ref_code: `ref_${userId}`
            };
        }
    }

    // Функция для обработки реферала
    async processReferral(userId, referrerId) {
        try {
            const user = await this.getUser(userId);
            const referrer = await this.getUser(referrerId);
            
            // Начисляем 10$ за регистрацию
            user.balance += 10;
            
            // Начисляем 10$ рефереру
            referrer.balance += 10;
            referrer.referrals += 1;
            
            // Сохраняем в базу данных
            await this.dbManager.updateUser(user);
            await this.dbManager.updateUser(referrer);
            
            return { user, referrer };
        } catch (error) {
            console.error('Error processing referral:', error);
            return { user: null, referrer: null };
        }
    }

    setupHandlers() {
        // Главное меню
        const mainMenu = Markup.keyboard([
            ['📖 О проекте', '💰 Доход'],
            ['👥 Получить клиентов'],
            ['🎮 Играть', '💳 Баланс']
        ]).resize();

        // Обработчик команды /start
        this.bot.start(async (ctx) => {
            const userId = ctx.from.id;
            const startParam = ctx.message.text.split(' ')[1]; // Получаем параметр после /start
            
            // Обрабатываем реферала, если есть параметр
            if (startParam && startParam.startsWith('ref_')) {
                const referrerId = parseInt(startParam.replace('ref_', ''));
                if (referrerId && referrerId !== userId) {
                    const { user, referrer } = await this.processReferral(userId, referrerId);
                    
                    // Уведомляем реферера
                    if (referrer) {
                        try {
                            await ctx.telegram.sendMessage(referrerId, 
                                `🎉 У вас новый реферал! Баланс пополнен на 10$. Текущий баланс: ${referrer.balance}$`
                            );
                        } catch (e) {
                            // Игнорируем ошибки отправки уведомления
                        }
                    }
                }
            }
            
            const user = await this.getUser(userId);
            
            const welcomeText = `👋 Привет друг! 👑 (подруга)

🎉 Добро пожаловать в Энергию Денег 

✨ — пространство, где игра соединяется с реальными возможностями в квантовом поле.

🚀 Здесь ты сможешь:
• 🫂 найти друзей
• 💰 увеличить доход 
• 🤝 найти клиентов 
• 🎲 играть и развиваться 

🎯 Выбирай, что интересно прямо сейчас 👇`;

            // Получаем URL изображений
            const images = this.getImageUrls();
            
            // Пытаемся отправить фото с приветствием
            try {
                await ctx.replyWithPhoto(images.welcome, { 
                    caption: welcomeText, 
                    reply_markup: mainMenu.reply_markup 
                });
            } catch (error) {
                // Если фото нет, отправляем только текст
                await ctx.reply(welcomeText, mainMenu);
            }
        });

        // О проекте
        this.bot.hears('📖 О проекте', async (ctx) => {
            const aboutText = `🎮 «Энергия Денег» — это новая образовательная игра, созданная на основе принципов CashFlow.  

💡 Она помогает менять мышление, прокачивать навыки и открывать новые финансовые возможности.`;

            // Получаем URL изображений
            const images = this.getImageUrls();
            
            // Пытаемся отправить фото, если есть
            try {
                await ctx.replyWithPhoto(images.about, { caption: aboutText });
            } catch (error) {
                // Если фото нет, отправляем только текст
                await ctx.reply(aboutText);
            }
        });

        // Получить клиентов
        this.bot.hears('👥 Получить клиентов', async (ctx) => {
            const clientsText = `🎯 Через игру ты можешь находить новых клиентов и партнёров.  

🚀 Это современный инструмент продвижения твоего бизнеса и укрепления связей.`;

            const clientsKeyboard = Markup.inlineKeyboard([
                [Markup.button.url('👨‍💼 Стать мастером', 'https://t.me/Aurelia_8888?text=Хочу стать мастером, расскажите подробнее о том, как получать клиентов через игру')]
            ]);

            // Получаем URL изображений
            const images = this.getImageUrls();
            
            // Пытаемся отправить фото, если есть
            try {
                await ctx.replyWithPhoto(images.clients, {
                    caption: clientsText,
                    reply_markup: clientsKeyboard.reply_markup
                });
            } catch (error) {
                // Если фото нет, отправляем только текст
                await ctx.reply(clientsText, clientsKeyboard);
            }
        });

        // Доход
        this.bot.hears('💰 Доход', async (ctx) => {
            const earnText = `💰 Хочешь зарабатывать вместе с «Энергией Денег»?  

🤝 Стань партнёром проекта и получай доход, играя и помогая другим людям развиваться.`;

            const earnKeyboard = Markup.inlineKeyboard([
                [Markup.button.url('📱 Связаться с менеджером', 'https://t.me/Aurelia_8888?text=Хочу стать партнером, расскажите подробнее о франшизе')]
            ]);

            // Получаем URL изображений
            const images = this.getImageUrls();
            
            // Отправляем три картинки подряд
            try {
                // Первая картинка с текстом и кнопкой на менеджера
                await ctx.replyWithPhoto(images.income, {
                    caption: earnText,
                    reply_markup: earnKeyboard.reply_markup
                });
                
                // Вторая картинка с реф программой
                setTimeout(async () => {
                    const refText = `🔗 Ваша реф ссылка

💵 За каждого приглашенного вы получаете 10$ которые сможете потратить внутри бота`;
                    
                    const refKeyboard = Markup.inlineKeyboard([
                        [Markup.button.url('🔗 Получить реф ссылку', 'https://t.me/anreal_money_bot?start=ref_' + ctx.from.id)]
                    ]);
                    
                    await ctx.replyWithPhoto(images.ref, {
                        caption: refText,
                        reply_markup: refKeyboard.reply_markup
                    });
                }, 5000);
                
                // Третья картинка с франшизой
                setTimeout(async () => {
                    const franchiseText = `🏢 Купить франшизу`;
                    
                    const franchiseKeyboard = Markup.inlineKeyboard([
                        [Markup.button.url('💼 Купить франшизу', 'https://t.me/Aurelia_8888?text=Хочу купить франшизу, расскажите подробнее о условиях и стоимости')]
                    ]);
                    
                    await ctx.replyWithPhoto(images.franchise, {
                        caption: franchiseText,
                        reply_markup: franchiseKeyboard.reply_markup
                    });
                }, 10000);
                
            } catch (error) {
                // Если фото нет, отправляем только текст
                await ctx.reply(earnText, earnKeyboard);
            }
        });

        // Играть
        this.bot.hears('🎮 Играть', async (ctx) => {
            const gameText = `🎮 Готов попробовать? 🎲  

🚀 Запускай игру прямо сейчас и прокачивай свои навыки в мире финансовых решений!`;

            const gameKeyboard = Markup.inlineKeyboard([
                [Markup.button.callback('🚀 Начать игру', 'start_game')]
            ]);

            // Получаем URL изображений
            const images = this.getImageUrls();
            
            // Пытаемся отправить фото, если есть
            try {
                await ctx.replyWithPhoto(images.play, {
                    caption: gameText,
                    reply_markup: gameKeyboard.reply_markup
                });
            } catch (error) {
                // Если фото нет, отправляем только текст
                await ctx.reply(gameText, gameKeyboard);
            }
        });

        // Обработчик кнопки "Начать игру"
        this.bot.action('start_game', async (ctx) => {
            await ctx.answerCbQuery();
            
            const gameKeyboard = Markup.inlineKeyboard([
                [Markup.button.url('🎮 Открыть игру', this.gameUrl)]
            ]);

            await ctx.reply('✅ Регистрация в игре завершена!\n\n🌐 Перейдите по ссылке ниже, чтобы начать играть:', gameKeyboard);
        });

        // Баланс
        this.bot.hears('💳 Баланс', async (ctx) => {
            const userId = ctx.from.id;
            const user = await this.getUser(userId);
            
            const balanceText = `💳 Ваш баланс: ${user.balance}$

👥 Количество приглашенных: ${user.referrals}

🔗 Ваша реферальная ссылка:
https://t.me/energy_m_bot?start=${user.ref_code}

💰 Приглашайте друзей - вы и друг получите по 10$ на баланс!`;

            const balanceKeyboard = Markup.inlineKeyboard([
                [Markup.button.url('🔗 Поделиться ссылкой', `https://t.me/share/url?url=https://t.me/energy_m_bot?start=${user.ref_code}&text=Присоединяйся к игре Энергия Денег!`)]
            ]);

            await ctx.reply(balanceText, balanceKeyboard);
        });

        // Обработка неизвестных сообщений
        this.bot.on('text', async (ctx) => {
            await ctx.reply('🤔 Не понимаю эту команду. Используйте меню ниже для навигации! 👇', mainMenu);
        });
    }

    // Запуск бота
    async start() {
        try {
            await this.bot.launch();
            console.log('🤖 Telegram бот запущен!');
            console.log('🔗 Ссылка на бота: https://t.me/energy_m_bot');
            return true;
        } catch (error) {
            console.error('❌ Ошибка запуска бота:', error);
            return false;
        }
    }

    // Остановка бота
    async stop() {
        try {
            await this.bot.stop();
            console.log('🤖 Telegram бот остановлен');
        } catch (error) {
            console.error('❌ Ошибка остановки бота:', error);
        }
    }

    // Получение API изображений
    getImageApiResponse() {
        return this.getImageUrls();
    }
}

module.exports = TelegramBot;
