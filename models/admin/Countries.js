const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../utils/sequerize");
const Countries = sequelize.define(
    "countries",
    {
        COUNTRY_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        SortOrder: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        CommonName: {
            type: DataTypes.STRING(38),
            allowNull: false,
        },
        FormalName: {
            type: DataTypes.STRING(53),
            allowNull: false,
        },
        Type: {
            type: DataTypes.STRING(23),
            allowNull: false,
        },
        Sub_Type: {
            type: DataTypes.STRING(34),
            allowNull: false,
        },
        Sovereignty: {
            type: DataTypes.STRING(14),
            allowNull: false,
        },
        Capital: {
            type: DataTypes.STRING(78),
            allowNull: false,
        },
        ISO_4217_Currency_Code: {
            type: DataTypes.STRING(11),
            allowNull: false,
        },
        ISO_4217_Currency_Name: {
            type: DataTypes.STRING(14),
            allowNull: false,
        },
        ITU_T_Telephone_Code: {
            type: DataTypes.STRING(16),
            allowNull: false,
        },
        ISO2LetterCode: {
            type: DataTypes.STRING(2),
            allowNull: false,
        },
        ISO3Letter_Code: {
            type: DataTypes.STRING(3),
            allowNull: false,
        },

        ISO_3166_1_Number: {
            type: DataTypes.STRING(3),
            allowNull: false,
        },
        IANA_Country_Code_TLD: {
            type: DataTypes.STRING(11),
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
        tableName: "countries",
        timestamps: false,
    }
);
module.exports = Countries;
