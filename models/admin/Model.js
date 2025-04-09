const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../utils/sequerize");

const marque = require("./Marque");

const model_vehicule = sequelize.define(
  "vehicule_modele",
  {
    ID_MODELE : {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    DESC_MODELE : {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      ID_MARQUE : {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    
  },
  {
    freezeTableName: true,
    tableName: "vehicule_modele",
    timestamps: false,
  }
);

model_vehicule.belongsTo(marque,{
    as:'marque_vehicule',
    foreignKey:'ID_MARQUE'
})
module.exports = model_vehicule;
