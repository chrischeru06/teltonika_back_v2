const {DataTypes } = require("sequelize")
const sequelize = require("../../utils/sequerize")
const trackingdata = sequelize.define(
   "tracking_data",
   {
      id: {
         type: DataTypes.INTEGER,
         allowNull: false,
         primaryKey: true,
         autoIncrement: true,
      },
      latitude: {
         type: DataTypes.STRING(250),
         allowNull: true,
      },
      longitude: {
         type: DataTypes.STRING(202),
         allowNull: true,
      },
      vitesse: {
         type: DataTypes.STRING(250),
         allowNull: true,
      },
      altitude: {
         type: DataTypes.STRING(250),
         allowNull: false,
      },
      date: {
         type: DataTypes.DATE,
         allowNull: false,
         defaultValue: DataTypes.NOW,
      },
      json: {
         type: DataTypes.TEXT,
         allowNull: true,
      },
      angle: {
         type: DataTypes.STRING(250),
         allowNull: true,
      },
      mouvement: {
         type: DataTypes.TINYINT,
         allowNull: true,
      },
      gnss_statut: {
         type: DataTypes.TINYINT,
         allowNull: true,
      },
      device_uid: {
         type: DataTypes.STRING(40),
         allowNull: true,
      },
      ignition: {
         type: DataTypes.TINYINT,
         allowNull: true,
      },
      accident: {
         type: DataTypes.TINYINT,
         allowNull: true,
      },
      MESSAGE: {
         type: DataTypes.TINYINT,
         allowNull: true,
      },
      CODE_COURSE: {
         type: DataTypes.TINYINT,
         allowNull: true,
      },
      CEINTURE: {
         type: DataTypes.STRING(40),
         allowNull: true,
      },
      CLIM: {
         type: DataTypes.STRING(40),
         allowNull: true,
      },
      STATUT_NOTIF: {
         type: DataTypes.TINYINT,
         allowNull: true,
      },
   },
   {
      freezeTableName: true,
      tableName: "tracking_data",
      timestamps: false,
   },
)

module.exports = trackingdata
