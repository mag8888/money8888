import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as WealthIcon,
  Speed as SpeedIcon,
  Psychology as StrategyIcon,
  Timeline as ConsistencyIcon,
  Refresh as RefreshIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRatings } from '../hooks/useRatings';

// Компонент для отображения топ-3 игроков
const Top3Players = ({ players, category, formatNumber, formatTime, formatWinRate }) => {
  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'wealth': return <WealthIcon />;
      case 'speed': return <SpeedIcon />;
      case 'strategy': return <StrategyIcon />;
      case 'consistency': return <ConsistencyIcon />;
      default: return <TrendingUpIcon />;
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'wealth': return '#FFD700';
      case 'speed': return '#4CAF50';
      case 'strategy': return '#2196F3';
      case 'consistency': return '#9C27B0';
      default: return '#FF9800';
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'wealth': return 'Богатство';
      case 'speed': return 'Скорость';
      case 'strategy': return 'Стратегия';
      case 'consistency': return 'Консистентность';
      default: return 'Общий';
    }
  };

  return (
    <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            color: getCategoryColor(category), 
            mr: 1,
            display: 'flex',
            alignItems: 'center'
          }}>
            {getCategoryIcon(category)}
          </Box>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            Топ-3: {getCategoryLabel(category)}
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          {players.map((player, index) => (
            <Grid item xs={12} sm={4} key={player.playerId}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    position: 'relative'
                  }}
                >
                  {/* Медаль */}
                  <Box sx={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)' }}>
                    {index === 0 && (
                      <Chip
                        icon={<TrophyIcon />}
                        label="🥇"
                        sx={{
                          backgroundColor: '#FFD700',
                          color: '#333',
                          fontWeight: 'bold',
                          fontSize: '16px'
                        }}
                      />
                    )}
                    {index === 1 && (
                      <Chip
                        icon={<TrophyIcon />}
                        label="🥈"
                        sx={{
                          backgroundColor: '#C0C0C0',
                          color: '#333',
                          fontWeight: 'bold',
                          fontSize: '16px'
                        }}
                      />
                    )}
                    {index === 2 && (
                      <Chip
                        icon={<TrophyIcon />}
                        label="🥉"
                        sx={{
                          backgroundColor: '#CD7F32',
                          color: '#333',
                          fontWeight: 'bold',
                          fontSize: '16px'
                        }}
                      />
                    )}
                  </Box>
                  
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      mx: 'auto',
                      mb: 1,
                      backgroundColor: player.color || '#9C27B0',
                      fontSize: '24px',
                      fontWeight: 'bold'
                    }}
                  >
                    {player.username?.charAt(0) || 'И'}
                  </Avatar>
                  
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                    {player.username}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                    Рейтинг: {formatNumber(player.categories?.[category]?.score || player.overallScore)}
                  </Typography>
                  
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Игр: {player.gamesPlayed} | Побед: {player.gamesWon}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

// Компонент таблицы рейтингов
const RatingsTable = ({ ratings, category, formatNumber, formatTime, formatWinRate }) => {
  const getCategoryScore = (player) => {
    if (category === 'overall') return player.overallScore;
    return player.categories?.[category]?.score || 0;
  };

  const getCategoryRank = (player) => {
    if (category === 'overall') return player.overallRank;
    return player.categories?.[category]?.rank || 0;
  };

  const sortedRatings = [...ratings].sort((a, b) => getCategoryScore(b) - getCategoryScore(a));

  return (
    <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Место</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Игрок</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Рейтинг</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Игр</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Побед</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>% Побед</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Средний счет</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Капитал</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRatings.map((player, index) => (
            <motion.tr
              key={player.playerId}
              component={TableRow}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              sx={{
                '&:nth-of-type(odd)': { backgroundColor: 'rgba(255,255,255,0.02)' },
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <TableCell sx={{ color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {index < 3 && (
                    <StarIcon sx={{ color: '#FFD700', mr: 1, fontSize: '20px' }} />
                  )}
                  {index + 1}
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      mr: 1,
                      backgroundColor: player.color || '#9C27B0'
                    }}
                  >
                    {player.username?.charAt(0) || 'И'}
                  </Avatar>
                  {player.username}
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                {formatNumber(getCategoryScore(player))}
              </TableCell>
              <TableCell sx={{ color: 'white' }}>
                {player.gamesPlayed}
              </TableCell>
              <TableCell sx={{ color: 'white' }}>
                {player.gamesWon}
              </TableCell>
              <TableCell sx={{ color: 'white' }}>
                <Chip
                  label={formatWinRate(player.gamesPlayed, player.gamesWon)}
                  size="small"
                  sx={{
                    backgroundColor: player.gamesWon / player.gamesPlayed > 0.5 ? '#4CAF50' : '#FF9800',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </TableCell>
              <TableCell sx={{ color: 'white' }}>
                {formatNumber(player.averageScore)}
              </TableCell>
              <TableCell sx={{ color: 'white' }}>
                {formatNumber(player.netWorth)}
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Основной компонент страницы рейтингов
const RatingsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { 
    ratings, 
    stats, 
    loading, 
    error, 
    loadAllRatings, 
    formatNumber, 
    formatTime, 
    formatWinRate 
  } = useRatings();

  const categories = [
    { key: 'overall', label: 'Общий рейтинг', icon: <TrendingUpIcon /> },
    { key: 'wealth', label: 'Богатство', icon: <WealthIcon /> },
    { key: 'speed', label: 'Скорость', icon: <SpeedIcon /> },
    { key: 'strategy', label: 'Стратегия', icon: <StrategyIcon /> },
    { key: 'consistency', label: 'Консистентность', icon: <ConsistencyIcon /> }
  ];

  useEffect(() => {
    loadAllRatings(20);
  }, [loadAllRatings]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading && !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <IconButton onClick={() => loadAllRatings(20)}>
          <RefreshIcon />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#1a1a2e', color: 'white', p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
          🏆 Рейтинг игроков
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Соревнуйтесь с лучшими игроками CASHFLOW
        </Typography>
      </Box>

      {/* Статистика */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', border: '1px solid #4CAF50' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  {stats.totalPlayers}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Всего игроков
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)', border: '1px solid #2196F3' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
                  {stats.totalGames}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Всего игр
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', border: '1px solid #FFC107' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#FFC107', fontWeight: 'bold' }}>
                  {stats.averageScore}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Средний счет
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: 'rgba(156, 39, 176, 0.1)', border: '1px solid #9C27B0' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#9C27B0', fontWeight: 'bold' }}>
                  {stats.topWealth}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Лучший по богатству
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Топ-3 игроки */}
      <Top3Players
        players={ratings.overall.slice(0, 3)}
        category="overall"
        formatNumber={formatNumber}
        formatTime={formatTime}
        formatWinRate={formatWinRate}
      />

      {/* Табы категорий */}
      <Paper sx={{ backgroundColor: 'rgba(255,255,255,0.05)', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              color: 'rgba(255,255,255,0.7)',
              '&.Mui-selected': {
                color: 'white'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#FFD700'
            }
          }}
        >
          {categories.map((category, index) => (
            <Tab
              key={category.key}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {category.icon}
                  <Typography sx={{ ml: 1 }}>{category.label}</Typography>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Таблица рейтингов */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {categories[activeTab].label}
          </Typography>
          <IconButton onClick={() => loadAllRatings(20)} sx={{ color: 'white' }}>
            <RefreshIcon />
          </IconButton>
        </Box>
        
        <RatingsTable
          ratings={ratings[categories[activeTab].key] || []}
          category={categories[activeTab].key}
          formatNumber={formatNumber}
          formatTime={formatTime}
          formatWinRate={formatWinRate}
        />
      </Box>
    </Box>
  );
};

export default RatingsPage;
