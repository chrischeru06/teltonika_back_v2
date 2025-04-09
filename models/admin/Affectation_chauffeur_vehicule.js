const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../utils/sequerize');
const Employees = require('./Employes');
const Vehicules = require('./Vehicules');
/**
* model pour les affectation des chauffeurs aux vehivules
 * @author:derick
 */
const Affectation_chauffeur = sequelize.define("tr_affectation_chauffeur_vehicule", {
    AFFECTATION_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    CODE_AFFECTATION: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    EMPLOYEE_ID: {
        type: DataTypes.BIGINT(20),
        allowNull: false
    },
    VEHICULE_ID: {
        type: DataTypes.BIGINT(20),
        allowNull: false
    },
    DATE_AFFECTATION: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    freezeTableName: true,
    tableName: 'tr_affectation_chauffeur_vehicule',
    timestamps: false
})

Affectation_chauffeur.belongsTo(Employees, { as: 'employe', foreignKey: 'EMPLOYEE_ID' })
Affectation_chauffeur.belongsTo(Vehicules, { as: 'vehicule', foreignKey: 'VEHICULE_ID' })

module.exports = Affectation_chauffeur