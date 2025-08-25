// 🎨 ГОТОВЫЕ СТИЛИ ДЛЯ КОМПОНЕНТОВ ПОТОК ДЕНЕГ
// Используйте эти стили для консистентности дизайна

import { colors, textColors, borderColors } from './colors.js';

// Реэкспортируем цвета для удобства использования
export { colors, textColors, borderColors };

// 🎯 СТИЛИ ДЛЯ КНОПОК
export const buttonStyles = {
  // Основная кнопка
  primary: {
    bgcolor: colors.primary.main,
    color: colors.primary.contrast,
    border: `2px solid ${colors.primary.main}`,
    borderRadius: 2,
    py: 1.5,
    px: 2,
    fontWeight: 600,
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    '&:hover': {
      bgcolor: colors.primary.dark,
      transform: 'translateY(-2px)',
      boxShadow: 4
    },
    '&:disabled': {
      bgcolor: colors.gray[400],
      borderColor: colors.gray[500],
      color: colors.gray[600]
    }
  },

  // Вторичная кнопка
  secondary: {
    bgcolor: colors.secondary.main,
    color: colors.secondary.contrast,
    border: `2px solid ${colors.secondary.main}`,
    borderRadius: 2,
    py: 1.5,
    px: 2,
    fontWeight: 600,
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    '&:hover': {
      bgcolor: colors.secondary.dark,
      transform: 'translateY(-2px)',
      boxShadow: 4
    }
  },

  // Кнопка успеха
  success: {
    bgcolor: colors.success.main,
    color: colors.success.contrast,
    border: `2px solid ${colors.success.main}`,
    borderRadius: 2,
    py: 1.5,
    px: 2,
    fontWeight: 600,
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    '&:hover': {
      bgcolor: colors.success.dark,
      transform: 'translateY(-2px)',
      boxShadow: 4
    }
  },

  // Кнопка ошибки
  error: {
    bgcolor: colors.error.main,
    color: colors.error.contrast,
    border: `2px solid ${colors.error.main}`,
    borderRadius: 2,
    py: 1.5,
    px: 2,
    fontWeight: 600,
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    '&:hover': {
      bgcolor: colors.error.dark,
      transform: 'translateY(-2px)',
      boxShadow: 4
    }
  },

  // Контурная кнопка
  outlined: {
    bgcolor: 'transparent',
    color: colors.primary.main,
    border: `2px solid ${colors.primary.main}`,
    borderRadius: 2,
    py: 1.5,
    px: 2,
    fontWeight: 600,
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    '&:hover': {
      bgcolor: colors.primary.light,
      color: colors.primary.contrast,
      transform: 'translateY(-2px)',
      boxShadow: 4
    }
  }
};

// 🎯 СТИЛИ ДЛЯ ПОЛЕЙ ВВОДА
export const inputStyles = {
  // Основное поле ввода
  primary: {
    '& .MuiOutlinedInput-root': {
      border: `2px solid ${colors.primary.main}`,
      borderRadius: 2,
      backgroundColor: colors.white.main,
      '&:hover': {
        borderColor: colors.primary.dark,
        boxShadow: `0 4px 12px ${colors.primary.light}40`
      },
      '&.Mui-focused': {
        borderColor: colors.primary.dark,
        boxShadow: `0 0 0 3px ${colors.primary.light}30`
      }
    },
    '& .MuiInputLabel-root': {
      color: colors.gray[600],
      fontWeight: 500,
      '&.Mui-focused': {
        color: colors.primary.main
      }
    },
    '& .MuiInputBase-input': {
      color: textColors.primary,
      fontSize: '1rem',
      fontWeight: 500
    },
    '& .MuiInputBase-input::placeholder': {
      color: colors.gray[600],
      opacity: 1,
      fontWeight: 400
    }
  },

  // Поле с ошибкой
  error: {
    '& .MuiOutlinedInput-root': {
      border: `2px solid ${colors.error.main}`,
      borderRadius: 2,
      backgroundColor: colors.white.main,
      '&:hover': {
        borderColor: colors.error.dark,
        boxShadow: `0 4px 12px ${colors.error.light}40`
      },
      '&.Mui-focused': {
        borderColor: colors.error.dark,
        boxShadow: `0 0 0 3px ${colors.error.light}30`
      }
    },
    '& .MuiInputLabel-root': {
      color: colors.error.main,
      fontWeight: 500
    },
    '& .MuiInputBase-input': {
      color: textColors.primary,
      fontSize: '1rem',
      fontWeight: 500
    }
  }
};

// 🎯 СТИЛИ ДЛЯ КАРТОЧЕК
export const cardStyles = {
  // Основная карточка
  primary: {
    bgcolor: colors.white.main,
    border: `2px solid ${colors.primary.main}`,
    borderRadius: 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    p: 2,
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      transform: 'translateY(-2px)'
    }
  },

  // Карточка игрока
  player: {
    bgcolor: colors.cards.player,
    border: `2px solid ${colors.cards.player}`,
    borderRadius: 2,
    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
    p: 2,
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 4px 16px rgba(76, 175, 80, 0.4)',
      transform: 'translateY(-2px)'
    }
  },

  // Карточка готовности
  ready: {
    bgcolor: colors.cards.ready,
    border: `2px solid ${colors.cards.ready}`,
    borderRadius: 2,
    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
    p: 2,
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 4px 16px rgba(76, 175, 80, 0.4)',
      transform: 'translateY(-2px)'
    }
  }
};

// 🎯 СТИЛИ ДЛЯ ТИПОГРАФИИ
export const typographyStyles = {
  // Заголовок страницы
  pageTitle: {
    color: colors.white.main,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
    mb: 4,
    // Дополнительные стили для лучшей видимости
    fontSize: '2.5rem',
    letterSpacing: '0.5px',
    // Альтернативный цвет для лучшей видимости
    '&.dark': {
      color: colors.white.main
    },
    '&.light': {
      color: colors.primary.dark
    }
  },

  // Заголовок секции
  sectionTitle: {
    color: colors.primary.dark,
    fontWeight: 'bold',
    mb: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    justifyContent: 'center',
    // Дополнительные стили для лучшей видимости
    fontSize: '1.3rem',
    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },

  // Основной текст
  bodyText: {
    color: textColors.primary,
    fontSize: '1rem',
    fontWeight: 400
  },

  // Вторичный текст
  secondaryText: {
    color: textColors.secondary,
    fontSize: '0.9rem',
    fontWeight: 400
  }
};

// 🎯 СТИЛИ ДЛЯ КОНТЕЙНЕРОВ
export const containerStyles = {
  // Основной контейнер страницы
  pageContainer: {
    minHeight: '100vh',
    background: colors.roomSelection.background,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    p: 4,
    pt: 6
  },

  // Контейнер формы
  formContainer: {
    width: '100%',
    maxWidth: 500,
    background: colors.white.main,
    borderRadius: 3,
    mb: 4,
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    p: 3
  },

  // Контейнер секции
  sectionContainer: {
    mb: 3,
    p: 2,
    bgcolor: colors.primary.light,
    borderRadius: 2,
    border: `1px solid ${colors.primary.main}`,
    boxShadow: 1
  }
};

// 🎯 СТИЛИ ДЛЯ АНИМАЦИЙ
export const animationStyles = {
  // Появление элемента
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },

  // Появление с масштабированием
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, type: "spring" }
  },

  // Появление с поворотом
  rotateIn: {
    initial: { opacity: 0, rotate: -180 },
    animate: { opacity: 1, rotate: 0 },
    transition: { duration: 0.6, type: "spring" }
  }
};

// 🎯 СТИЛИ ДЛЯ СОСТОЯНИЙ
export const stateStyles = {
  // Загрузка
  loading: {
    opacity: 0.7,
    pointerEvents: 'none'
  },

  // Отключено
  disabled: {
    opacity: 0.5,
    pointerEvents: 'none',
    bgcolor: colors.gray[300]
  },

  // Активно
  active: {
    bgcolor: colors.primary.main,
    color: colors.primary.contrast,
    boxShadow: 4
  }
};

// 🎯 ГОТОВЫЕ КОМБИНАЦИИ СТИЛЕЙ
export const styleCombinations = {
  // Кнопка "Готов"
  readyButton: {
    ...buttonStyles.success,
    fullWidth: true,
    mb: 2
  },

  // Кнопка "Старт"
  startButton: {
    ...buttonStyles.primary,
    bgcolor: colors.game.start,
    borderColor: colors.game.start,
    fullWidth: true,
    mb: 2,
    py: 2,
    fontSize: '1.2rem'
  },

  // Поле ввода комнаты
  roomInput: {
    ...inputStyles.primary,
    fullWidth: true,
    mb: 2
  },

  // Карточка игрока
  playerCard: {
    ...cardStyles.player,
    cursor: 'pointer',
    mb: 1
  },

  // Заголовок страницы
  pageHeader: {
    ...typographyStyles.pageTitle,
    variant: 'h4'
  }
};

// 🎨 ЭКСПОРТ ПО УМОЛЧАНИЮ
export default {
  colors,
  textColors,
  borderColors,
  buttonStyles,
  inputStyles,
  cardStyles,
  typographyStyles,
  containerStyles,
  animationStyles,
  stateStyles,
  styleCombinations
};
