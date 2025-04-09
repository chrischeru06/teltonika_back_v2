const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../utils/sequerize");

const marque = sequelize.define(
  "vehicule_marque",
  {
    ID_MARQUE: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    DESC_MARQUE: {
        type: DataTypes.STRING,
        allowNull: false,
      },
  },
  {
    freezeTableName: true,
    tableName: "vehicule_marque",
    timestamps: false,
  }
);

module.exports = marque;
