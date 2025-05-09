const {DataTypes } = require("sequelize");
const sequelize = require("../../utils/sequerize");
const chauffeur = require("./Chauffeur");
const Zone_affectation = sequelize.define(
  "chauffeur_zone_affectation",
  {
    CHAUFF_ZONE_AFFECTATION_ID : {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    DESCR_ZONE_AFFECTATION : {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      COORD : {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      COULEUR : {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      CHAUFFEUR_ID : {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      VEHICULE_ID : {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
  },
  {
    freezeTableName: true,
    tableName: "chauffeur_zone_affectation",
    timestamps: false,
  }
);
Zone_affectation.belongsTo(chauffeur,{foreignKey:'CHAUFFEUR_ID',as:'chauffeur'})

module.exports = Zone_affectation;
