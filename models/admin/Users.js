const {DataTypes } = require('sequelize');
const sequelize = require('../../utils/sequerize');
const profiles = require('./Profils');
const Proprietaire = require('./Proprietaire');
const Assureur = require('./Assureur');


const utilisateur = sequelize.define("utilisateur", {
    USER_ID : {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    IDENTIFICATION: {
        type: DataTypes.STRING(30),
        allowNull: false,
    },
    USER_NAME: {
        type: DataTypes.STRING(30),
        allowNull: false
    },
    PASSWORD: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    TELEPHONE:{
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    PROPRIETAIRE_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    CHAUFFEUR_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ID_GESTIONNAIRE_VEHICULE: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    PROFIL_ID:{
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ID_ASSURREUR:{
        type: DataTypes.INTEGER,
        allowNull: true
    },
    STATUT: {
        type: DataTypes.TINYINT(4),
        allowNull: false
    }
}, {
    freezeTableName: true,
    tableName: 'users',
    timestamps: false
})
utilisateur.belongsTo(profiles,{
    as:'profile',
    foreignKey:'PROFIL_ID'
})
utilisateur.belongsTo(Assureur,{
    as:'assurreur',
    foreignKey:'ID_ASSURREUR'
})
utilisateur.belongsTo(Proprietaire,{
    as:'proprietaire',
    foreignKey:'PROPRIETAIRE_ID'
})
// utilisateur.belongsTo(shift_vehicule,{
//     as:'shift_vehicule',
//     foreignKey:'SHIFT_ID'
// })

module.exports = utilisateur