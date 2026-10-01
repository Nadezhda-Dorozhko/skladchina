'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('purchases', [
      {
        title: 'Оптовая закупка кофе для офиса',
        description: 'Закупка зернового кофе Lavazza, скидка при заказе от 10 кг',
        organizer: 'Иван Петров',
        targetAmount: 15000,
        currentAmount: 4500,
        deadline: '2026-09-30',
        status: 'active',
        category: 'продукты',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Складчина на настольную игру',
        description: 'Коллекционное издание с доставкой из-за рубежа',
        organizer: 'Мария Смирнова',
        targetAmount: 8000,
        currentAmount: 8000,
        deadline: '2026-08-15',
        status: 'completed',
        category: 'хобби',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('purchases', null, {});
  },
};
