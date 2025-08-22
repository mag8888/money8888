
import { useState, useEffect } from 'react';
import socket from '../socket';

const BalanceSheet = ({ roomId }) => {
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    socket.on('playerUpdated', (updatedPlayer) => {
      if (updatedPlayer.id === socket.id) setPlayer(updatedPlayer);
    });
    // Fetch initial on mount
    // Assuming event to get my player data
  }, [roomId]);

  if (!player) return <p>Загрузка...</p>;

  return (
    <div>
      <h2>Финансовая ведомость ({player.username})</h2>
      <p>Зарплата: {player.profession.salary}</p>
      <p>Пассивный доход: {player.passiveIncome}</p>
      <p>Общие доходы: {player.profession.salary + player.passiveIncome}</p>
      <p>Расходы: {player.expenses} (База: {player.profession.baseExpenses}, Дети: {player.children * player.profession.childCost}, Займы: {player.liabilities.loans / 1000 * 100})</p>
      <p>Ежемесячный кэшфло: {(player.profession.salary + player.passiveIncome) - player.expenses}</p>
      <p>Баланс: {player.balance}</p>
      <h3>Активы:</h3>
      <ul>{player.assets.map((a, i) => <li key={i}>{a.symbol} - {a.units}</li>)}</ul>
      <h3>Обязательства:</h3>
      <p>Займы: {player.liabilities.loans}</p>
      {/* Buttons for loan/repay */}
      <button onClick={() => socket.emit('game.choose', roomId, socket.id, { type: 'loan', amount: 1000 })}>Взять займ 1000</button>
      <button onClick={() => socket.emit('game.choose', roomId, socket.id, { type: 'repay', amount: 1000 })}>Погасить 1000</button>
    </div>
  );
};

export default BalanceSheet;

