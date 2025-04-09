const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../utils/sequerize");
const shift_vehicule = sequelize.define(
  "shift",
  {
    SHIFT_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    HEURE_DEBUT : {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
    HEURE_FIN : {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
    
  },
  {
    freezeTableName: true,
    tableName: "shift",
    timestamps: false,
  }
);


module.exports = shift_vehicule;
