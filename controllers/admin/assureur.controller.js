const express = require("express")
const RESPONSE_CODES = require("../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS")
const { Op} = require("sequelize")
const Validation = require("../../class/Validation")
const marque = require("../../models/admin/Marque")
const Assureur = require("../../models/admin/Assureur")
const Assureurpload = require("../../class/uploads/AssureurUpload")
const IMAGES_DESTINATIONS = require("../../constants/IMAGES_DESTINATIONS")
const Vehicules = require("../../models/admin/Vehicules")
const model_vehicule = require("../../models/admin/Model")
const Users = require("../../models/admin/Users")
const randomInt = require("../../utils/randomInt")
const bcrypt = require("bcrypt");
const path = require('path');
const fs = require('fs');
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
         const driverIds = result.rows.map((e) => e.toJSON().ID_ASSUREUR);
                const vehicule = await Vehicules.findAll({
                    include: [
                        {
                            model: marque,
                            as: 'marques'
                        },
                        {
                            model: model_vehicule,
                            as: 'modele'
                        },
        
                    ],
                    where: {
                        [Op.and]: {
                            ID_ASSUREUR: {
                                [Op.in]: driverIds,
                            },
                        },
                    },
                });
        
                const resultss = await Promise.all(
                    result.rows.map((driverObject) => {
                        const proprietaire = driverObject.toJSON();
                        const vehiculnombre = vehicule.filter(
                            (allC) => proprietaire.ID_ASSUREUR == allC.ID_ASSUREUR
                        );
                        // const controle= nombrecontrole.filter(allC => agent.PSR_AFFECTATION_ID == allC.PSR_AFFECTATION_ID)
                        return {
                            ...proprietaire,
                            vehiculnombre,
                            // controle,
                        };
                    })
                );
        
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des modeles des voitures",
            result: {
                data: resultss,
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
// const create_assureur = async (req, res) => {
//     try {
//         const { ASSURANCE, EMAIL, TELEPHONE, NIF, ADRESSE } = req.body;
//         const files = req.files || {};
//         const { ICON_LOGO } = files;

//         const data = { ...req.body, ...req.files };
//         const validation = new Validation(data, {
//             ASSURANCE: { required: true },
//             EMAIL: { required: true },
//             TELEPHONE: { required: true },
//             NIF: { required: true },
//             ADRESSE: { required: true },
//         });

//         await validation.run();
//         const isValid = await validation.isValidate();
        
//         if (!isValid) {
//             const errors = await validation.getErrors();
//             console.log('Erreurs de validation:', errors);
//             return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
//                 statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
//                 httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
//                 message: "Problème de validation des données",
//                 result: errors,
//             });
//         }

//         let iconUrl = null;
//         if (ICON_LOGO) {
//             const AssureurUpload = new Assureurpload();
//             const { fileInfo } = await AssureurUpload.upload(ICON_LOGO, false);
//             iconUrl = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.assureur}/${fileInfo.fileName}`;
//         }

//         const identificationCode = randomInt(100000, 999999);
//         const hashedPassword = await bcrypt.hash("12345678", 10);

//         const datainsert = await Assureur.create({
//             ASSURANCE,
//             EMAIL,
//             TELEPHONE,
//             NIF,
//             ADRESSE,
//             ID_UTILISATEUR: 1,
//             ICON_LOGO: iconUrl,
//         });

//         const idassureur = datainsert.toJSON().ID_ASSUREUR;
//         await Users.create({
//             IDENTIFICATION: identificationCode,
//             USER_NAME: EMAIL,
//             TELEPHONE,
//             PASSWORD: hashedPassword,
//             PROFIL_ID: 1,
//             STATUT: 1,
//             ID_ASSURREUR: idassureur,
//         });

//         res.status(RESPONSE_CODES.CREATED).json({
//             statusCode: RESPONSE_CODES.CREATED,
//             httpStatus: RESPONSE_STATUS.CREATED,
//             message: "Données créées avec succès",
//             result: datainsert,
//         });

//     } catch (error) {
//         console.error('Erreur complète:', error);
        
//         // Gestion spécifique des erreurs de base de données
//         if (error.name === 'SequelizeValidationError') {
//             return res.status(400).json({
//                 statusCode: 400,
//                 httpStatus: 'VALIDATION_ERROR',
//                 message: "Erreur de validation de la base de données",
//                 message:error,
//                 result: error.errors
//             });
//         }

//         if (error.name === 'SequelizeUniqueConstraintError') {
//             return res.status(409).json({
//                 statusCode: 409,
//                 httpStatus: 'CONFLICT',
//                 message: "Cette donnée existe déjà",
//                 result: error.errors
//             });
//         }

//         res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
//             statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
//             httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
//             message: error.message, // Correction ici
//             message: "Erreur interne du serveur, réessayez plus tard",
//             message:error,
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

const create_assureur = async (req, res) => {
    try {
       

        const { ASSURANCE, EMAIL, TELEPHONE, NIF, ADRESSE } = req.body;
        const files = req.files || {};
        const { ICON_LOGO } = files;

        const data = { ...req.body, ...req.files };
        return console.log(data,'les dataaaa')
        const validation = new Validation(data, {
            ASSURANCE: { required: true },
            EMAIL: { required: true },
            TELEPHONE: { required: true },
            NIF: { required: true },
            ADRESSE: { required: true },
        });

        console.log('Validation des données en cours...');
        await validation.run();
        const isValid = await validation.isValidate();
        
        if (!isValid) {
            const errors = await validation.getErrors();
            console.log('Erreurs de validation:', errors);
            return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
                statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
                httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
                message: "Problème de validation des données",
                result: errors,
            });
        }

        let iconUrl = null;
        if (ICON_LOGO) {
            // Création du répertoire images s'il n'existe pas
            const imagesPath = path.join(__dirname, '..', 'public', 'uploads', 'images');
            if (!fs.existsSync(imagesPath)) {
                fs.mkdirSync(imagesPath, { recursive: true });
                console.log(`Répertoire créé : ${imagesPath}`);
            }

            const AssureurUpload = new Assureurpload();
            const { fileInfo } = await AssureurUpload.upload(ICON_LOGO, false);
            iconUrl = `${req.protocol}://${req.get("host")}/uploads/images/${fileInfo.fileName}`;
        }

        const identificationCode = randomInt(100000, 999999);
        const hashedPassword = await bcrypt.hash("12345678", 10);

        const datainsert = await Assureur.create({
            ASSURANCE,
            EMAIL,
            TELEPHONE,
            NIF,
            ADRESSE,
            ID_UTILISATEUR: 1,
            ICON_LOGO: iconUrl,
        });

        const idassureur = datainsert.toJSON().ID_ASSUREUR;
        await Users.create({
            IDENTIFICATION: identificationCode,
            USER_NAME: EMAIL,
            TELEPHONE,
            PASSWORD: hashedPassword,
            PROFIL_ID: 1,
            STATUT: 1,
            ID_ASSURREUR: idassureur,
        });

        console.log('Données insérées avec succès');
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Données créées avec succès",
            result: datainsert,
        });

    } catch (error) {
        console.error('Erreur complète:', error);
        res.status(500).json({
            statusCode: 500,
            httpStatus: "INTERNAL_SERVER_ERROR",
            message: error.message || "Erreur interne du serveur",
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
            ASSURANCE: { required: true },
            EMAIL: { required: true },
            TELEPHONE: { required: true },
            NIF: { required: true },
            ADRESSE: { required: true },
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

        // On récupère les anciennes données
        const assureur = await Assureur.findByPk(ID_ASSUREUR, {
            attributes: ["ICON_LOGO", "ID_ASSUREUR"],
        });

        if (!assureur) {
            return res.status(RESPONSE_CODES.NOT_FOUND).json({
                statusCode: RESPONSE_CODES.NOT_FOUND,
                httpStatus: RESPONSE_STATUS.NOT_FOUND,
                message: "Assureur non trouvé",
            });
        }

        // Upload de la nouvelle image si fournie
        let iconUrl = assureur.ICON_LOGO;

        if (ICON_LOGO) {
            const AssureurUpload = new Assureurpload();
            const { fileInfo } = await AssureurUpload.upload(ICON_LOGO, false);
            iconUrl = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.assureur}/${fileInfo.fileName}`;
        }

        // Mise à jour
        const updateResult = await Assureur.update({
            ASSURANCE,
            EMAIL,
            TELEPHONE,
            NIF,
            ADRESSE,
            ICON_LOGO: iconUrl,
        }, {
            where: { ID_ASSUREUR }
        });

        return res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Données mises à jour avec succès",
            result: updateResult,
        });

    } catch (error) {
        console.log("Erreur lors de la mise à jour :", error);
        return res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
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