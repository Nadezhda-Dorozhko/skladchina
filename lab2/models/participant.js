'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Participant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Каждый участник принадлежит одной складчине
      Participant.belongsTo(models.Purchase, {
        foreignKey: "purchaseId",
        as: "purchase",
      });
    }
  }
  Participant.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contribution: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    purchaseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "purchases",
        key: "id",
      },
    },
  }, {
    sequelize,
    modelName: 'Participant',
    tableName: 'participants',
  });
  return Participant;
};