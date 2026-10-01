'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('purchases', 'category', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'other',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('purchases', 'category');
  }
};
