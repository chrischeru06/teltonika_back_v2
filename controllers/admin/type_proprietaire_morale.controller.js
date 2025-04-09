const express = require("express")
const RESPONSE_CODES = require("../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS")
const { Op, where } = require("sequelize")
const Validation = require("../../class/Validation")
const type_proprietaire_morale = require("../../models/admin/Type_proprietaire_moral")


/**
 * Lister tous les demandes des type_proprietaire_morales
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author deco257
 */
const findAll = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query
        const defaultSortField = "ID_TYPE_PROPRIO_MORALE"
        const defaultSortDirection = "DESC"
        const sortColumns = {
            type_proprietaires: {
                as: "type_proprietaires",
                fields: {
                    ID_TYPE_PROPRIO_MORALE: "ID_TYPE_PROPRIO_MORALE",
                }
            }
        }
        var orderColumn, orderDirection
        // sorting
        var sortModel
        if (sortField) {
            for (let key in sortColumns) {
                if (sortColumns[key].fields.hasOwnProperty(sortField)) {
                    sortModel = {
                        model: key,
                        as: sortColumns[key].as
                    }
                    orderColumn = sortColumns[key].fields[sortField]
                    break
                }
            }
        }
        if (!orderColumn || !sortModel) {
            orderColumn = sortColumns.type_proprietaires.fields.ID_TYPE_PROPRIO_MORALE 
            sortModel = {
                model: 'type_proprietaires',
                as: sortColumns.type_proprietaires
            }
        }
        // ordering
        if (sortOrder == 1) {
            orderDirection = 'ASC'
        } else if (sortOrder == -1) {
            orderDirection = 'DESC'
        } else {
            orderDirection = defaultSortDirection
        }

        // searching
        const globalSearchColumns = [
            ''
        ]
        var globalSearchWhereLike = {}
        if (search && search.trim() != "") {
            const searchWildCard = {}
            globalSearchColumns.forEach(column => {
                searchWildCard[column] = {
                    [Op.substring]: search
                }
            })
            globalSearchWhereLike = {
                [Op.or]: searchWildCard
            }
        }
        const result = await type_proprietaire_morale.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            where: {
                ...globalSearchWhereLike,
            },
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des type_proprietaire_morales des voitures",
            result: {
                data: result.rows,
                // totalRecords: result.count
                totalRecords: result.rows.length,
            }
        })
    } catch (error) {
        console.log(error)
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayer plus tard",
        })
    }
};
/**
 * Permet de creer le modele de la voiture
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author deco257
 * @date 31/3/2025
 */
const createtype_proprietairemoral = async (req, res) => {
    try {
        const { DESC_TYPE_PROPRIO_MORALE } = req.body;
        const data = { ...req.body };
        const validation = new Validation(data, {
            DESC_TYPE_PROPRIO_MORALE: {
                required: true,
            }
            ,
        });

        await validation.run();
        const isValid = await validation.isValidate();
        if (!isValid) {
            const errors = await validation.getErrors();
            return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
                statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
                httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
                message: "Problème de validation des données",
                result: errors,
            });
        }

        const datainsert = await type_proprietaire_morale.create({
            DESC_TYPE_PROPRIO_MORALE,
        });

        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "donnee creer avec success",
            result: datainsert
        });
    } catch (error) {
        console.log(error);
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayez plus tard",
        });
    }
};

const updatetype_proprietairemoral = async (req, res) => {
    try {
        const {ID_TYPE_PROPRIO_MORALE} = req.params
        const { DESC_TYPE_PROPRIO_MORALE} = req.body;
        const data = { ...req.body };
        const validation = new Validation(data, {
            DESC_TYPE_PROPRIO_MORALE: {
                required: true,
            }
            ,
        });
        await validation.run();
        const isValid = await validation.isValidate();
        if (!isValid) {
            const errors = await validation.getErrors();
            return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
                statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
                httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
                message: "Problème de validation des données",
                result: errors,
            });
        }

        const datainsert = await type_proprietaire_morale.update({
            DESC_TYPE_PROPRIO_MORALE,
        }, {
            where: {
                ID_TYPE_PROPRIO_MORALE:ID_TYPE_PROPRIO_MORALE 
            }
        });

        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "donnee creer avec success",
            result: datainsert
        });
    } catch (error) {
        console.log(error);
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayez plus tard",
        });
    }
};
const deleteItems = async (req, res) => {
    try {
        const { ids } = req.body;
        const itemsIds = JSON.parse(ids);
        await type_proprietaire_morale.destroy({
            where: {
                ID_TYPE_PROPRIO_MORALE: {
                    [Op.in]: itemsIds,
                },
            },
        });
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les elements ont ete supprimer avec success",
        });
    } catch (error) {
        console.log(error);
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayer plus tard",
        });
    }
};

module.exports = {
    findAll,
    createtype_proprietairemoral,
    updatetype_proprietairemoral,
    deleteItems
}