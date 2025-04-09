const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../utils/sequerize');
const Type_proprietaire = require('./Type_proprietaire');
const Type_proprietaire_moral = require('./Type_proprietaire_moral');
const Syst_province = require('./Syst_province');
const Syst_commune = require('./Syst_commune');
const Syst_colline = require('./Syst_colline');
const Syst_zone = require('./Syst_zone');
/**
* model pour les employes
 * @author:derick
 */

const Proprietaire = sequelize.define("proprietaire", {
    PROPRIETAIRE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    TYPE_PROPRIETAIRE_ID: {
        type: DataTypes.TINYINT(4),
        allowNull: false
    },
    ID_TYPE_PROPRIO_MORALE: {
        type: DataTypes.TINYINT(4),
        allowNull: true
    },
    NOM_PROPRIETAIRE: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    PRENOM_PROPRIETAIRE: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    PERSONNE_REFERENCE: {
        type: DataTypes.STRING(250),
        allowNull: false
    },
    EMAIL: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    TELEPHONE: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    CNI_OU_NIF: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
    ,
    RC: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    PROVINCE_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    COMMUNE_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ZONE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    COLLINE_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    COUNTRY_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    CATEGORIE_ID: {
        type: DataTypes.TINYINT(4),
        allowNull: true
    },
    DATE_INSERTION: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    ADRESSE: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    PHOTO_PASSPORT: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    FILE_CNI_PASSPORT: {
        type: DataTypes.STRING(250),
        allowNull: false
    },
    LOGO: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    IS_ACTIVE: {
        type: DataTypes.TINYINT(4),
        allowNull: false
    },
    FILE_NIF: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    FILE_RC: {
        type: DataTypes.STRING(250),
        allowNull: true
    },

}, {
    freezeTableName: true,
    tableName: 'proprietaire',
    timestamps: false
})

//reste l association
Proprietaire.belongsTo(Type_proprietaire, {
    as: 'type_proprio',
    foreignKey: 'TYPE_PROPRIETAIRE_ID'
})
Proprietaire.belongsTo(Type_proprietaire_moral, {
    as: 'type_propriomorale',
    foreignKey: 'ID_TYPE_PROPRIO_MORALE'
})
Proprietaire.belongsTo(Syst_commune, {
    as: 'communeproprio',
    foreignKey: 'COMMUNE_ID'
})
Proprietaire.belongsTo(Syst_province, {
    as: 'provinceproprio',
    foreignKey: 'PROVINCE_ID'
})
Proprietaire.belongsTo(Syst_colline, {
    as: 'collineproprio',
    foreignKey: 'COLLINE_ID'
})
Proprietaire.belongsTo(Syst_zone, {
    as: 'zoneeproprio',
    foreignKey: 'ZONE_ID'
})
module.exports = Proprietaire