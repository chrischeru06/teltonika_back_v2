const { DataTypes } = require("sequelize");
const sequelize = require("../../utils/sequerize");

const Syst_provinces = require("./Syst_province");

const Syst_communes = sequelize.define(
  "communes",
  {
    COMMUNE_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    COMMUNE_NAME: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    PROVINCE_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    LATITUDE: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    LONGITUDE: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    tableName: "communes",
    timestamps: false,
  }
);

Syst_communes.belongsTo(Syst_provinces, {
  foreignKey: "PROVINCE_ID",
  as: "province",
});

module.exports = Syst_communes;
