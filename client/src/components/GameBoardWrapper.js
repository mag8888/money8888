import React from 'react';
import { useParams } from 'react-router-dom';
import GameBoardRefactored from './GameBoardRefactored';

const GameBoardWrapper = ({ playerData, currentRoom, onExitGame }) => {
  const { roomId } = useParams();

  return (
    <GameBoardRefactored 
      playerData={playerData}
      roomId={roomId}
      currentRoom={currentRoom}
      onExitGame={onExitGame}
    />
  );
};

export default GameBoardWrapper;
