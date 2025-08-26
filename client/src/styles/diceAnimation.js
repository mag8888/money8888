// Анимация кубиков для игры
export const diceAnimationStyles = {
  // Контейнер для анимации кубика
  diceContainer: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
    border: '3px solid #FFD700',
    minWidth: '300px',
    minHeight: '300px'
  },

  // Анимация появления кубика
  diceAppear: {
    animation: 'diceAppear 0.5s ease-out forwards',
    '@keyframes diceAppear': {
      '0%': {
        opacity: 0,
        transform: 'translate(-50%, -50%) scale(0.3) rotate(180deg)',
      },
      '50%': {
        opacity: 0.7,
        transform: 'translate(-50%, -50%) scale(1.1) rotate(90deg)',
      },
      '100%': {
        opacity: 1,
        transform: 'translate(-50%, -50%) scale(1) rotate(0deg)',
      }
    }
  },

  // Анимация броска кубика
  diceRoll: {
    animation: 'diceRoll 1.5s ease-in-out forwards',
    '@keyframes diceRoll': {
      '0%': {
        transform: 'translate(-50%, -50%) rotate(0deg) scale(1)',
      },
      '25%': {
        transform: 'translate(-50%, -50%) rotate(90deg) scale(1.2)',
      },
      '50%': {
        transform: 'translate(-50%, -50%) rotate(180deg) scale(0.8)',
      },
      '75%': {
        transform: 'translate(-50%, -50%) rotate(270deg) scale(1.1)',
      },
      '100%': {
        transform: 'translate(-50%, -50%) rotate(360deg) scale(1)',
      }
    }
  },

  // Анимация исчезновения кубика
  diceDisappear: {
    animation: 'diceDisappear 0.5s ease-in forwards',
    '@keyframes diceDisappear': {
      '0%': {
        opacity: 1,
        transform: 'translate(-50%, -50%) scale(1) rotate(0deg)',
      },
      '100%': {
        opacity: 0,
        transform: 'translate(-50%, -50%) scale(0.3) rotate(-180deg)',
      }
    }
  },

  // Стили для изображения кубика
  diceImage: {
    width: '200px',
    height: '200px',
    objectFit: 'contain',
    filter: 'drop-shadow(0 10px 20px rgba(255, 215, 0, 0.6))',
    transition: 'all 0.3s ease'
  },

  // Текст результата
  resultText: {
    color: '#FFD700',
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: '20px',
    textShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
    animation: 'resultGlow 2s ease-in-out infinite alternate',
    '@keyframes resultGlow': {
      '0%': {
        textShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
        transform: 'scale(1)',
      },
      '100%': {
        textShadow: '0 0 30px rgba(255, 215, 0, 1), 0 0 40px rgba(255, 215, 0, 0.6)',
        transform: 'scale(1.05)',
      }
    }
  },

  // Кнопка закрытия
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: 'transparent',
    color: '#FFD700',
    border: '2px solid #FFD700',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    minWidth: '40px',
    fontSize: '1.2rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#FFD700',
      color: '#000',
      transform: 'scale(1.1)',
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.8)'
    }
  }
};

// Функция для получения пути к изображению кубика
export const getDiceImage = (diceValue) => {
  return `/images/dice/K${diceValue}.png`;
};

// Функция для генерации случайного числа от 1 до 6
export const rollDice = () => {
  return Math.floor(Math.random() * 6) + 1;
};
