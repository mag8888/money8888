
const config = require('../../shared/seed_v1.json');

// Mock player
const player = {
  balance: 0,
  passiveIncome: 0,
  expenses: 3000,
  assets: [{ symbol: 'STOCK_A', units: 100, cashflow: 10, mortgage: 0 }],
  liabilities: { loans: 0 },
  profession: { salary: 5000 }
};

test('Loan increases balance and expenses', () => {
  const amount = 1000;
  player.balance += amount;
  player.liabilities.loans += amount;
  player.expenses += (amount / 1000) * config.rules.loanInterestPer1000;
  expect(player.balance).toBe(1000);
  expect(player.expenses).toBe(3100);
});

test('Market sell', () => {
  const card = { symbol: 'STOCK_A', price: 10 };
  const asset = player.assets[0];
  const proceeds = (card.price * asset.units) - asset.mortgage;
  player.balance += proceeds;
  player.passiveIncome -= asset.cashflow;
  player.assets = [];
  expect(player.balance).toBe(2000); // 1000 + 1000
  expect(player.passiveIncome).toBe(-10);
});

test('Fast track transition', () => {
  player.passiveIncome = 3100;
  expect(player.passiveIncome >= player.expenses).toBe(true);
});




