// 🎨 Современная дизайн-система Cashflow
export const CASHFLOW_THEME = {
  // 🌈 Основная цветовая палитра
  colors: {
    // Основные цвета
    primary: {
      main: '#6366F1', // Индиго
      light: '#818CF8',
      dark: '#4F46E5',
      contrast: '#FFFFFF'
    },
    secondary: {
      main: '#EC4899', // Розовый
      light: '#F472B6',
      dark: '#DB2777',
      contrast: '#FFFFFF'
    },
    success: {
      main: '#10B981', // Изумрудный
      light: '#34D399',
      dark: '#059669',
      contrast: '#FFFFFF'
    },
    warning: {
      main: '#F59E0B', // Янтарный
      light: '#FBBF24',
      dark: '#D97706',
      contrast: '#FFFFFF'
    },
    error: {
      main: '#EF4444', // Красный
      light: '#F87171',
      dark: '#DC2626',
      contrast: '#FFFFFF'
    },
    
    // Игровое поле
    board: {
      background: '#0F172A', // Сланцевый темный
      surface: '#1E293B', // Сланцевый
      border: '#334155', // Сланцевый светлый
      shadow: 'rgba(0, 0, 0, 0.25)'
    },
    
    // Клетки
    cells: {
      innerCircle: {
        background: '#7C3AED', // Фиолетовый
        border: '#A855F7',
        text: '#FFFFFF',
        shadow: '0 4px 20px rgba(124, 58, 237, 0.4)'
      },
      outerSquare: {
        background: '#06B6D4', // Циан
        border: '#22D3EE',
        text: '#FFFFFF',
        shadow: '0 4px 20px rgba(6, 182, 212, 0.4)'
      },
      opportunity: {
        background: '#10B981', // Изумрудный
        border: '#34D399',
        text: '#FFFFFF',
        shadow: '0 4px 20px rgba(16, 185, 129, 0.4)'
      },
      payday: {
        background: '#F59E0B', // Янтарный
        border: '#FBBF24',
        text: '#FFFFFF',
        shadow: '0 4px 20px rgba(245, 158, 11, 0.4)'
      },
      charity: {
        background: '#EC4899', // Розовый
        border: '#F472B6',
        text: '#FFFFFF',
        shadow: '0 4px 20px rgba(236, 72, 153, 0.4)'
      },
      doodad: {
        background: '#8B5CF6', // Фиолетовый
        border: '#A78BFA',
        text: '#FFFFFF',
        shadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
      },
      market: {
        background: '#06B6D4', // Циан
        border: '#22D3EE',
        text: '#FFFFFF',
        shadow: '0 4px 20px rgba(6, 182, 212, 0.4)'
      },
      child: {
        background: '#F97316', // Оранжевый
        border: '#FB923C',
        text: '#FFFFFF',
        shadow: '0 4px 20px rgba(249, 115, 22, 0.4)'
      },
      downsized: {
        background: '#6B7280', // Серый
        border: '#9CA3AF',
        text: '#FFFFFF',
        shadow: '0 4px 20px rgba(107, 114, 128, 0.4)'
      }
    },
    
    // Панель управления
    controlPanel: {
      background: 'rgba(30, 41, 59, 0.95)',
      surface: 'rgba(51, 65, 85, 0.8)',
      border: '#475569',
      shadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      backdrop: 'blur(20px)'
    },
    
    // Фишки игроков
    playerTokens: [
      '#EF4444', // Красный
      '#3B82F6', // Синий
      '#10B981', // Изумрудный
      '#F59E0B', // Янтарный
      '#8B5CF6', // Фиолетовый
      '#EC4899', // Розовый
      '#06B6D4', // Циан
      '#F97316'  // Оранжевый
    ]
  },
  
  // 🎭 Анимации и переходы
  animations: {
    duration: {
      fast: '0.2s',
      normal: '0.3s',
      slow: '0.5s',
      verySlow: '1s'
    },
    easing: {
      easeOut: 'easeOut',
      easeIn: 'easeIn',
      easeInOut: 'easeInOut',
      bounce: 'easeOut'
    }
  },
  
  // 🌟 Эффекты и тени
  effects: {
    shadows: {
      small: '0 2px 8px rgba(0, 0, 0, 0.1)',
      medium: '0 4px 20px rgba(0, 0, 0, 0.15)',
      large: '0 8px 40px rgba(0, 0, 0, 0.2)',
      glow: '0 0 20px rgba(99, 102, 241, 0.5)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
      secondary: 'linear-gradient(135deg, #EC4899 0%, #F59E0B 100%)',
      success: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
      board: 'radial-gradient(circle, #1E293B 0%, #0F172A 100%)'
    }
  },
  
  // 📱 Адаптивность
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px'
  }
};

// 🎨 Стили для компонентов
export const COMPONENT_STYLES = {
  // Игровое поле
  gameBoard: {
    container: {
      background: CASHFLOW_THEME.colors.board.background,
      borderRadius: '24px',
      padding: '32px',
      boxShadow: CASHFLOW_THEME.effects.shadows.large,
      position: 'relative',
      overflow: 'hidden'
    },
    innerCircle: {
      background: 'radial-gradient(circle, #7C3AED 0%, #4C1D95 100%)',
      border: '3px solid #A855F7',
      boxShadow: 'inset 0 0 40px rgba(124, 58, 237, 0.3), 0 0 60px rgba(124, 58, 237, 0.2)',
      backdropFilter: 'blur(10px)'
    },
    outerSquare: {
      background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
      border: '2px solid #22D3EE',
      boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)'
    }
  },
  
  // Клетки
  cells: {
    base: {
      borderRadius: '16px',
      border: '2px solid',
      transition: `all ${CASHFLOW_THEME.animations.duration.normal} ${CASHFLOW_THEME.animations.easing.easeOut}`,
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    },
    hover: {
      transform: 'translateY(-4px) scale(1.05)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
    },
    active: {
      transform: 'translateY(-2px) scale(1.02)'
    }
  },
  
  // Панель управления
  controlPanel: {
    container: {
      background: CASHFLOW_THEME.colors.controlPanel.background,
      backdropFilter: CASHFLOW_THEME.colors.controlPanel.backdrop,
      border: `1px solid ${CASHFLOW_THEME.colors.controlPanel.border}`,
      borderRadius: '20px',
      boxShadow: CASHFLOW_THEME.effects.shadows.large
    },
    section: {
      background: CASHFLOW_THEME.colors.controlPanel.surface,
      borderRadius: '16px',
      border: `1px solid ${CASHFLOW_THEME.colors.controlPanel.border}`,
      padding: '20px',
      marginBottom: '16px'
    }
  },
  
  // Кнопки
  buttons: {
    primary: {
      background: CASHFLOW_THEME.effects.gradients.primary,
      border: 'none',
      borderRadius: '12px',
      padding: '12px 24px',
      color: '#FFFFFF',
      fontWeight: '600',
      transition: `all ${CASHFLOW_THEME.animations.duration.normal} ${CASHFLOW_THEME.animations.easing.easeOut}`,
      cursor: 'pointer',
      boxShadow: CASHFLOW_THEME.effects.shadows.medium
    },
    hover: {
      transform: 'translateY(-2px)',
      boxShadow: CASHFLOW_THEME.effects.shadows.large
    }
  }
};
