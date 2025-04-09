const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../utils/sequerize');

const type_proprietaire_morale = sequelize.define("Type_proprietaire_morale", {
    ID_TYPE_PROPRIO_MORALE: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    DESC_TYPE_PROPRIO_MORALE: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    }, {
        freezeTableName: true,
        tableName: 'type_proprietaire_morale',
        timestamps: false
    })

module.exports = type_proprietaire_morale