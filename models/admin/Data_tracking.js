// Voici à quoi pourrait ressembler la mise à jour de votre modèle de données
// Ajustez en fonction de votre ORM (Sequelize, TypeORM, etc.)

// Si vous utilisez Sequelize:
const { DataTypes } = require('sequelize');
const sequelize = require('../../utils/sequerize');


  const data_tracking = sequelize.define('data_tracking', {
    id_tracking : {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    imei: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    data_json: {
      type: DataTypes.TEXT, // ou DataTypes.JSONB si votre base de données le supporte
      allowNull: true // On le laisse nullable pour les nouveaux enregistrements qui utiliseront file_path
    },
    file_path: {
      type: DataTypes.STRING(255),
      allowNull: true // Pour la compatibilité avec les anciens enregistrements
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'tracking_info_data',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

module.exports = data_tracking;
