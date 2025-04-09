const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../utils/sequerize');
const Syst_communes = require('./Syst_commune');
const Syst_provinces = require('./Syst_province');
const Syst_collines = require('./Syst_colline');
const Syst_zones = require('./Syst_zone');

/**
* model pour les chauffeurs
 * @author:derick
 */

const chauffeur = sequelize.define("chauffeur", {
    CHAUFFEUR_ID : {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    NOM: {
        type: DataTypes.STRING(80),
        allowNull: false
    },
    PRENOM: {
        type: DataTypes.STRING(80),
        allowNull: false
    },
    ADRESSE_PHYSIQUE: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    NUMERO_TELEPHONE: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    DATE_NAISSANCE: {
        type: DataTypes.DATE,
        allowNull: false
    },
    GENRE_ID:{
        type: DataTypes.TINYINT(4),
        allowNull: false
    },
    ADRESSE_MAIL: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    NUMERO_CARTE_IDENTITE: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    FILE_CARTE_IDENTITE:{
        type: DataTypes.STRING(50),
        allowNull: false
    },
    FILE_IDENTITE_COMPLETE: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    FILE_CASIER_JUDICIAIRE: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
    ,
    NUMERO_PERMIS: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    FILE_PERMIS: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    DATE_EXPIRATION_PERMIS: {
        type: DataTypes.DATE,
        allowNull: false
    },
    PERSONNE_CONTACT_TELEPHONE: {
        type: DataTypes.STRING(12),
        allowNull: false
    },
    DATE_INSERTION: {
        type: DataTypes.DATE,
        defaultValue:DataTypes.NOW,
        allowNull: false
    },
    PROVINCE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    COMMUNE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ZONE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    COLLINE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    PHOTO_PASSPORT: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    STATUT_VEHICULE: {
        type: DataTypes.TINYINT(4),
        allowNull: false
    },
    IS_ACTIVE: {
        type: DataTypes.TINYINT(4),
        allowNull: false
    },
    PROPRIETAIRE_ID: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
   
    
}, {
    freezeTableName: true,
    tableName:'chauffeur',
    timestamps: false
})
chauffeur.belongsTo(Syst_communes, {
    as: 'communeproprio',
    foreignKey: 'COMMUNE_ID'
})
chauffeur.belongsTo(Syst_provinces, {
    as: 'provinceproprio',
    foreignKey: 'PROVINCE_ID'
})
chauffeur.belongsTo(Syst_collines, {
    as: 'collineproprio',
    foreignKey: 'COLLINE_ID'
})
chauffeur.belongsTo(Syst_zones, {
    as: 'zoneeproprio',
    foreignKey: 'ZONE_ID'
})
module.exports = chauffeur