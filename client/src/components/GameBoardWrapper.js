import React from 'react';
import { useParams } from 'react-router-dom';
import GameBoardRefactored from './GameBoardRefactored';

const GameBoardWrapper = ({ playerData, onExitGame }) => {
  const { roomId } = useParams();

  return (
    <GameBoardRefactored 
      playerData={playerData}
      roomId={roomId}
      onExitGame={onExitGame}
    />
  );
};

export default GameBoardWrapper;
