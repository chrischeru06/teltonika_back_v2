const express = require("express")
const RESPONSE_CODES = require("../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS")
const { Op, where } = require("sequelize")
const Validation = require("../../class/Validation")
const marque = require("../../models/admin/Marque")
const Assureur = require("../../models/admin/Assureur")
const Assureurpload = require("../../class/uploads/AssureurUpload")
const IMAGES_DESTINATIONS = require("../../constants/IMAGES_DESTINATIONS")
const VehiculeUpload = require("../../class/uploads/vehiculeUpload")
const chauffeur = require("../../models/admin/Chauffeur")
const Syst_zones = require("../../models/admin/Syst_zone")
const Syst_collines = require("../../models/admin/Syst_colline")
const Syst_provinces = require("../../models/admin/Syst_province")
const Syst_communes = require("../../models/admin/Syst_commune")
const ProprietaireUpload = require("../../class/uploads/ProprietaireUplaod")
const Zone_affectation = require("../../models/admin/Zone_affectation_chauffeur")

/**
 * Lister tous les demandes des courses
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author deco257
 */
const findAll = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query
        const defaultSortField = "CHAUFFEUR_ID"
        const defaultSortDirection = "DESC"
        const sortColumns = {
            chauffeur_info: {
                as: "chauffeur_info",
                fields: {
                    CHAUFFEUR_ID: "CHAUFFEUR_ID",
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
            orderColumn = sortColumns.chauffeur_info.fields.CHAUFFEUR_ID
            sortModel = {
                model: 'chauffeur_info',
                as: sortColumns.chauffeur_info
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
        const result = await chauffeur.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            include: [
                {
                    model: Syst_communes,
                    as: 'communeproprio',
                    attributes: ['COMMUNE_ID', 'COMMUNE_NAME'],
                },
                {
                    model: Syst_provinces,
                    as: 'provinceproprio'
                },
                {
                    model: Syst_collines,
                    as: 'collineproprio',
                    attributes: ['COLLINE_ID', 'COLLINE_NAME']
                },
                {
                    model: Syst_zones,
                    as: 'zoneeproprio',
                    attributes: ['ZONE_ID', 'ZONE_NAME']
                },
            ],
            where: {
                ...globalSearchWhereLike,
            },
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des chauffeures",
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
const create_chauffeur = async (req, res) => {
    try {
        const { NOM,
            PRENOM,
            ADRESSE_MAIL,
            ADRESSE_PHYSIQUE,
            NUMERO_TELEPHONE,
            DATE_EXPIRATION_PERMIS,
            DATE_NAISSANCE,
            NUMERO_CARTE_IDENTITE,
            NUMERO_PERMIS,
            PERSONNE_CONTACT_TELEPHONE,
            PROVINCE_ID,
            COMMUNE_ID,
            COLLINE_ID,
            ZONE_ID,
            GENRE_ID
        } = req.body;
        const files = req.files || {};
        const { FILE_PERMIS, PHOTO_PASSPORT, FILE_IDENTITE_COMPLETE, FILE_CASIER_JUDICIAIRE, FILE_CARTE_IDENTITE } = files
        const data = { ...req.files, ...req.body };
        const validation = new Validation(data, {
            // ASSURANCE: {
            //     required: true
            // },

            // EMAIL: {
            //     required: true,
            // }
            // ,
            // TELEPHONE: {
            //     required: true,
            // }
            // ,
            // NIF: {
            //     required: true,
            // },
            // ADRESSE: {
            //     required: true,
            // },
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
        
        const vehiculeUploads = new VehiculeUpload();

        let filename;
        let filename2;
        let filename3;
        let filename4;
        let filename1;
        if (FILE_CARTE_IDENTITE) {
            const { fileInfo: fileInfo } =
                await vehiculeUploads.upload(FILE_CARTE_IDENTITE, false);
            filename = fileInfo;
        }
        if (FILE_IDENTITE_COMPLETE) {

            const { fileInfo: fileInfo1 } =
                await vehiculeUploads.upload(FILE_IDENTITE_COMPLETE, false);
            filename1 = fileInfo1;
        }
        if (FILE_CASIER_JUDICIAIRE) {

            const { fileInfo: fileInfo2 } =
                await vehiculeUploads.upload(FILE_CASIER_JUDICIAIRE, false);
            filename2 = fileInfo2;
        }
        if (FILE_PERMIS) {

            const { fileInfo: fileInfo3 } =
                await vehiculeUploads.upload(FILE_PERMIS, false);
            filename3 = fileInfo3;
        }
        if (PHOTO_PASSPORT) {

            const { fileInfo: fileInfo4 } =
                await vehiculeUploads.upload(FILE_PERMIS, false);
            filename4 = fileInfo4;
        }
      
        // if (FILE_CARTE_IDENTITE) {
        //     const { fileInfo } = await vehiculeUploads.upload(FILE_CARTE_IDENTITE, false);
        //     filename = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.drivers
        //         }/${fileInfo.fileName}`;
        // }
        // if (FILE_IDENTITE_COMPLETE) {
        //     const { fileInfo } = await vehiculeUploads.upload(FILE_IDENTITE_COMPLETE, false);
        //     filename1 = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.drivers
        //         }/${fileInfo.fileName}`;
        // }
        // if (FILE_CASIER_JUDICIAIRE) {
        //     const { fileInfo } = await vehiculeUploads.upload(FILE_CASIER_JUDICIAIRE, false);
        //     filename2 = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.drivers
        //         }/${fileInfo.fileName}`;
        // }
        // if (FILE_PERMIS) {
        //     const { fileInfo } = await vehiculeUploads.upload(FILE_PERMIS, false);
        //     filename3 = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.drivers
        //         }/${fileInfo.fileName}`;
        // }
        // if (PHOTO_PASSPORT) {
        //     const { fileInfo } = await vehiculeUploads.upload(PHOTO_PASSPORT, false);
        //     filename4 = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.drivers
        //         }/${fileInfo.filename}`;
        // }

        const datainsert = await chauffeur.create({
            NOM,
            PRENOM,
            ADRESSE_MAIL,
            ADRESSE_PHYSIQUE,
            NUMERO_TELEPHONE,
            DATE_EXPIRATION_PERMIS,
            DATE_NAISSANCE,
            NUMERO_CARTE_IDENTITE,
            NUMERO_PERMIS,
            PERSONNE_CONTACT_TELEPHONE,
            PROVINCE_ID,
            COMMUNE_ID,
            COLLINE_ID,
            ZONE_ID,
            STATUT_VEHICULE: 1,
            IS_ACTIVE: 2,
            GENRE_ID: GENRE_ID,
            FILE_CARTE_IDENTITE: filename
                ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.drivers
                }/${filename.fileName}`
                : null,
            FILE_IDENTITE_COMPLETE: filename1
                ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.drivers
                }/${filename1.fileName}`
                : null,
            FILE_CASIER_JUDICIAIRE: filename2
                ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.drivers
                }/${filename2.fileName}`
                : null,
            FILE_PERMIS: filename3
                ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.drivers
                }/${filename3.fileName}`
                : null,
            PHOTO_PASSPORT: filename4
                ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.drivers
                }/${filename4.fileName}`
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
        const { CHAUFFEUR_ID } = req.params;
        const { NOM,
            PRENOM,
            ADRESSE_MAIL,
            ADRESSE_PHYSIQUE,
            NUMERO_TELEPHONE,
            DATE_EXPIRATION_PERMIS,
            DATE_NAISSANCE,
            NUMERO_CARTE_IDENTITE,
            NUMERO_PERMIS,
            PERSONNE_CONTACT_TELEPHONE,
            PROVINCE_ID,
            COMMUNE_ID,
            COLLINE_ID,
            ZONE_ID,
            GENRE_ID
        } = req.body;
        const files = req.files || {};
        const { FILE_PERMIS, PHOTO_PASSPORT, FILE_IDENTITE_COMPLETE, FILE_CASIER_JUDICIAIRE, FILE_CARTE_IDENTITE } = files
        const data = { ...req.files, ...req.body };
        const validation = new Validation(data, {
            // ASSURANCE: {
            //     required: true
            // },

            // EMAIL: {
            //     required: true,
            // }
            // ,
            // TELEPHONE: {
            //     required: true,
            // }
            // ,
            // NIF: {
            //     required: true,
            // },
            // ADRESSE: {
            //     required: true,
            // },
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
        const vehiculeUploads = new VehiculeUpload();

        let filename;
        let filename2;
        let filename3;
        let filename4;
        let filename1;
        if (FILE_CARTE_IDENTITE) {
            const { fileInfo: fileInfo } =
                await vehiculeUploads.upload(FILE_CARTE_IDENTITE, false);
            filename = fileInfo;
        }
        if (FILE_IDENTITE_COMPLETE) {

            const { fileInfo: fileInfo1 } =
                await vehiculeUploads.upload(FILE_IDENTITE_COMPLETE, false);
            filename1 = fileInfo1;
        }
        if (FILE_CASIER_JUDICIAIRE) {

            const { fileInfo: fileInfo2 } =
                await vehiculeUploads.upload(FILE_CASIER_JUDICIAIRE, false);
            filename2 = fileInfo2;
        }
        if (FILE_PERMIS) {

            const { fileInfo: fileInfo3 } =
                await vehiculeUploads.upload(FILE_PERMIS, false);
            filename3 = fileInfo3;
        }
        if (PHOTO_PASSPORT) {

            const { fileInfo: fileInfo4 } =
                await vehiculeUploads.upload(FILE_PERMIS, false);
            filename4 = fileInfo4;
        }
        const datainsert = await chauffeur.update({
            NOM,
            PRENOM,
            ADRESSE_MAIL,
            ADRESSE_PHYSIQUE,
            NUMERO_TELEPHONE,
            DATE_EXPIRATION_PERMIS,
            DATE_NAISSANCE,
            NUMERO_CARTE_IDENTITE,
            NUMERO_PERMIS,
            PERSONNE_CONTACT_TELEPHONE,
            PROVINCE_ID,
            COMMUNE_ID,
            COLLINE_ID,
            ZONE_ID,
            GENRE_ID: GENRE_ID,
            FILE_CARTE_IDENTITE: filename
                ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.drivers
                }/${filename.fileName}`
                : null,
            FILE_IDENTITE_COMPLETE: filename1
                ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.drivers
                }/${filename1.fileName}`
                : null,
            FILE_CASIER_JUDICIAIRE: filename2
                ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.drivers
                }/${filename2.fileName}`
                : null,
            FILE_PERMIS: filename3
                ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.drivers
                }/${filename3.fileName}`
                : null,
            PHOTO_PASSPORT: filename4
                ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.drivers
                }/${filename4.fileName}`
                : null,

        },
            {
                where: { CHAUFFEUR_ID: CHAUFFEUR_ID }
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
        await chauffeur.destroy({
            where: {
                CHAUFFEUR_ID: {
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

const findAllbyid = async (req, res) => {
    try {
        const{CHAUFFEUR_ID}=req.params
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query
        const defaultSortField = "CHAUFFEUR_ID"
        const defaultSortDirection = "DESC"
        const sortColumns = {
            chauffeur_info: {
                as: "chauffeur_info",
                fields: {
                    CHAUFFEUR_ID: "CHAUFFEUR_ID",
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
            orderColumn = sortColumns.chauffeur_info.fields.CHAUFFEUR_ID
            sortModel = {
                model: 'chauffeur_info',
                as: sortColumns.chauffeur_info
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
        const result = await chauffeur.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            include: [
                {
                    model: Syst_communes,
                    as: 'communeproprio',
                    attributes: ['COMMUNE_ID', 'COMMUNE_NAME'],
                },
                {
                    model: Syst_provinces,
                    as: 'provinceproprio'
                },
                {
                    model: Syst_collines,
                    as: 'collineproprio',
                    attributes: ['COLLINE_ID', 'COLLINE_NAME']
                },
                {
                    model: Syst_zones,
                    as: 'zoneeproprio',
                    attributes: ['ZONE_ID', 'ZONE_NAME']
                },
            ],

            where: {
                CHAUFFEUR_ID:CHAUFFEUR_ID,
                ...globalSearchWhereLike,
            },
        })

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des chauffeures",
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

const findAllzone = async (req, res) => {
    try {
        const{CHAUFFEUR_ID}=req.params
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query
        const defaultSortField = "CHAUFFEUR_ID"
        const defaultSortDirection = "DESC"
        const sortColumns = {
            chauffeur_info: {
                as: "chauffeur_info",
                fields: {
                    CHAUFFEUR_ID: "CHAUFFEUR_ID",
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
            orderColumn = sortColumns.chauffeur_info.fields.CHAUFFEUR_ID
            sortModel = {
                model: 'chauffeur_info',
                as: sortColumns.chauffeur_info
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
        const result = await Zone_affectation.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            where: {
                CHAUFFEUR_ID:CHAUFFEUR_ID,
                ...globalSearchWhereLike,
            },
        })

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des chauffeures",
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
module.exports = {
    findAll,
    create_chauffeur,
    update_assureur,
    deleteItems,
    findAllbyid,
    findAllzone
}