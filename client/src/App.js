import React from 'react';
import MainMenu from './components/MainMenu';
import io from 'socket.io-client';
import DealOffer from './components/DealOffer';
import TransferMoney from './components/TransferMoney';

const socket = io('http://localhost:3000');

function App() {
  return (
    <div>
      <h1>Cashflow Web</h1>
      <p>Добро пожаловать в веб-версию игры Cashflow!</p>
      <MainMenu />
      <DealOffer roomId="exampleRoom" userId="exampleUser" />
      <TransferMoney roomId="exampleRoom" userId="exampleUser" />
    </div>
  );
}

export default App;
