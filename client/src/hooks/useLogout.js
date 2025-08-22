import { useCallback } from 'react';
import socket from '../socket';

export const useLogout = () => {
  const logout = useCallback((roomId, reason = 'user_request') => {
    console.log('🔄 [useLogout] Starting logout process...', { roomId, reason });
    
    // Очищаем localStorage
    const clearStorage = () => {
      localStorage.removeItem('cashflow_currentRoom');
      localStorage.removeItem('cashflow_inSetup');
      localStorage.removeItem('cashflow_user');
      localStorage.removeItem('cashflow_gameStarted');
      console.log('🗑️ [useLogout] localStorage cleared');
    };

    // Функция принудительного редиректа
    const forceRedirect = () => {
      console.log('⚠️ [useLogout] Force redirect after timeout');
      clearStorage();
      window.location.href = '/';
    };

    // Устанавливаем таймаут на случай, если сервер не ответит
    const redirectTimeout = setTimeout(forceRedirect, 5000);

    // Обработчик успешного выхода
    const handleSuccessfulLogout = (data) => {
      console.log('✅ [useLogout] Logout successful:', data);
      clearTimeout(redirectTimeout);
      clearStorage();
      
      // Перенаправляем на главную страницу
      window.location.href = '/';
    };

    // Обработчик ошибки выхода
    const handleLogoutError = (data) => {
      console.log('❌ [useLogout] Logout failed:', data);
      clearTimeout(redirectTimeout);
      clearStorage();
      
      // Даже при ошибке перенаправляем на главную
      window.location.href = '/';
    };

    // Временно подписываемся на события
    socket.once('leftRoom', (data) => {
      if (data.success) {
        handleSuccessfulLogout(data);
      } else {
        handleLogoutError(data);
      }
    });

    // Отправляем запрос на выход
    if (roomId) {
      console.log('📤 [useLogout] Emitting leaveRoom event');
      socket.emit('leaveRoom', roomId);
    } else {
      console.log('⚠️ [useLogout] No roomId, clearing storage and redirecting');
      clearStorage();
      window.location.href = '/';
    }
  }, []);

  return { logout };
};
