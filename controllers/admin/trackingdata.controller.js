const express = require("express")
const fs = require("fs");

const RESPONSE_CODES = require("../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS")
const { Op} = require("sequelize")
const Validation = require("../../class/Validation")
const marque = require("../../models/admin/Marque")
const data_tracking = require("../../models/admin/Data_tracking")
const Vehicules = require("../../models/admin/Vehicules")
const chauffeur = require("../../models/admin/Chauffeur")
const Zone_affectation = require("../../models/admin/Zone_affectation_chauffeur")
const model_vehicule = require("../../models/admin/Model")
const path = require("path");


/**
 * Lister tous les demandes des marques
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author deco257
 */
const findAll = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query
        const defaultSortDirection = "DESC"
        const sortColumns = {
            marque_vehicule: {
                as: "marque_vehicule",
                fields: {
                    ID_MARQUE: "ID_MARQUE",
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
            orderColumn = sortColumns.marque_vehicule.fields.ID_MARQUE
            sortModel = {
                model: 'marque_vehicule',
                as: sortColumns.marque_vehicule
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
        const result = await marque.findAndCountAll({
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
            message: "Liste des marques des voitures",
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

const findtrackingbyimei = async (req, res) => {
    try {
        const { imei } = req.query; // Récupérer l'IMEI depuis les paramètres de la requête
        console.log("IMEI recherché:", imei); // Log de l'IMEI

        // Validation de l'IMEI
        if (!imei) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                message: "IMEI requis."
            });
        }

        // Requête pour trouver les données
        const result = await data_tracking.findAndCountAll({
            where: {
                data_json: {
                    [Op.like]: `%\"imei\":\"${imei}\"%` // Recherche avec Op.like
                }
            }
        });

          console.log("Résultat de la requête:", result); // Log des résultats

        if (result.count === 0) {
            return res.status(RESPONSE_CODES.NOT_FOUND).json({
                statusCode: RESPONSE_CODES.NOT_FOUND,
                message: "Aucune donnée trouvée pour cet IMEI."
            });
        }

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Historique tracking",
            result: {
                data: result.rows,
                totalRecords: result.count,
            }
        });
    } catch (error) {
        console.log(error);
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayez plus tard.",
        });
    }
};
// const findallcartruck = async (req, res) => {
//     try {
//         const result = await data_tracking.findAndCountAll({});
        
//         // Vérifiez si les données existent dans result.rows
//         if (!result || !result.rows || result.rows.length === 0) {
//             return res.status(RESPONSE_CODES.NOT_FOUND).json({
//                 statusCode: RESPONSE_CODES.NOT_FOUND,
//                 httpStatus: RESPONSE_STATUS.NOT_FOUND,
//                 message: "Aucune donnée trouvée.",
//             });
//         }

//         const vehicules = result.rows;

//         // Extraire les IMEIs et les chemins des fichiers
//         const trackingData = vehicules.map(v => {
//             if (v.dataValues && v.dataValues.file_path) {
//                 return {
//                     imei: v.dataValues.imei, // Assurez-vous que l'IMEI est dans vos données
//                     filePath: v.dataValues.file_path
//                 };
//             }
//             return null;
//         }).filter(data => data !== null); // Filtrez les valeurs nulles

//         // Récupérer les véhicules correspondants
//         const imeis = trackingData.map(data => data.imei);
//         const vehiculeData = await Vehicules.findAll({
//             where: { CODE: imeis },
//             include: [
//                 {
//                     model: marque,
//                     as: 'marques'
//                 },
//                 {
//                     model: model_vehicule,
//                     as: 'modele'
//                 }
//             ]
//         });

//         // Lire les fichiers et assembler les résultats
//         const results = [];
//         for (const data of trackingData) {
//             const fullPath = path.join(TRACKING_FILES_DIR, data.filePath);
//             if (fs.existsSync(fullPath)) {
//                 const fileContent = fs.readFileSync(fullPath, 'utf-8');
//                 const jsonContent = JSON.parse(fileContent); // Parsez le contenu JSON

//                 // Trouver le véhicule correspondant
//                 const vehicule = vehiculeData.find(v => v.CODE === data.imei);
//                 const chauffeurers = await Zone_affectation.findAndCountAll({
//                     include: {
//                         model: chauffeur,
//                         as: 'chauffeur'
//                     },
//                     where: {
//                         VEHICULE_ID: vehicule ? vehicule.VEHICULE_ID : null
//                     }
//                 });

//                 results.push({
//                     imei: data.imei,
//                     fileData: jsonContent,
//                     vehicule,
//                     chauffeurs: chauffeurers
//                 });
//             } else {
//                 console.warn(`Fichier non trouvé pour l'IMEI: ${data.imei}`);
//             }
//         }

//         res.status(RESPONSE_CODES.OK).json({
//             statusCode: RESPONSE_CODES.OK,
//             httpStatus: RESPONSE_STATUS.OK,
//             message: "Historique tracking",
//             result: results
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
//             statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
//             httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
//             message: "Erreur interne du serveur, réessayez plus tard.",
//         });
//     }
// };
const findallcartruck = async (req, res) => {
    try {
        // Obtenir la date du jour actuel
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

        // Récupérer seulement les données du jour actuel
        const result = await data_tracking.findAndCountAll({
            where: {
                created_at: {
                    [Op.gte]: startOfDay,
                    [Op.lte]: endOfDay
                }
            }
        });

        // Vérifiez si les données existent dans result.rows
        // if (!result || !result.rows || result.rows.length === 0) {
        //     return res.status(RESPONSE_CODES.NOT_FOUND).json({
        //         statusCode: RESPONSE_CODES.NOT_FOUND,
        //         httpStatus: RESPONSE_STATUS.NOT_FOUND,
        //         message: "Aucune donnée trouvée pour aujourd'hui.",
        //     });
        // }

        const vehicules = result.rows;

        // Extraire les IMEIs et les chemins des fichiers
        const trackingData = vehicules.map(v => {
            if (v.dataValues && v.dataValues.file_path) {
                return {
                    imei: v.dataValues.imei,
                    filePath: v.dataValues.file_path,
                    createdAt: v.dataValues.created_at
                };
            }
            return null;
        }).filter(data => data !== null); // Filtrez les valeurs nulles

        // Récupérer les véhicules correspondants
        const imeis = trackingData.map(data => data.imei);
        const vehiculeData = await Vehicules.findAll({
            where: { CODE: imeis },
            include: [
                {
                    model: marque,
                    as: 'marques'
                },
                {
                    model: model_vehicule,
                    as: 'modele'
                }
            ]
        });

        // Lire les fichiers et assembler les résultats
        const results = [];
        for (const data of trackingData) {
            const fullPath = path.join(TRACKING_FILES_DIR, data.filePath);
            if (fs.existsSync(fullPath)) {
                const fileContent = fs.readFileSync(fullPath, 'utf-8');
                const jsonContent = JSON.parse(fileContent);

                // Trouver le véhicule correspondant
                const vehicule = vehiculeData.find(v => v.CODE === data.imei);
                const chauffeurers = await Zone_affectation.findAndCountAll({
                    include: {
                        model: chauffeur,
                        as: 'chauffeur'
                    },
                    where: {
                        VEHICULE_ID: vehicule ? vehicule.VEHICULE_ID : null
                    }
                });

                results.push({
                    imei: data.imei,
                    fileData: jsonContent,
                    vehicule,
                    chauffeurs: chauffeurers,
                    date_tracking: data.createdAt
                });
            } else {
                console.warn(`Fichier non trouvé pour l'IMEI: ${data.imei}`);
            }
        }

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Historique tracking du jour actuel",
            result: results,
            total: results.length
        });
    } catch (error) {
        console.log(error);
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayez plus tard.",
        });
    }
};
const findallcartruckbyimei = async (req, res) => {
    try {
        const{imei}=req.params
        const result = await data_tracking.findAndCountAll({
            where:{
                imei:imei
            }
        });
        
        // Vérifiez si les données existent dans result.rows
        if (!result || !result.rows || result.rows.length === 0) {
            return res.status(RESPONSE_CODES.NOT_FOUND).json({
                statusCode: RESPONSE_CODES.NOT_FOUND,
                httpStatus: RESPONSE_STATUS.NOT_FOUND,
                message: "Aucune donnée trouvée.",
            });
        }

        const vehicules = result.rows;

        // Extraire les IMEIs et les chemins des fichiers
        const trackingData = vehicules.map(v => {
            if (v.dataValues && v.dataValues.file_path) {
                return {
                    imei: v.dataValues.imei, // Assurez-vous que l'IMEI est dans vos données
                    filePath: v.dataValues.file_path
                };
            }
            return null;
        }).filter(data => data !== null); // Filtrez les valeurs nulles

        // Récupérer les véhicules correspondants
        const imeis = trackingData.map(data => data.imei);
        const vehiculeData = await Vehicules.findAll({
            where: { CODE: imeis },
            include: [
                {
                    model: marque,
                    as: 'marques'
                },
                {
                    model: model_vehicule,
                    as: 'modele'
                }
            ]
        });

        // Lire les fichiers et assembler les résultats
        const results = [];
        for (const data of trackingData) {
            const fullPath = path.join(TRACKING_FILES_DIR, data.filePath);
            if (fs.existsSync(fullPath)) {
                const fileContent = fs.readFileSync(fullPath, 'utf-8');
                const jsonContent = JSON.parse(fileContent); // Parsez le contenu JSON

                // Trouver le véhicule correspondant
                const vehicule = vehiculeData.find(v => v.CODE === data.imei);
                const chauffeurers = await Zone_affectation.findAndCountAll({
                    include: {
                        model: chauffeur,
                        as: 'chauffeur'
                    },
                    where: {
                        VEHICULE_ID: vehicule ? vehicule.VEHICULE_ID : null
                    }
                });

                results.push({
                    imei: data.imei,
                    fileData: jsonContent,
                    vehicule,
                    chauffeurs: chauffeurers
                });
            } else {
                console.warn(`Fichier non trouvé pour l'IMEI: ${data.imei}`);
            }
        }

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Historique tracking",
            result: results
        });
    } catch (error) {
        console.log(error);
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayez plus tard.",
        });
    }
};
/**
 * Permet de creer le modele de la voiture
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author deco257
 * @date 31/3/2025
 */

const updateMarque = async (req, res) => {
    try {
        const { ID_MARQUE } = req.params
        const { latitude } = req.body;
        const data = { ...req.body };
        const validation = new Validation(data, {
            latitude: {
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

        const datainsert = await marque.update({
            latitude,
        }, {
            where: {
                ID_MARQUE: ID_MARQUE
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
        await marque.destroy({
            where: {
                ID_MARQUE: {
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

const TRACKING_FILES_DIR = path.join(__dirname, '../../tracking_files');

// S'assurer que le répertoire existe
if (!fs.existsSync(TRACKING_FILES_DIR)) {
    fs.mkdirSync(TRACKING_FILES_DIR, { recursive: true });
}

const createtrucking = async (req, res) => {
    try {
        const { imei, route } = req.body; // Récupérer imei et route depuis le corps de la requête
        // Validation
        const validation = new Validation(req.body, {
            imei: {
                required: true,
            },
            route: {
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

        // Créer un timestamp unique pour le nom de fichier
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `${imei}_${timestamp}.json`;
        
        // Créer un sous-répertoire pour l'IMEI si nécessaire
        const imeiDir = path.join(TRACKING_FILES_DIR, imei);
        if (!fs.existsSync(imeiDir)) {
            fs.mkdirSync(imeiDir, { recursive: true });
        }
        
        // Chemin complet du fichier
        const filePath = path.join(imeiDir, filename);
        
        // Données à écrire dans le fichier
        const fileData = {
            imei,
            route,
            created_at: new Date().toISOString()
        };
        
        // Écrire dans le fichier
        fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
        
        // Chemin relatif pour stocker dans la base de données
        const relativeFilePath = path.join(imei, filename).replace(/\\/g, '/');
        
        // Insérer le chemin du fichier dans la base de données au lieu des données JSON
        await data_tracking.create({
            imei,
            file_path: relativeFilePath,
            // data_json: null // Si vous voulez explicitement définir data_json à null
        });

        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Fichier de trajet créé avec succès",
            filePath: relativeFilePath
        });
    } catch (error) {
        console.error("Erreur lors de la création du fichier de trajet:", error);
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayez plus tard",
        });
    }
};
const createtrucking2 = async (req, res) => {
    try {
        const { imei, route } = req.body; // Retrieve imei and route from request body

        // Validation
        const validation = new Validation(req.body, {
            imei: { required: true },
            route: { required: true },
        });

        await validation.run();
        const isValid = await validation.isValidate();
        if (!isValid) {
            const errors = await validation.getErrors();
            return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
                statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
                httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
                message: "Data validation issue",
                result: errors,
            });
        }

        // Create a unique timestamp for the filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `${imei}_${timestamp}.geojson`;

        // Create a subdirectory for the IMEI if necessary
        const imeiDir = path.join(TRACKING_FILES_DIR, imei);
        if (!fs.existsSync(imeiDir)) {
            fs.mkdirSync(imeiDir, { recursive: true });
        }

        // Full file path
        const filePath = path.join(imeiDir, filename);
        
        // Prepare GeoJSON data
        const geoJsonData = {
            type: "FeatureCollection",
            features: route.map(point => ({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [point.longitude, point.latitude]
                },
                properties: {
                    altitude: point.altitude,
                    angle: point.angle,
                    satellites: point.satellites,
                    speed: point.speed,
                    timestamp: point.timestamp,
                    ignition: point.ignition
                }
            }))
        };

        // Write GeoJSON data to file
        fs.writeFileSync(filePath, JSON.stringify(geoJsonData, null, 2));
        
        // Relative file path for database storage
        const relativeFilePath = path.join(imei, filename).replace(/\\/g, '/');
        
        // Insert the file path into the database
        await data_tracking.create({
            imei,
            file_path: relativeFilePath,
        });

        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Route file created successfully",
            filePath: relativeFilePath
        });
    } catch (error) {
        console.error("Error creating route file:", error);
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Internal server error, please try again later",
        });
    }
};
// Ajouter cette nouvelle fonction pour récupérer le contenu des fichiers
const getTrackingFile = async (req, res) => {
    try {
        const { path: filePath } = req.query;
        
        if (!filePath) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                httpStatus: RESPONSE_STATUS.BAD_REQUEST,
                message: "Chemin de fichier non spécifié"
            });
        }
        
        // Construire le chemin complet (en sécurisant contre les attaques de traversée)
        const fullPath = path.join(TRACKING_FILES_DIR, filePath);
        
        // Vérifier que le chemin est bien dans le répertoire des fichiers de tracking
        if (!fullPath.startsWith(TRACKING_FILES_DIR)) {
            return res.status(RESPONSE_CODES.FORBIDDEN).json({
                statusCode: RESPONSE_CODES.FORBIDDEN,
                httpStatus: RESPONSE_STATUS.FORBIDDEN,
                message: "Accès au fichier non autorisé"
            });
        }
        
        // Vérifier si le fichier existe
        if (!fs.existsSync(fullPath)) {
            return res.status(RESPONSE_CODES.NOT_FOUND).json({
                statusCode: RESPONSE_CODES.NOT_FOUND,
                httpStatus: RESPONSE_STATUS.NOT_FOUND,
                message: "Fichier non trouvé"
            });
        }
        
        // Lire le contenu du fichier
        const fileContent = fs.readFileSync(fullPath, 'utf-8');
        const jsonContent = JSON.parse(fileContent);
        
        return res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Contenu du fichier récupéré avec succès",
            ...jsonContent
        });
    } catch (error) {
        console.error("Erreur lors de la récupération du fichier:", error);
        return res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayez plus tard",
        });
    }
};

const getHistorique = async (req, res) => {
    try {
        const { imei } = req.query;
        
        if (!imei) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                statusCode: RESPONSE_CODES.BAD_REQUEST,
                httpStatus: RESPONSE_STATUS.BAD_REQUEST,
                message: "IMEI non spécifié"
            });
        }
        
        // Récupérer les enregistrements de tracking pour cet IMEI
        const trackingData = await data_tracking.findAll({
            where: { imei },
            order: [['created_at', 'DESC']]
        });
        
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Historique des trajets récupéré avec succès",
            result: {
                data: trackingData
            }
        });
    } catch (error) {
        console.error("Erreur lors de la récupération de l'historique des trajets:", error);
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayez plus tard",
        });
    }
};
module.exports = {
    findAll,
    createtrucking,
    createtrucking2,
    updateMarque,
    deleteItems,
    findtrackingbyimei,
    findallcartruck,
    findallcartruckbyimei,
    getTrackingFile,
    getHistorique
}