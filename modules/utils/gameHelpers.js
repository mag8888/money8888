// 🎯 GameHelpers - Вспомогательные функции для игры
export class GameHelpers {
  // Генерация случайного ID
  static generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}${timestamp}${random}`;
  }

  // Бросок кубиков
  static rollDice(count = 2) {
    const results = [];
    for (let i = 0; i < count; i++) {
      results.push(Math.floor(Math.random() * 6) + 1);
    }
    return results;
  }

  // Форматирование денег
  static formatMoney(amount) {
    return `$${amount.toLocaleString()}`;
  }
}
