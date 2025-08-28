import { useState, useCallback } from 'react';

export const useDreamSelection = () => {
  const [selectedDream, setSelectedDream] = useState(null);
  const [dreamSelectionModalOpen, setDreamSelectionModalOpen] = useState(false);

  const openDreamSelection = useCallback(() => {
    setDreamSelectionModalOpen(true);
  }, []);

  const closeDreamSelection = useCallback(() => {
    setDreamSelectionModalOpen(false);
  }, []);

  const handleDreamSelected = useCallback((dream) => {
    setSelectedDream(dream);
    // Здесь можно добавить логику для отправки выбранной мечты на сервер
    console.log('Игрок выбрал мечту:', dream);
  }, []);

  const resetDreamSelection = useCallback(() => {
    setSelectedDream(null);
  }, []);

  return {
    selectedDream,
    dreamSelectionModalOpen,
    openDreamSelection,
    closeDreamSelection,
    handleDreamSelected,
    resetDreamSelection
  };
};

