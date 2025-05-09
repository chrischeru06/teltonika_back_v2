const {DataTypes } = require("sequelize")
const sequelize = require("../../utils/sequerize")
const operateur_resau = sequelize.define(
   "operateur_reseau",
   {
      OPERATEUR_ID: {
         type: DataTypes.INTEGER,
         allowNull: false,
         primaryKey: true,
         autoIncrement: true,
      },
      DESC_OPERATEUR: {
         type: DataTypes.STRING(30),
         allowNull: false,
      },
   },
   {
      freezeTableName: true,
      tableName: "operateur_reseau",
      timestamps: false,
   },
)

module.exports = operateur_resau
