const express = require("express")
const RESPONSE_CODES = require("../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS")
const { Op, where } = require("sequelize")
const Validation = require("../../class/Validation")
const marque = require("../../models/admin/Marque")
const Assureur = require("../../models/admin/Assureur")
const Assureurpload = require("../../class/uploads/AssureurUpload")
const IMAGES_DESTINATIONS = require("../../constants/IMAGES_DESTINATIONS")

/**
 * Lister tous les demandes des courses
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author deco257
 */
const findAll = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query
        const defaultSortDirection = "DESC"
        const sortColumns = {
            assureur_model: {
                as: "assureur_model",
                fields: {
                    ID_ASSUREUR: "ID_ASSUREUR",
                }
            }
        }
        let orderColumn, orderDirection
        // sorting
        let sortModel
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
            orderColumn = sortColumns.assureur_model.fields.ID_ASSUREUR
            sortModel = {
                model: 'assureur_model',
                as: sortColumns.assureur_model
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
        let globalSearchWhereLike = {}
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
        const result = await Assureur.findAndCountAll({
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
            message: "Liste des modeles des voitures",
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
const create_assureur = async (req, res) => {
    try {
        const {ASSURANCE, EMAIL, TELEPHONE, NIF, ADRESSE } = req.body;
        const files = req.files || {};
        const { ICON_LOGO } = files
        const data = { ...req.files, ...req.body };
        const validation = new Validation(data, {
            ASSURANCE: {
                required: true
            },
            
            EMAIL: {
                required: true,
            }
            ,
            TELEPHONE: {
                required: true,
            }
            ,
            NIF: {
                required: true,
            },
            ADRESSE: {
                required: true,
            },
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
        const AssureurUpload = new Assureurpload();
        let filename;
        if (ICON_LOGO) {
            const { fileInfo } = await AssureurUpload.upload(ICON_LOGO, false);
            filename = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.assureur
                }/${fileInfo.fileName}`;
        }

        const datainsert = await Assureur.create({
            ASSURANCE,
            EMAIL,
            TELEPHONE,
            NIF,
            ADRESSE,
            ID_UTILISATEUR:1,
            ICON_LOGO: filename
                ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.assureur
                }/${filename.fileName}`
                : null,

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

const update_assureur = async (req, res) => {
    try {
        const { ID_ASSUREUR } = req.params;
        const { ASSURANCE, EMAIL, TELEPHONE, NIF, ADRESSE } = req.body;
        const files = req.files || {};
        const { ICON_LOGO } = files
        const data = { ...req.files, ...req.body };
        const validation = new Validation(data, {
            ASSURANCE: {
                required: true
            },
            
            EMAIL: {
                required: true,
            }
            ,
            TELEPHONE: {
                required: true,
            }
            ,
            NIF: {
                required: true,
            },
            ADRESSE: {
                required: true,
            },
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
        const AssureurUpload = new Assureurpload();
        let filename;
        if (ICON_LOGO) {
            const { fileInfo } = await AssureurUpload.upload(ICON_LOGO, false);
            filename = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.assureur_iamge
                }/${fileInfo.fileName}`;
        }
        const profilObject = await Assureur.findByPk(ID_ASSUREUR, {
            attributes: ["ICON_LOGO", "ID_ASSUREUR"],
        });
        const datainsert = await Assureur.update({
            ASSURANCE,
            EMAIL,
            TELEPHONE,
            NIF,
            ADRESSE,
            ICON_LOGO: filename ? filename : profilObject?.ICON_LOGO,
        },
            {
                where: { ID_ASSUREUR: ID_ASSUREUR }
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
        await Assureur.destroy({
            where: {
                ID_ASSUREUR: {
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
    create_assureur,
    update_assureur,
    deleteItems
}