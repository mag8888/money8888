// 👤 Player - Класс игрока
export class Player {
  constructor(id, username, initialBalance = 2000) {
    this.id = id;
    this.username = username;
    this.balance = initialBalance;
    this.position = 0;
    this.ready = false;
    this.assets = [];
    this.liabilities = [];
    this.profession = null;
    this.isFinancialFree = false;
  }

  // Получить информацию об игроке
  getInfo() {
    return {
      id: this.id,
      username: this.username,
      balance: this.balance,
      position: this.position,
      ready: this.ready,
      profession: this.profession,
      isFinancialFree: this.isFinancialFree
    };
  }

  // Установить готовность
  setReady(ready) {
    this.ready = ready;
  }

  // Переместить игрока
  movePosition(steps) {
    this.position = (this.position + steps) % 40; // 40 клеток на поле
  }

  // Изменить баланс
  changeBalance(amount) {
    this.balance += amount;
    if (this.balance < 0) {
      this.balance = 0;
    }
  }

  // Добавить актив
  addAsset(asset) {
    this.assets.push(asset);
  }

  // Добавить обязательство
  addLiability(liability) {
    this.liabilities.push(liability);
  }

  // Установить профессию
  setProfession(profession) {
    this.profession = profession;
  }

  // Проверить финансовую свободу
  checkFinancialFreedom() {
    const passiveIncome = this.assets.reduce((sum, asset) => sum + (asset.passiveIncome || 0), 0);
    const expenses = this.liabilities.reduce((sum, liability) => sum + (liability.expenses || 0), 0);
    
    this.isFinancialFree = passiveIncome > expenses;
    return this.isFinancialFree;
  }
}
