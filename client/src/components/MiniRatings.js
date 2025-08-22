import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as WealthIcon,
  Speed as SpeedIcon,
  Psychology as StrategyIcon,
  Timeline as ConsistencyIcon
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useRatings } from '../hooks/useRatings';

// Компонент мини-рейтинга
const MiniRatings = ({ roomId, currentPlayerId, compact = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState('overall');
  const { 
    ratings, 
    roomRatings, 
    fetchTopPlayers, 
    fetchRoomRatings, 
    formatNumber, 
    formatWinRate 
  } = useRatings();

  const categories = [
    { key: 'overall', label: 'Общий', icon: <TrendingUpIcon />, color: '#FF9800' },
    { key: 'wealth', label: 'Богатство', icon: <WealthIcon />, color: '#FFD700' },
    { key: 'speed', label: 'Скорость', icon: <SpeedIcon />, color: '#4CAF50' },
    { key: 'strategy', label: 'Стратегия', icon: <StrategyIcon />, color: '#2196F3' },
    { key: 'consistency', label: 'Консистентность', icon: <ConsistencyIcon />, color: '#9C27B0' }
  ];

  useEffect(() => {
    // Загружаем топ-5 игроков по каждой категории
    categories.forEach(cat => {
      fetchTopPlayers(cat.key, 5);
    });
    
    // Загружаем рейтинги комнаты
    if (roomId) {
      fetchRoomRatings(roomId, 5);
    }
  }, [roomId, fetchTopPlayers, fetchRoomRatings]);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  const getCurrentPlayerRank = (category = 'overall') => {
    const categoryRatings = ratings[category] || [];
    const playerIndex = categoryRatings.findIndex(rating => rating.playerId === currentPlayerId);
    
    if (playerIndex === -1) return null;
    
    return {
      rank: playerIndex + 1,
      rating: categoryRatings[playerIndex]
    };
  };

  const getTopPlayers = (category = 'overall', limit = 3) => {
    return (ratings[category] || []).slice(0, limit);
  };

  const getRoomTopPlayers = () => {
    return (roomRatings[roomId] || []).slice(0, 3);
  };

  const currentCategory = categories.find(cat => cat.key === activeCategory);

  return (
    <Card 
      sx={{ 
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ p: 2 }}>
        {/* Заголовок */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
            🏆 Рейтинг
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Переключатели категорий */}
            {categories.map((cat) => (
              <Tooltip key={cat.key} title={cat.label}>
                <IconButton
                  size="small"
                  onClick={() => handleCategoryChange(cat.key)}
                  sx={{
                    color: activeCategory === cat.key ? cat.color : 'rgba(255,255,255,0.5)',
                    backgroundColor: activeCategory === cat.key ? 'rgba(255,255,255,0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  {cat.icon}
                </IconButton>
              </Tooltip>
            ))}
            
            {/* Кнопка разворачивания */}
            <IconButton
              size="small"
              onClick={handleToggle}
              sx={{ color: 'white' }}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Текущая категория */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ color: currentCategory?.color, mr: 1 }}>
            {currentCategory?.icon}
          </Box>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            {currentCategory?.label}
          </Typography>
        </Box>

        {/* Топ-3 игрока по категории */}
        <Box sx={{ mb: 2 }}>
          {getTopPlayers(activeCategory, 3).map((player, index) => (
            <motion.div
              key={player.playerId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 1,
                  mb: 1,
                  borderRadius: 1,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                {/* Медаль */}
                <Box sx={{ mr: 1, minWidth: 24 }}>
                  {index === 0 && <TrophyIcon sx={{ color: '#FFD700', fontSize: 20 }} />}
                  {index === 1 && <TrophyIcon sx={{ color: '#C0C0C0', fontSize: 20 }} />}
                  {index === 2 && <TrophyIcon sx={{ color: '#CD7F32', fontSize: 20 }} />}
                </Box>
                
                {/* Аватар */}
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    mr: 1,
                    backgroundColor: player.color || '#9C27B0',
                    fontSize: '12px'
                  }}
                >
                  {player.username?.charAt(0) || 'И'}
                </Avatar>
                
                {/* Имя */}
                <Typography variant="body2" sx={{ color: 'white', flex: 1, fontSize: '12px' }}>
                  {player.username}
                </Typography>
                
                {/* Рейтинг */}
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>
                  {formatNumber(player.categories?.[activeCategory]?.score || player.overallScore)}
                </Typography>
              </Box>
            ))}
        </Box>

        {/* Позиция текущего игрока */}
        {currentPlayerId && (
          <Box sx={{ mb: 2 }}>
            {(() => {
              const playerRank = getCurrentPlayerRank(activeCategory);
              if (!playerRank) return null;
              
              return (
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    border: '1px solid #4CAF50'
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold', textAlign: 'center' }}>
                    Ваша позиция: #{playerRank.rank}
                  </Typography>
                </Box>
              );
            })()}
          </Box>
        )}

        {/* Развернутый вид */}
        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {/* Рейтинг комнаты */}
            {roomId && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  Рейтинг комнаты
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {getRoomTopPlayers().map((player, index) => (
                    <ListItem key={player.playerId} sx={{ p: 0, mb: 0.5 }}>
                      <ListItemAvatar sx={{ minWidth: 32 }}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            backgroundColor: player.color || '#9C27B0',
                            fontSize: '10px'
                          }}
                        >
                          {player.username?.charAt(0) || 'И'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ color: 'white', fontSize: '12px' }}>
                            {player.username}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            Счет: {formatNumber(player.totalScore)} | 
                            Игр: {player.gamesPlayed} | 
                            Побед: {formatWinRate(player.gamesPlayed, player.gamesWon)}
                          </Typography>
                        }
                      />
                      <Chip
                        label={`#${index + 1}`}
                        size="small"
                        sx={{
                          backgroundColor: index === 0 ? '#FFD700' : 
                                         index === 1 ? '#C0C0C0' : 
                                         index === 2 ? '#CD7F32' : '#666',
                          color: 'white',
                          fontSize: '10px',
                          height: 20
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Детальная статистика по категориям */}
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                Детали по категориям
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {categories.map((cat) => {
                  const playerRank = getCurrentPlayerRank(cat.key);
                  if (!playerRank) return null;
                  
                  return (
                    <Chip
                      key={cat.key}
                      icon={cat.icon}
                      label={`${cat.label}: #${playerRank.rank}`}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: cat.color,
                        border: `1px solid ${cat.color}`,
                        fontSize: '10px'
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default MiniRatings;
