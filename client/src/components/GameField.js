import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import CasinoIcon from '@mui/icons-material/Casino';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EuroIcon from '@mui/icons-material/Euro';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BalanceIcon from '@mui/icons-material/Balance';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import StoreIcon from '@mui/icons-material/Store';
import BusinessIcon from '@mui/icons-material/Business';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import GavelIcon from '@mui/icons-material/Gavel';
import BuildIcon from '@mui/icons-material/Build';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import SchoolIcon from '@mui/icons-material/School';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';

// Конфигурация клеток игрового поля
const CELL_CONFIG = {
  // Внешний круг (0-23)
  outer: [
    { type: 'deal', icon: <HomeIcon />, color: '#4CAF50' },
    { type: 'expense', icon: <ShoppingCartIcon />, color: '#FF9800' },
    { type: 'market', icon: <TrendingUpIcon />, color: '#2196F3' },
    { type: 'deal', icon: <StoreIcon />, color: '#4CAF50' },
    { type: 'expense', icon: <ChildCareIcon />, color: '#FF9800' },
    { type: 'market', icon: <TrendingUpIcon />, color: '#2196F3' },
    { type: 'deal', icon: <BusinessIcon />, color: '#4CAF50' },
    { type: 'expense', icon: <ShoppingCartIcon />, color: '#FF9800' },
    { type: 'market', icon: <TrendingUpIcon />, color: '#2196F3' },
    { type: 'deal', icon: <HomeIcon />, color: '#4CAF50' },
    { type: 'expense', icon: <ShoppingCartIcon />, color: '#FF9800' },
    { type: 'market', icon: <TrendingUpIcon />, color: '#2196F3' },
    { type: 'deal', icon: <StoreIcon />, color: '#4CAF50' },
    { type: 'expense', icon: <ChildCareIcon />, color: '#FF9800' },
    { type: 'market', icon: <TrendingUpIcon />, color: '#2196F3' },
    { type: 'deal', icon: <BusinessIcon />, color: '#4CAF50' },
    { type: 'expense', icon: <ShoppingCartIcon />, color: '#FF9800' },
    { type: 'market', icon: <TrendingUpIcon />, color: '#2196F3' },
    { type: 'deal', icon: <HomeIcon />, color: '#4CAF50' },
    { type: 'expense', icon: <ShoppingCartIcon />, color: '#FF9800' },
    { type: 'market', icon: <TrendingUpIcon />, color: '#2196F3' },
    { type: 'deal', icon: <StoreIcon />, color: '#4CAF50' },
    { type: 'expense', icon: <ChildCareIcon />, color: '#FF9800' },
    { type: 'market', icon: <TrendingUpIcon />, color: '#2196F3' },
    { type: 'deal', icon: <BusinessIcon />, color: '#4CAF50' }
  ],
  // Внутренний круг (24-47)
  inner: [
    { type: 'deal', icon: <HomeIcon />, color: '#4CAF50' },
    { type: 'expense', icon: <ShoppingCartIcon />, color: '#FF9800' },
    { type: 'market', icon: <TrendingUpIcon />, color: '#2196F3' },
    { type: 'deal', icon: <StoreIcon />, color: '#4CAF50' },
    { type: 'expense', icon: <ChildCareIcon />, color: '#FF9800' },
    { type: 'market', icon: <TrendingUpIcon />, color: '#2196F3' },
    { type: 'deal', icon: <BusinessIcon />, color: '#4CAF50' },
    { type: 'expense', icon: <ShoppingCartIcon />, color: '#FF9800' },
    { type: 'market', icon: <TrendingUpIcon />, color: '#2196F3' },
    { type: 'deal', icon: <HomeIcon />, color: '#4CAF50' },
    { type: 'expense', icon: <ShoppingCartIcon />, color: '#FF9800' },
    { type: 'market', icon: <TrendingUpIcon />, color: '#2196F3' },
    { type: 'deal', icon: <StoreIcon />, color: '#4CAF50' },
    { type: 'expense', icon: <ChildCareIcon />, color: '#FF9800' },
    { type: 'market', icon: <TrendingUpIcon />, color: '#2196F3' },
    { type: 'deal', icon: <BusinessIcon />, color: '#4CAF50' },
    { type: 'expense', icon: <ShoppingCartIcon />, color: '#FF9800' },
    { type: 'market', icon: <TrendingUpIcon />, color: '#2196F3' },
    { type: 'deal', icon: <HomeIcon />, color: '#4CAF50' },
    { type: 'expense', icon: <ShoppingCartIcon />, color: '#FF9800' },
    { type: 'market', icon: <TrendingUpIcon />, color: '#2196F3' },
    { type: 'deal', icon: <StoreIcon />, color: '#4CAF50' },
    { type: 'expense', icon: <ChildCareIcon />, color: '#FF9800' },
    { type: 'market', icon: <TrendingUpIcon />, color: '#2196F3' },
    { type: 'deal', icon: <BusinessIcon />, color: '#4CAF50' }
  ]
};

// Компонент клетки
const GameCell = React.memo(({ 
  position, 
  type, 
  icon, 
  color, 
  isPlayerHere, 
  playerColor, 
  playerInitial,
  onClick 
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick?.(position, type)}
      style={{
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        border: '2px solid #fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        zIndex: isPlayerHere ? 10 : 1
      }}
    >
      {isPlayerHere ? (
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: playerColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          {playerInitial}
        </Box>
      ) : (
        <Box sx={{ color: 'white', fontSize: '20px' }}>
          {icon}
        </Box>
      )}
      
      {/* Номер позиции */}
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          top: -8,
          right: -8,
          backgroundColor: '#333',
          color: 'white',
          borderRadius: '50%',
          width: 16,
          height: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 'bold'
        }}
      >
        {position}
      </Typography>
    </motion.div>
  );
});

// Основной компонент игрового поля
const GameField = React.memo(({ 
  players, 
  currentTurn, 
  onCellClick,
  onRollDice,
  isMyTurn,
  diceValue,
  isRolling 
}) => {
  // Вычисляем позиции игроков
  const playerPositions = useMemo(() => {
    const positions = {};
    players.forEach(player => {
      if (player.position !== undefined) {
        positions[player.position] = {
          color: player.color || '#9C27B0',
          initial: player.username?.charAt(0) || 'И',
          id: player.id
        };
      }
    });
    return positions;
  }, [players]);

  // Вычисляем позиции клеток
  const cellPositions = useMemo(() => {
    const positions = [];
    
    // Внешний круг (0-23)
    for (let i = 0; i < 24; i++) {
      const angle = (i * 15) * (Math.PI / 180); // 15 градусов между клетками
      const radius = 120;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      positions.push({
        position: i,
        x: x + 200, // Центр поля
        y: y + 200,
        ...CELL_CONFIG.outer[i]
      });
    }
    
    // Внутренний круг (24-47)
    for (let i = 0; i < 24; i++) {
      const angle = (i * 15) * (Math.PI / 180);
      const radius = 80;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      positions.push({
        position: i + 24,
        x: x + 200,
        y: y + 200,
        ...CELL_CONFIG.inner[i]
      });
    }
    
    return positions;
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        width: 400,
        height: 400,
        backgroundColor: '#2F1B40',
        borderRadius: '50%',
        border: '4px solid #6E4D92',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible'
      }}
    >
      {/* Центральная область */}
      <Box
        sx={{
          position: 'absolute',
          width: 100,
          height: 100,
          backgroundColor: '#6E4D92',
          borderRadius: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          zIndex: 20
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          CASHFLOW
        </Typography>
        
        {/* Кнопка броска кубиков */}
        {isMyTurn && (
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onRollDice}
            style={{ cursor: 'pointer' }}
          >
            <CasinoIcon sx={{ fontSize: 32, color: '#FFD700' }} />
          </motion.div>
        )}
        
        {/* Значение кубиков */}
        {diceValue > 0 && (
          <Typography variant="h4" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
            {diceValue}
          </Typography>
        )}
      </Box>

      {/* Клетки игрового поля */}
      {cellPositions.map(({ position, x, y, type, icon, color }) => (
        <GameCell
          key={position}
          position={position}
          type={type}
          icon={icon}
          color={color}
          isPlayerHere={!!playerPositions[position]}
          playerColor={playerPositions[position]?.color}
          playerInitial={playerPositions[position]?.initial}
          onClick={onCellClick}
          style={{
            left: x,
            top: y
          }}
        />
      ))}

      {/* Соединительные линии между кругами */}
      <svg
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          zIndex: 1
        }}
      >
        {/* Линии между внешним и внутренним кругом */}
        {[0, 6, 12, 18].map((startPos) => {
          const startCell = cellPositions[startPos];
          const endCell = cellPositions[startPos + 24];
          
          if (startCell && endCell) {
            return (
              <line
                key={`line-${startPos}`}
                x1={startCell.x + 20}
                y1={startCell.y + 20}
                x2={endCell.x + 20}
                y2={endCell.y + 20}
                stroke="#6E4D92"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            );
          }
          return null;
        })}
      </svg>
    </Box>
  );
});

GameField.displayName = 'GameField';
GameCell.displayName = 'GameCell';

export default GameField;
