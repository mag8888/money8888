import React, { useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

const DealOffer = ({ roomId, userId }) => {
  const [toUser, setToUser] = useState('');
  const [dealDetails, setDealDetails] = useState('');
  const [price, setPrice] = useState(0);

  const offerDeal = () => {
    socket.emit('offerDeal', roomId, userId, toUser, dealDetails, price);
  };

  return (
    <div>
      <h2>Предложить сделку</h2>
      <input placeholder="Кому" value={toUser} onChange={e => setToUser(e.target.value)} />
      <input placeholder="Детали сделки" value={dealDetails} onChange={e => setDealDetails(e.target.value)} />
      <input type="number" placeholder="Цена" value={price} onChange={e => setPrice(e.target.value)} />
      <button onClick={offerDeal}>Предложить</button>
    </div>
  );
};

export default DealOffer;
