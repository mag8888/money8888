import React from 'react';
import { useParams } from 'react-router-dom';
import SimpleRoomSetup from './SimpleRoomSetup';

const RoomSetupWrapper = ({ playerData, onExitGame }) => {
  const { roomId } = useParams();
  
  return (
    <SimpleRoomSetup 
      playerData={playerData}
      roomId={roomId}
      onExitGame={onExitGame}
    />
  );
};

export default RoomSetupWrapper;
