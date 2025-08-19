import React, { useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

const TransferMoney = ({ roomId, userId }) => {
  const [toUser, setToUser] = useState('');
  const [amount, setAmount] = useState(0);

  const transfer = () => {
    socket.emit('transferMoney', roomId, userId, toUser, amount);
  };

  return (
    <div>
      <h2>Перевести деньги</h2>
      <input placeholder="Кому" value={toUser} onChange={e => setToUser(e.target.value)} />
      <input type="number" placeholder="Сумма" value={amount} onChange={e => setAmount(e.target.value)} />
      <button onClick={transfer}>Перевести</button>
    </div>
  );
};

export default TransferMoney;
