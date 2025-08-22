import React, { useState, useEffect } from 'react';
import socket from '../socket';

const DealOffer = ({ roomId, userId }) => {
  const [toUser, setToUser] = useState('');
  const [players, setPlayers] = useState([]);
  const [dealDetails, setDealDetails] = useState('');
  const [price, setPrice] = useState(0);

  useEffect(() => {
    socket.emit('getPlayers', roomId);
    socket.on('playersList', setPlayers);
    return () => socket.off('playersList');
  }, [roomId]);

  const offerDeal = () => {
    socket.emit('offerDeal', roomId, userId, toUser, dealDetails, price);
  };

  return (
    <div>
      <h2>Предложить сделку</h2>
      <select value={toUser} onChange={e => setToUser(e.target.value)}>
        <option value="">Выберите игрока</option>
        {players
          .filter(player => player.id !== userId && player.roomId === roomId) // Фильтруем только игроков из текущей комнаты
          .map((player) => (
            <option key={player.id} value={player.id}>
              {player.username || `Игрок ${player.id.slice(-4)}`} (в комнате)
            </option>
          ))}
      </select>
      <input placeholder="Детали сделки" value={dealDetails} onChange={e => setDealDetails(e.target.value)} />
      <input type="number" placeholder="Цена" value={price} onChange={e => setPrice(e.target.value)} />
      <button onClick={offerDeal}>Предложить</button>
    </div>
  );
};

export default DealOffer;
