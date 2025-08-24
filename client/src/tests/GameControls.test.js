import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GameControls from '../components/GameControls';

// Создаем тему для Material-UI
const theme = createTheme();

// Мок функции для тестирования
const mockOnBankClick = jest.fn();
const mockOnProfessionClick = jest.fn();
const mockOnFinancialFreedomClick = jest.fn();
const mockOnAssetsClick = jest.fn();
const mockOnExitClick = jest.fn();
const mockOnNextPlayer = jest.fn();

// Тестовые данные
const mockPlayers = [
  { id: '1', username: 'Player1', profession: 'Engineer', balance: 5000 },
  { id: '2', username: 'Player2', profession: 'Doctor', balance: 8000 },
  { id: '3', username: 'Player3', profession: 'Teacher', balance: 3000 },
  { id: '4', username: 'Player4', profession: 'Lawyer', balance: 12000 }
];

const mockPlayerProfession = {
  name: 'Engineer',
  salary: 5000,
  savings: 1000,
  expenses: 3000,
  cashFlow: 2000
};

// Обертка для компонента с темой
const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('GameControls Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Очередность игроков', () => {
    test('отображает всех игроков в правильном порядке', () => {
      renderWithTheme(
        <GameControls
          players={mockPlayers}
          currentTurn="1"
          isMyTurn={true}
          turnTimer={120}
          diceValue={0}
          playerProfession={mockPlayerProfession}
          playerBalance={5000}
          onBankClick={mockOnBankClick}
          onProfessionClick={mockOnProfessionClick}
          onFinancialFreedomClick={mockOnFinancialFreedomClick}
          onAssetsClick={mockOnAssetsClick}
          onExitClick={mockOnExitClick}
          onNextPlayer={mockOnNextPlayer}
        />
      );

      // Проверяем что все игроки отображаются
      expect(screen.getByText('Player1')).toBeInTheDocument();
      expect(screen.getByText('Player2')).toBeInTheDocument();
      expect(screen.getByText('Player3')).toBeInTheDocument();
      expect(screen.getByText('Player4')).toBeInTheDocument();

      // Проверяем заголовок
      expect(screen.getByText('🎯 Очередность игроков')).toBeInTheDocument();
    });

    test('подсвечивает текущего игрока', () => {
      renderWithTheme(
        <GameControls
          players={mockPlayers}
          currentTurn="2"
          isMyTurn={false}
          turnTimer={120}
          diceValue={0}
          playerProfession={mockPlayerProfession}
          playerBalance={5000}
          onBankClick={mockOnBankClick}
          onProfessionClick={mockOnProfessionClick}
          onFinancialFreedomClick={mockOnFinancialFreedomClick}
          onAssetsClick={mockOnAssetsClick}
          onExitClick={mockOnExitClick}
          onNextPlayer={mockOnNextPlayer}
        />
      );

      // Проверяем что Player2 (текущий ход) подсвечен
      const player2Element = screen.getByText('Player2').closest('div');
      expect(player2Element).toHaveStyle({
        border: '2px solid #FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.3)'
      });
    });

    test('отображает номера игроков', () => {
      renderWithTheme(
        <GameControls
          players={mockPlayers}
          currentTurn="1"
          isMyTurn={true}
          turnTimer={120}
          diceValue={0}
          playerProfession={mockPlayerProfession}
          playerBalance={5000}
          onBankClick={mockOnBankClick}
          onProfessionClick={mockOnProfessionClick}
          onFinancialFreedomClick={mockOnFinancialFreedomClick}
          onAssetsClick={mockOnAssetsClick}
          onExitClick={mockOnExitClick}
          onNextPlayer={mockOnNextPlayer}
        />
      );

      // Проверяем номера игроков
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  describe('Таймер хода', () => {
    test('отображает время в правильном формате', () => {
      renderWithTheme(
        <GameControls
          players={mockPlayers}
          currentTurn="1"
          isMyTurn={true}
          turnTimer={120}
          diceValue={0}
          playerProfession={mockPlayerProfession}
          playerBalance={5000}
          onBankClick={mockOnBankClick}
          onProfessionClick={mockOnProfessionClick}
          onFinancialFreedomClick={mockOnFinancialFreedomClick}
          onAssetsClick={mockOnAssetsClick}
          onExitClick={mockOnExitClick}
          onNextPlayer={mockOnNextPlayer}
        />
      );

      // Проверяем формат времени (2:00)
      expect(screen.getByText('2:00')).toBeInTheDocument();
    });

    test('меняет цвет таймера в зависимости от времени', () => {
      const { rerender } = renderWithTheme(
        <GameControls
          players={mockPlayers}
          currentTurn="1"
          isMyTurn={true}
          turnTimer={120}
          diceValue={0}
          playerProfession={mockPlayerProfession}
          playerBalance={5000}
          onBankClick={mockOnBankClick}
          onProfessionClick={mockOnProfessionClick}
          onFinancialFreedomClick={mockOnFinancialFreedomClick}
          onAssetsClick={mockOnAssetsClick}
          onExitClick={mockOnExitClick}
          onNextPlayer={mockOnNextPlayer}
        />
      );

      // Зеленый цвет для 2 минут
      let timerElement = screen.getByText('2:00');
      expect(timerElement).toHaveStyle({ color: '#4caf50' });

      // Желтый цвет для 1 минуты
      rerender(
        <ThemeProvider theme={theme}>
          <GameControls
            players={mockPlayers}
            currentTurn="1"
            isMyTurn={true}
            turnTimer={60}
            diceValue={0}
            playerProfession={mockPlayerProfession}
            playerBalance={5000}
            onBankClick={mockOnBankClick}
            onProfessionClick={mockOnProfessionClick}
            onFinancialFreedomClick={mockOnFinancialFreedomClick}
            onAssetsClick={mockOnAssetsClick}
            onExitClick={mockOnExitClick}
            onNextPlayer={mockOnNextPlayer}
          />
        </ThemeProvider>
      );
      
      timerElement = screen.getByText('1:00');
      expect(timerElement).toHaveStyle({ color: '#ffeb3b' });

      // Красный цвет для 30 секунд
      rerender(
        <ThemeProvider theme={theme}>
          <GameControls
            players={mockPlayers}
            currentTurn="1"
            isMyTurn={true}
            turnTimer={30}
            diceValue={0}
            playerProfession={mockPlayerProfession}
            playerBalance={5000}
            onBankClick={mockOnBankClick}
            onProfessionClick={mockOnProfessionClick}
            onFinancialFreedomClick={mockOnFinancialFreedomClick}
            onAssetsClick={mockOnAssetsClick}
            onExitClick={mockOnExitClick}
            onNextPlayer={mockOnNextPlayer}
          />
        </ThemeProvider>
      );
      
      timerElement = screen.getByText('0:30');
      expect(timerElement).toHaveStyle({ color: '#f44336' });

      // Красный цвет для 15 секунд
      rerender(
        <ThemeProvider theme={theme}>
          <GameControls
            players={mockPlayers}
            currentTurn="1"
            isMyTurn={true}
            turnTimer={15}
            diceValue={0}
            playerProfession={mockPlayerProfession}
            playerBalance={5000}
            onBankClick={mockOnBankClick}
            onProfessionClick={mockOnProfessionClick}
            onFinancialFreedomClick={mockOnFinancialFreedomClick}
            onAssetsClick={mockOnAssetsClick}
            onExitClick={mockOnExitClick}
            onNextPlayer={mockOnNextPlayer}
          />
        </ThemeProvider>
      );
      
      timerElement = screen.getByText('0:15');
      expect(timerElement).toHaveStyle({ color: '#f44336' });
    });

    test('отображает прогресс-бар таймера', () => {
      renderWithTheme(
        <GameControls
          players={mockPlayers}
          currentTurn="1"
          isMyTurn={true}
          turnTimer={60}
          diceValue={0}
          playerProfession={mockPlayerProfession}
          playerBalance={5000}
          onBankClick={mockOnBankClick}
          onProfessionClick={mockOnProfessionClick}
          onFinancialFreedomClick={mockOnFinancialFreedomClick}
          onAssetsClick={mockOnAssetsClick}
          onExitClick={mockOnExitClick}
          onNextPlayer={mockOnNextPlayer}
        />
      );

      // Проверяем что прогресс-бар присутствует
      const progressBar = document.querySelector('[style*="width: 50%"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Кнопка "ПЕРЕХОД ХОДА"', () => {
    test('вызывает onNextPlayer при клике', () => {
      renderWithTheme(
        <GameControls
          players={mockPlayers}
          currentTurn="1"
          isMyTurn={true}
          turnTimer={120}
          diceValue={0}
          playerProfession={mockPlayerProfession}
          playerBalance={5000}
          onBankClick={mockOnBankClick}
          onProfessionClick={mockOnProfessionClick}
          onFinancialFreedomClick={mockOnFinancialFreedomClick}
          onAssetsClick={mockOnAssetsClick}
          onExitClick={mockOnExitClick}
          onNextPlayer={mockOnNextPlayer}
        />
      );

      const nextPlayerButton = screen.getByText('ПЕРЕХОД ХОДА');
      expect(nextPlayerButton).toBeInTheDocument();

      fireEvent.click(nextPlayerButton);
      expect(mockOnNextPlayer).toHaveBeenCalledTimes(1);
    });
  });

  describe('Отображение кубика', () => {
    test('показывает значение кубика когда оно больше 0', () => {
      renderWithTheme(
        <GameControls
          players={mockPlayers}
          currentTurn="1"
          isMyTurn={true}
          turnTimer={120}
          diceValue={6}
          playerProfession={mockPlayerProfession}
          playerBalance={5000}
          onBankClick={mockOnBankClick}
          onProfessionClick={mockOnProfessionClick}
          onFinancialFreedomClick={mockOnFinancialFreedomClick}
          onAssetsClick={mockOnAssetsClick}
          onExitClick={mockOnExitClick}
          onNextPlayer={mockOnNextPlayer}
        />
      );

      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('🎲')).toBeInTheDocument();
    });

    test('не показывает кубик когда значение 0', () => {
      renderWithTheme(
        <GameControls
          players={mockPlayers}
          currentTurn="1"
          isMyTurn={true}
          turnTimer={120}
          diceValue={0}
          playerProfession={mockPlayerProfession}
          playerBalance={5000}
          onBankClick={mockOnBankClick}
          onProfessionClick={mockOnProfessionClick}
          onFinancialFreedomClick={mockOnFinancialFreedomClick}
          onAssetsClick={mockOnAssetsClick}
          onExitClick={mockOnExitClick}
          onNextPlayer={mockOnNextPlayer}
        />
      );

      expect(screen.queryByText('🎲')).not.toBeInTheDocument();
    });
  });

  describe('Интеграционные тесты', () => {
    test('все компоненты работают вместе корректно', () => {
      renderWithTheme(
        <GameControls
          players={mockPlayers}
          currentTurn="3"
          isMyTurn={false}
          turnTimer={45}
          diceValue={4}
          playerProfession={mockPlayerProfession}
          playerBalance={5000}
          onBankClick={mockOnBankClick}
          onProfessionClick={mockOnProfessionClick}
          onFinancialFreedomClick={mockOnFinancialFreedomClick}
          onAssetsClick={mockOnAssetsClick}
          onExitClick={mockOnExitClick}
          onNextPlayer={mockOnNextPlayer}
        />
      );

      // Проверяем что все основные элементы присутствуют
      expect(screen.getByText('🎯 Очередность игроков')).toBeInTheDocument();
      expect(screen.getByText('0:45')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('Player1')).toBeInTheDocument();
      expect(screen.getByText('Player2')).toBeInTheDocument();
      expect(screen.getByText('Player3')).toBeInTheDocument();
      expect(screen.getByText('Player4')).toBeInTheDocument();
      expect(screen.getByText('ПЕРЕХОД ХОДА')).toBeInTheDocument();
      expect(screen.getByText('БАНК')).toBeInTheDocument();
    });
  });
});
