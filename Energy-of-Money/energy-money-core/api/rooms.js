// API для работы с комнатами
let rooms = [
    {
        id: 'room1',
        name: 'Комната 1',
        currentPlayers: 2,
        maxPlayers: 4,
        status: 'waiting',
        gameTime: 2,
        password: null,
        profession: 'engineer',
        isPrivate: false,
        createdAt: new Date().toISOString(),
        creatorId: 'user1',
        creatorName: 'Игрок 1',
        players: [
            { id: 'user1', name: 'Игрок 1', isReady: true },
            { id: 'user2', name: 'Игрок 2', isReady: false }
        ]
    },
    {
        id: 'room2',
        name: 'Комната 2',
        currentPlayers: 1,
        maxPlayers: 4,
        status: 'waiting',
        gameTime: 3,
        password: 'secret123',
        profession: 'doctor',
        isPrivate: false,
        createdAt: new Date().toISOString(),
        creatorId: 'user3',
        creatorName: 'Игрок 3',
        players: [
            { id: 'user3', name: 'Игрок 3', isReady: false }
        ]
    }
];

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
    
    if (method === 'GET') {
        // Получаем список доступных комнат
        res.status(200).json({
            success: true,
            rooms: rooms
        });
    } else if (method === 'POST') {
        const { name, maxPlayers, gameTime, password, profession, isPrivate, creatorId, creatorName } = req.body;
        
        // Создаем новую комнату
        const room = {
            id: 'room' + Date.now(),
            name: name || 'Новая комната',
            currentPlayers: 1,
            maxPlayers: maxPlayers || 4,
            status: 'waiting',
            gameTime: gameTime || 2,
            password: password || null,
            profession: profession || null,
            isPrivate: isPrivate || false,
            createdAt: new Date().toISOString(),
            creatorId: creatorId || 'unknown',
            creatorName: creatorName || 'Неизвестный',
            players: [
                { id: creatorId || 'unknown', name: creatorName || 'Неизвестный', isReady: false }
            ]
        };
        
        // Добавляем комнату в список
        rooms.push(room);
        
        res.status(200).json({
            success: true,
            room: room,
            message: 'Комната создана успешно'
        });
    } else if (method === 'PUT') {
        const { roomId, action, userId, userName } = req.body;
        
        const room = rooms.find(r => r.id === roomId);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Комната не найдена'
            });
        }
        
        if (action === 'join') {
            // Проверяем, не переполнена ли комната
            if (room.currentPlayers >= room.maxPlayers) {
                return res.status(400).json({
                    success: false,
                    message: 'Комната переполнена'
                });
            }
            
            // Проверяем, не находится ли игрок уже в комнате
            const existingPlayer = room.players.find(p => p.id === userId);
            if (existingPlayer) {
                return res.status(400).json({
                    success: false,
                    message: 'Вы уже в этой комнате'
                });
            }
            
            // Добавляем игрока в комнату
            room.players.push({ id: userId, name: userName, isReady: false });
            room.currentPlayers = room.players.length;
            
            res.status(200).json({
                success: true,
                room: room,
                message: 'Вы присоединились к комнате'
            });
        } else if (action === 'leave') {
            // Удаляем игрока из комнаты
            room.players = room.players.filter(p => p.id !== userId);
            room.currentPlayers = room.players.length;
            
            // Если комната пустая, удаляем её
            if (room.players.length === 0) {
                rooms = rooms.filter(r => r.id !== roomId);
            }
            
            res.status(200).json({
                success: true,
                room: room,
                message: 'Вы покинули комнату'
            });
        } else if (action === 'toggleReady') {
            const player = room.players.find(p => p.id === userId);
            if (player) {
                player.isReady = !player.isReady;
            }
            
            res.status(200).json({
                success: true,
                room: room,
                message: 'Статус готовности изменен'
            });
        } else if (action === 'start') {
            // Проверяем, что все игроки готовы
            const allReady = room.players.every(p => p.isReady);
            if (!allReady) {
                return res.status(400).json({
                    success: false,
                    message: 'Не все игроки готовы'
                });
            }
            
            room.status = 'playing';
            
            res.status(200).json({
                success: true,
                room: room,
                message: 'Игра началась!'
            });
        } else if (action === 'removePlayer') {
            const { targetUserId } = req.body;
            
            // Только создатель может удалять игроков
            if (room.creatorId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Только создатель может удалять игроков'
                });
            }
            
            // Удаляем игрока из комнаты
            room.players = room.players.filter(p => p.id !== targetUserId);
            room.currentPlayers = room.players.length;
            
            res.status(200).json({
                success: true,
                room: room,
                message: 'Игрок удален из комнаты'
            });
        } else if (action === 'selectDream') {
            const { dream } = req.body;
            
            const player = room.players.find(p => p.id === userId);
            if (player) {
                player.dream = dream;
            }
            
            res.status(200).json({
                success: true,
                room: room,
                message: 'Мечта выбрана'
            });
        }
    } else {
        res.status(405).json({
            success: false,
            message: 'Метод не поддерживается'
        });
    }
}
