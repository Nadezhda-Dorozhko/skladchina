"use strict";
const bcrypt = require("bcryptjs");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const passwordHash = await bcrypt.hash("Admin123!", 10);
    await queryInterface.bulkInsert("users", [
      {
        email: "admin@skladchina.local",
        passwordHash,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "users",
      { email: "admin@skladchina.local" },
      {},
    );
  },
};
