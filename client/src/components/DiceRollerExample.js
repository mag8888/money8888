import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Grid } from '@mui/material';
import DiceRoller from './DiceRoller';

// Пример использования модуля DiceRoller
const DiceRollerExample = () => {
  const [exampleType, setExampleType] = useState('basic');

  // Функция для демонстрации броска кубика
  const handleDemoRoll = async () => {
    // Имитируем задержку сервера
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Возвращаем случайный результат 1-6
    return Math.floor(Math.random() * 6) + 1;
  };

  // Функция для автоматического броска
  const handleAutoRoll = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return Math.floor(Math.random() * 6) + 1;
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1000px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom align="center" color="primary">
        🎲 Примеры использования модуля DiceRoller
      </Typography>

      <Typography variant="body1" align="center" sx={{ mb: 4, color: 'text.secondary' }}>
        Теперь с реальными изображениями кубиков K1-K6.gif и K1-61.tiff - K6-61.tiff
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Button 
          variant={exampleType === 'basic' ? 'contained' : 'outlined'} 
          onClick={() => setExampleType('basic')}
          sx={{ mr: 2 }}
        >
          Базовый пример
        </Button>
        <Button 
          variant={exampleType === 'auto' ? 'contained' : 'outlined'} 
          onClick={() => setExampleType('auto')}
          sx={{ mr: 2 }}
        >
          Автоматический бросок
        </Button>
        <Button 
          variant={exampleType === 'custom' ? 'contained' : 'outlined'} 
          onClick={() => setExampleType('custom')}
          sx={{ mr: 2 }}
        >
          Кастомный размер
        </Button>
        <Button 
          variant={exampleType === 'images' ? 'contained' : 'outlined'} 
          onClick={() => setExampleType('images')}
        >
          Все изображения
        </Button>
      </Box>

      {exampleType === 'basic' && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Базовый пример
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Стандартный бросок кубика с анимацией GIF и отображением результата TIFF
          </Typography>
          <DiceRoller
            onRoll={handleDemoRoll}
            buttonText="🎲 Бросить кубик"
            size={80}
            showResult={true}
          />
        </Paper>
      )}

      {exampleType === 'auto' && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Автоматический бросок
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Кубик автоматически бросается при загрузке компонента
          </Typography>
          <DiceRoller
            onRoll={handleAutoRoll}
            buttonText="🎲 Бросить кубик"
            size={80}
            showResult={true}
            autoRoll={true}
          />
        </Paper>
      )}

      {exampleType === 'custom' && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Кастомный размер
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Кубик увеличенного размера без отображения результата
          </Typography>
          <DiceRoller
            onRoll={handleDemoRoll}
            buttonText="🎲 Большой кубик"
            size={120}
            showResult={false}
          />
        </Paper>
      )}

      {exampleType === 'images' && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom align="center">
            Все изображения кубиков
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Демонстрация всех доступных изображений кубиков
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom align="center">
                🎬 GIF анимации (для броска)
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <Box key={`gif-${num}`} sx={{ textAlign: 'center' }}>
                    <img 
                      src={`/images/K${num}.gif`} 
                      alt={`K${num}.gif`}
                      width={60} 
                      height={60}
                      style={{ borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <Typography variant="caption" display="block">
                      K{num}.gif
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom align="center">
                🖼️ TIFF изображения (для результата)
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <Box key={`tiff-${num}`} sx={{ textAlign: 'center' }}>
                    <img 
                      src={`/images/K${num}-61.tiff`} 
                      alt={`K${num}-61.tiff`}
                      width={60} 
                      height={60}
                      style={{ borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <Typography variant="caption" display="block">
                      K{num}-61.tiff
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          📚 Документация модуля
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Props:</strong>
        </Typography>
        <ul>
          <li><strong>onRoll</strong> - функция, возвращающая Promise с результатом броска</li>
          <li><strong>disabled</strong> - блокировка кнопки броска</li>
          <li><strong>buttonText</strong> - текст на кнопке</li>
          <li><strong>size</strong> - размер кубика в пикселях</li>
          <li><strong>showResult</strong> - показывать ли результат броска</li>
          <li><strong>autoRoll</strong> - автоматический бросок при монтировании</li>
        </ul>
        
        <Typography variant="body2" paragraph>
          <strong>Логика работы с изображениями:</strong>
        </Typography>
        <ol>
          <li>Генерируем на сервере число 1-6</li>
          <li>От полученного числа запускаем GIF анимацию K1.gif - K6.gif</li>
          <li>По завершении анимации меняем на TIFF картинку K1-61.tiff - K6-61.tiff</li>
        </ol>

        <Typography variant="body2" paragraph>
          <strong>Используемые изображения:</strong>
        </Typography>
        <ul>
          <li><strong>Анимация:</strong> K1.gif, K2.gif, K3.gif, K4.gif, K5.gif, K6.gif</li>
          <li><strong>Результат:</strong> K1-61.tiff, K2-61.tiff, K3-61.tiff, K4-61.tiff, K5-61.tiff, K6-61.tiff</li>
        </ul>
      </Box>
    </Box>
  );
};

export default DiceRollerExample;
