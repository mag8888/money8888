// 🎨 Карта стилей ПОТОК ДЕНЕГ Game
// Централизованная система дизайна

export const colors = {
  // Основная палитра
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrast: '#ffffff'
  },
  
  // Вторичная палитра
  secondary: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
    contrast: '#ffffff'
  },
  
  // Акцентные цвета
  accent: {
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3'
  },
  
  // Нейтральные цвета
  neutral: {
    white: '#ffffff',
    lightGray: '#f5f5f5',
    gray: '#e0e0e0',
    darkGray: '#757575',
    black: '#212121'
  },
  
  // Фоновые цвета
  background: {
    primary: '#f8f9fa',
    secondary: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.5)',
    gradient: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
  },
  
  // Границы
  border: {
    light: '#e0e0e0',
    medium: '#bdbdbd',
    dark: '#9e9e9e',
    primary: '#1976d2',
    secondary: '#ff9800'
  },
  
  // Текст
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#9e9e9e',
    inverse: '#ffffff'
  }
};

export const typography = {
  // Заголовки
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em'
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em'
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.3
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 500,
    lineHeight: 1.4
  },
  h6: {
    fontSize: '1.125rem',
    fontWeight: 500,
    lineHeight: 1.4
  },
  
  // Текст
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.43
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.33
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.75,
    textTransform: 'uppercase'
  }
};

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  xxl: '3rem',      // 48px
  xxxl: '4rem'      // 64px
};

export const shadows = {
  sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  md: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
  lg: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  xl: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
  primary: '0 4px 12px rgba(25, 118, 210, 0.3)',
  secondary: '0 4px 12px rgba(255, 152, 0, 0.3)'
};

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  round: '50%'
};

export const transitions = {
  fast: 'all 0.15s ease-in-out',
  normal: 'all 0.25s ease-in-out',
  slow: 'all 0.35s ease-in-out',
  bounce: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
};

// Стили для компонентов
export const componentStyles = {
  // Карточки
  card: {
    background: colors.background.secondary,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.md,
    padding: spacing.lg,
    border: `1px solid ${colors.border.light}`,
    transition: transitions.normal,
    '&:hover': {
      boxShadow: shadows.lg,
      transform: 'translateY(-2px)'
    }
  },
  
  // Кнопки
  button: {
    primary: {
      background: colors.primary.main,
      color: colors.primary.contrast,
      border: `2px solid ${colors.primary.main}`,
      borderRadius: borderRadius.md,
      padding: `${spacing.sm} ${spacing.lg}`,
      fontWeight: 600,
      transition: transitions.normal,
      '&:hover': {
        background: colors.primary.dark,
        borderColor: colors.primary.dark,
        transform: 'translateY(-1px)',
        boxShadow: shadows.primary
      },
      '&:disabled': {
        background: colors.neutral.gray,
        borderColor: colors.neutral.gray,
        color: colors.text.disabled
      }
    },
    
    secondary: {
      background: 'transparent',
      color: colors.secondary.main,
      border: `2px solid ${colors.secondary.main}`,
      borderRadius: borderRadius.md,
      padding: `${spacing.sm} ${spacing.lg}`,
      fontWeight: 600,
      transition: transitions.normal,
      '&:hover': {
        background: colors.secondary.light,
        color: colors.secondary.contrast,
        borderColor: colors.secondary.light
      }
    },
    
    outline: {
      background: 'transparent',
      color: colors.primary.main,
      border: `2px solid ${colors.primary.main}`,
      borderRadius: borderRadius.md,
      padding: `${spacing.sm} ${spacing.lg}`,
      fontWeight: 500,
      transition: transitions.normal,
      '&:hover': {
        background: colors.primary.light,
        color: colors.primary.contrast
      }
    }
  },
  
  // Поля ввода
  input: {
    field: {
      '& .MuiOutlinedInput-root': {
        borderColor: colors.border.medium,
        transition: transitions.normal,
        '&:hover': {
          borderColor: colors.primary.main
        },
        '&.Mui-focused': {
          borderColor: colors.primary.main,
          boxShadow: shadows.primary
        }
      },
      '& .MuiInputLabel-root': {
        color: colors.text.secondary,
        '&.Mui-focused': {
          color: colors.primary.main
        }
      },
      '& .MuiInputBase-input': {
        color: colors.text.primary
      }
    }
  },
  
  // Модальные окна
  modal: {
    background: colors.background.secondary,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.xl,
    border: `1px solid ${colors.border.light}`,
    padding: spacing.xl
  },
  
  // Алерты
  alert: {
    success: {
      background: colors.accent.success,
      color: colors.neutral.white,
      border: `1px solid ${colors.accent.success}`
    },
    warning: {
      background: colors.accent.warning,
      color: colors.neutral.white,
      border: `1px solid ${colors.accent.warning}`
    },
    error: {
      background: colors.accent.error,
      color: colors.neutral.white,
      border: `1px solid ${colors.accent.error}`
    },
    info: {
      background: colors.accent.info,
      color: colors.neutral.white,
      border: `1px solid ${colors.accent.info}`
    }
  }
};

// Утилиты для создания стилей
export const createStyles = (baseStyles, customStyles = {}) => ({
  ...baseStyles,
  ...customStyles
});

// Хуки для использования стилей
export const useTheme = () => {
  return {
    colors,
    typography,
    spacing,
    shadows,
    borderRadius,
    transitions,
    componentStyles,
    createStyles
  };
};

export default {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  transitions,
  componentStyles,
  useTheme,
  createStyles
};
