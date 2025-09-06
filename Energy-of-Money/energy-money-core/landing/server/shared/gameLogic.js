const rollDice = () => {
  return Math.floor(Math.random() * 6) + 1;
};

const calculateIncome = (profession, salary) => {
  return salary || 1000;
};

module.exports = {
  rollDice,
  calculateIncome
};
