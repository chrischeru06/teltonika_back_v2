const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../utils/sequerize");

const Assureur = sequelize.define(
  "assureur",
  {
    ID_ASSUREUR: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ID_UTILISATEUR: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ASSURANCE: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      EMAIL: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      TELEPHONE: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      NIF: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      ADRESSE: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      DATE_INS:{
        type: DataTypes.DATE,
        defaultValue:DataTypes.NOW,
        allowNull: false,
      },
      ICON_LOGO:{
        type: DataTypes.TEXT,
        allowNull: false,
      }
      
  },
  {
    freezeTableName: true,
    tableName: "assureur",
    timestamps: false,
  }
);

module.exports = Assureur;
