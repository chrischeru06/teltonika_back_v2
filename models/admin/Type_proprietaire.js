const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../utils/sequerize');

const Type_proprietaire = sequelize.define("type_proprietaire", {
    TYPE_PROPRIETAIRE_ID : {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    DESC_TYPE_PROPRIETAIRE: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
}, {
    freezeTableName: true,
    tableName: 'type_proprietaire',
    timestamps: false
})


module.exports = Type_proprietaire