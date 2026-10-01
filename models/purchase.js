"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Purchase extends Model {
    static associate(models) {
      Purchase.hasMany(models.Participant, {
        foreignKey: "purchaseId",
        as: "participants",
        onDelete: "CASCADE",
      });
    }
  }
  Purchase.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      organizer: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      targetAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0.01 },
      },
      currentAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      deadline: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "active",
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "other",
      },
    },
    {
      sequelize,
      modelName: "Purchase",
      tableName: "purchases",
    },
  );
  return Purchase;
};
