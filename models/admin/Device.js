const { DataTypes } = require("sequelize")
const sequelize = require("../../utils/sequerize")
const operateur_resau = require("./Operateur_resau")
const Vehicules = require("./Vehicules")
const device = sequelize.define(
   "device",
   {
      DEVICE_ID: {
         type: DataTypes.INTEGER,
         allowNull: false,
         primaryKey: true,
         autoIncrement: true,
      },
      CODE: {
         type: DataTypes.STRING(20),
         allowNull: false,
      },
      VEHICULE_ID: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      DATE_INSTALL: {
         type: DataTypes.DATE,
         allowNull: false,
      },
      OPERATEUR_ID: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      NUMERO: {
         type: DataTypes.STRING(15),
         allowNull: false,
      },
      DATE_ACTIVE_MEGA: {
         type: DataTypes.DATE,
         allowNull: false,
      },
      DATE_EXPIRE_MEGA: {
         type: DataTypes.DATE,
         allowNull: false,
      },
      IS_ACTIVE: {
         type: DataTypes.TINYINT,
         allowNull: false,
      },
      DATE_SAVE: {
         type: DataTypes.DATE,
         defaultValue: DataTypes.NOW,
         allowNull: false,
      },
   },
   {
      freezeTableName: true,
      tableName: "device",
      timestamps: false,
   },
)
device.belongsTo(operateur_resau, {
   as: "operateur",
   foreignKey: "OPERATEUR_ID",
})
device.belongsTo(Vehicules, {
   as: "vehicule",
   foreignKey: "VEHICULE_ID",
})
module.exports = device
