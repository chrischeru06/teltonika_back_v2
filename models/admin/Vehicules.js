const {DataTypes } = require('sequelize');
const sequelize = require('../../utils/sequerize');

const marque = require('./Marque');
const model_vehicule = require('./Model');
const Proprietaire = require('./Proprietaire');
const shift_vehicule = require('./Shift');

const Vehicules = sequelize.define("tr_vehicule", {
    VEHICULE_ID : {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    CODE: {
        type: DataTypes.STRING(30),
        allowNull: false,
    },
    ID_MARQUE: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ID_MODELE: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    PLAQUE:{
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    PROPRIETAIRE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    USAGE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ANNEE_FABRICATION: {
        type: DataTypes.DATE,
        allowNull: false
    },
    NUMERO_CHASSIS: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    COULEUR: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    PHOTO: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    KILOMETRAGE: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    SHIFT_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    DATE_SAVE: {
        type: DataTypes.DATE,
        defaultValue:DataTypes.NOW,
        allowNull: false
    },
    DATE_DEBUT_ASSURANCE: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    DATE_FIN_ASSURANCE: {
        type: DataTypes.STRING(19),
        allowNull: false
    },
    DATE_DEBUT_CONTROTECHNIK: {
        type: DataTypes.STRING(19),
        allowNull: false
    },
    DATE_FIN_CONTROTECHNIK: {
        type: DataTypes.STRING(19),
        allowNull: false
    },
    FILE_ASSURANCE: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    FILE_CONTRO_TECHNIQUE: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    STATUT: {
        type: DataTypes.TINYINT(4),
        allowNull: false
    },
    STATUT_VEH_AJOUT: {
        type: DataTypes.TINYINT(4),
        allowNull: false
    },
    TRAITEMENT_DEMANDE_ID: {
        type: DataTypes.TINYINT(4),
        allowNull: false
    },
    COMMENTAIRE: {
        type: DataTypes.STRING(40),
        allowNull: true
    },
    IS_ACTIVE: {
        type: DataTypes.TINYINT(4),
        allowNull: false
    },
    ID_ASSUREUR: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    STAT_NOTIFICATION: {
        type: DataTypes.TINYINT(4),
        allowNull: false
    },
    IMAGE_AVANT: {
        type: DataTypes.STRING(100),
        allowNull: true

    },
    IMAGE_ARRIERE: {
        type: DataTypes.STRING(100),
        allowNull: true

    },
    IMAGE_LATERALE_GAUCHE: {
        type: DataTypes.TINYINT(4),
        allowNull: true

    },
    IMAGE_LATERALE_DROITE: {
        type: DataTypes.TINYINT(4),
        allowNull: true

    },
    IMAGE_TABLEAU_DE_BORD: {
        type: DataTypes.TINYINT(4),
        allowNull: true

    },
    IMAGE_SIEGE_AVANT: {
        type: DataTypes.TINYINT(4),
        allowNull: true

    },
    IMAGE_SIEGE_ARRIERE: {
        type: DataTypes.TINYINT(4),
        allowNull: true
    },

}, {
    freezeTableName: true,
    tableName: 'vehicule',
    timestamps: false
})
Vehicules.belongsTo(marque,{
    as:'marques',
    foreignKey:'ID_MARQUE'
})
Vehicules.belongsTo(model_vehicule,{
    as:'modele',
    foreignKey:'ID_MODELE'
})
Vehicules.belongsTo(Proprietaire,{
    as:'proprietaire',
    foreignKey:'PROPRIETAIRE_ID'
})
Vehicules.belongsTo(shift_vehicule,{
    as:'shift_vehicule',
    foreignKey:'SHIFT_ID'
})

module.exports = Vehicules