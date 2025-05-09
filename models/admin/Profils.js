const {DataTypes } = require("sequelize");
const sequelize = require("../../utils/sequerize");
const profiles = sequelize.define(
  "profil",
  {
    PROFIL_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    DESCRIPTION_PROFIL : {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      CODE_PROFIL: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      ROLE: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
  },
  {
    freezeTableName: true,
    tableName: "profil",
    timestamps: false,
  }
);

module.exports = profiles;
