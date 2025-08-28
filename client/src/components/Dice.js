import React from 'react';
import { Box } from '@mui/material';

const Dice = ({ value, size = 60, color = '#FFD54F', dotColor = '#2E1B40' }) => {
  const positions = {
    1: [[0.5, 0.5]],
    2: [[0.25, 0.25], [0.75, 0.75]],
    3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
    4: [[0.25, 0.25], [0.25, 0.75], [0.75, 0.25], [0.75, 0.75]],
    5: [[0.25, 0.25], [0.25, 0.75], [0.5, 0.5], [0.75, 0.25], [0.75, 0.75]],
    6: [[0.25, 0.25], [0.25, 0.5], [0.25, 0.75], [0.75, 0.25], [0.75, 0.5], [0.75, 0.75]]
  };

  return (
    <Box sx={{
      width: size,
      height: size,
      background: color,
      borderRadius: '10%',
      position: 'relative',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
    }}>
      {positions[value]?.map(([x, y], i) => (
        <Box key={i} sx={{
          position: 'absolute',
          width: size * 0.18,
          height: size * 0.18,
          background: dotColor,
          borderRadius: '50%',
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          transform: 'translate(-50%, -50%)'
        }} />
      ))}
    </Box>
  );
};

export default Dice;
