import React, { useState, useEffect } from 'react';
import socket from '../socket';

const TransferMoney = ({ roomId, userId }) => {
  const [toUser, setToUser] = useState('');
  const [amount, setAmount] = useState(0);
  const [assetId, setAssetId] = useState('');
  const [targetPlayer, setTargetPlayer] = useState('');
  const [players, setPlayers] = useState([]);
  const [myAssets, setMyAssets] = useState([]);

  useEffect(() => {
    socket.on('playersList', setPlayers);
    socket.on('playerUpdated', (player) => {
      if (player.id === socket.id) setMyAssets(player.assets);
    });
  }, []);

  const transfer = () => {
    socket.emit('transferMoney', roomId, userId, toUser, amount);
  };

  const transferAsset = () => {
    socket.emit('game.choose', roomId, socket.id, { type: 'transfer_asset', targetPlayerId: targetPlayer, assetId });
  };

  return (
    <div>
      <h2>Перевести деньги</h2>
      <input placeholder="Кому" value={toUser} onChange={e => setToUser(e.target.value)} />
      <input type="number" placeholder="Сумма" value={amount} onChange={e => setAmount(e.target.value)} />
      <button onClick={transfer}>Перевести</button>
      <h2>Перевести актив</h2>
      <select value={targetPlayer} onChange={e => setTargetPlayer(e.target.value)}>
        {players
          .filter(p => p.id !== socket.id && p.roomId === roomId) // Фильтруем только игроков из текущей комнаты
          .map(p => (
            <option key={p.id} value={p.id}>
              {p.username || `Игрок ${p.id.slice(-4)}`} (в комнате)
            </option>
          ))}
      </select>
      <select value={assetId} onChange={e => setAssetId(e.target.value)}>
        {myAssets.map(a => <option key={a.id} value={a.id}>{a.symbol}</option>)}
      </select>
      <button onClick={transferAsset}>Передать</button>
    </div>
  );
};

export default TransferMoney;
