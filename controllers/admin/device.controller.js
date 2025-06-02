const express = require("express")
const RESPONSE_CODES = require("../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS")
const { Op,Sequelize } = require("sequelize")
const Validation = require("../../class/Validation")
const profiles = require("../../models/admin/Profils")
const device = require("../../models/admin/Device")
const operateur_resau = require("../../models/admin/Operateur_resau")
const Vehicules = require("../../models/admin/Vehicules")
const Proprietaire = require("../../models/admin/Proprietaire")
const marque = require("../../models/admin/Marque")
const model_vehicule = require("../../models/admin/Model")

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
         device_info: {
            as: "device_info",
            fields: {
               DEVICE_ID: "DEVICE_ID",
            },
         },
      }
      var orderColumn, orderDirection
      // sorting
      var sortModel
      if (sortField) {
         for (let key in sortColumns) {
            if (sortColumns[key].fields.hasOwnProperty(sortField)) {
               sortModel = {
                  model: key,
                  as: sortColumns[key].as,
               }
               orderColumn = sortColumns[key].fields[sortField]
               break
            }
         }
      }
      if (!orderColumn || !sortModel) {
         orderColumn = sortColumns.device_info.fields.DEVICE_ID
         sortModel = {
            model: "device_info",
            as: sortColumns.device_info,
         }
      }
      // ordering
      if (sortOrder == 1) {
         orderDirection = "ASC"
      } else if (sortOrder == -1) {
         orderDirection = "DESC"
      } else {
         orderDirection = defaultSortDirection
      }

      // searching
      const globalSearchColumns = [""]
      var globalSearchWhereLike = {}
      if (search && search.trim() != "") {
         const searchWildCard = {}
         globalSearchColumns.forEach((column) => {
            searchWildCard[column] = {
               [Op.substring]: search,
            }
         })
         globalSearchWhereLike = {
            [Op.or]: searchWildCard,
         }
      }
      const result = await device.findAndCountAll({
         limit: parseInt(rows),
         offset: parseInt(first),
         order: [[sortModel, orderColumn, orderDirection]],
         where: {
            ...globalSearchWhereLike,
         },
         include: [
            {
               model: operateur_resau,
               as: "operateur",
            },
            {
               model: Vehicules,
               as: "vehicule",
               include: [
                  { model: Proprietaire, as: "proprietaire" },
                  {
                     model: marque,
                     as: "marques",
                  },
                  {
                     model: model_vehicule,
                     as: "modele",
                  },
               ],
            },
         ],
      })
      res.status(RESPONSE_CODES.OK).json({
         statusCode: RESPONSE_CODES.OK,
         httpStatus: RESPONSE_STATUS.OK,
         message: "Liste des devices",
         result: {
            data: result.rows,
            // totalRecords: result.count
            totalRecords: result.rows.length,
         },
      })
   } catch (error) {
      console.log(error)
      res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
         statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
         httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
         message: "Erreur interne du serveur, réessayer plus tard",
      })
   }
}
/**
 * Permet de creer le modele de la voiture
 * @param {express.Request} req
 * @param {express.Response} res
 * @author deco257
 * @date 31/3/2025
 */
const createDevice = async (req, res) => {
   try {
      const { CODE, VEHICULE_ID, DATE_INSTALL, OPERATEUR_ID, NUMERO, DATE_ACTIVE_MEGA, DATE_EXPIRE_MEGA } = req.body
      const data = { ...req.body }
      const validation = new Validation(data, {
         //  DESCRIPTION_PROFIL: {
         //     required: true,
         //  },
      })

      await validation.run()
      const isValid = await validation.isValidate()
      if (!isValid) {
         const errors = await validation.getErrors()
         return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
            statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
            httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
            message: "Problème de validation des données",
            result: errors,
         })
      }

      const datainsert = await device.create({
         CODE,
         VEHICULE_ID,
         DATE_INSTALL,
         OPERATEUR_ID,
         NUMERO,
         DATE_ACTIVE_MEGA,
         DATE_EXPIRE_MEGA,
         IS_ACTIVE: 1,
      })

      res.status(RESPONSE_CODES.CREATED).json({
         statusCode: RESPONSE_CODES.CREATED,
         httpStatus: RESPONSE_STATUS.CREATED,
         message: "donnee creer avec success",
         result: datainsert,
      })
   } catch (error) {
      console.log(error)
      res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
         statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
         httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
         message: "Erreur interne du serveur, réessayez plus tard",
      })
   }
}

const updateDevice = async (req, res) => {
   try {
      const { DEVICE_ID } = req.params
      const { CODE, VEHICULE_ID, DATE_INSTALL, OPERATEUR_ID, NUMERO, DATE_ACTIVE_MEGA, DATE_EXPIRE_MEGA } = req.body
      const data = { ...req.body }
      const validation = new Validation(data, {
         //  DESCRIPTION_PROFIL: {
         //     required: true,
         //  },
      })

      await validation.run()
      const isValid = await validation.isValidate()
      if (!isValid) {
         const errors = await validation.getErrors()
         return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
            statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
            httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
            message: "Problème de validation des données",
            result: errors,
         })
      }

      const datainsert = await device.update(
         {
            CODE,
            VEHICULE_ID,
            DATE_INSTALL,
            OPERATEUR_ID,
            NUMERO,
            DATE_ACTIVE_MEGA,
            DATE_EXPIRE_MEGA,
         },
         {
            where: {
               DEVICE_ID: DEVICE_ID,
            },
         },
      )

      res.status(RESPONSE_CODES.CREATED).json({
         statusCode: RESPONSE_CODES.CREATED,
         httpStatus: RESPONSE_STATUS.CREATED,
         message: "donnee creer avec success",
         result: datainsert,
      })
   } catch (error) {
      console.log(error)
      res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
         statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
         httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
         message: "Erreur interne du serveur, réessayez plus tard",
      })
   }
}
const deleteItems = async (req, res) => {
   try {
      const { ids } = req.body
      const itemsIds = JSON.parse(ids)
      await device.destroy({
         where: {
            DEVICEID: {
               [Op.in]: itemsIds,
            },
         },
      })
      res.status(RESPONSE_CODES.OK).json({
         statusCode: RESPONSE_CODES.OK,
         httpStatus: RESPONSE_STATUS.OK,
         message: "Les elements ont ete supprimer avec success",
      })
   } catch (error) {
      console.log(error)
      res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
         statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
         httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
         message: "Erreur interne du serveur, réessayer plus tard",
      })
   }
}
const fetch_imeidataexpired = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query
        const defaultSortDirection = "DESC"
        const sortColumns = {
            device_info: {
                as: "device_info",
                fields: {
                    DEVICE_ID: "DEVICE_ID",
                },
            },
        }
        
        var orderColumn, orderDirection
        // sorting
        var sortModel
        if (sortField) {
            for (let key in sortColumns) {
                if (sortColumns[key].fields.hasOwnProperty(sortField)) {
                    sortModel = {
                        model: key,
                        as: sortColumns[key].as,
                    }
                    orderColumn = sortColumns[key].fields[sortField]
                    break
                }
            }
        }
        if (!orderColumn || !sortModel) {
            orderColumn = sortColumns.device_info.fields.DEVICE_ID
            sortModel = {
                model: "device_info",
                as: sortColumns.device_info.as,
            }
        }
        
        // ordering
        if (sortOrder == 1) {
            orderDirection = "ASC"
        } else if (sortOrder == -1) {
            orderDirection = "DESC"
        } else {
            orderDirection = defaultSortDirection
        }

        // searching
        const globalSearchColumns = ["DEVICE_ID"] // Ajout d'une colonne de recherche valide
        var globalSearchWhereLike = {}
        if (search && search.trim() != "") {
            const searchWildCard = {}
            globalSearchColumns.forEach((column) => {
                searchWildCard[column] = {
                    [Op.substring]: search,
                }
            })
            globalSearchWhereLike = {
                [Op.or]: searchWildCard,
            }
        }

        // Condition pour filtrer les IMEI avec moins de 30 jours entre les dates
        const dateCondition = {
            [Op.and]: [
                // Vérifier que les deux dates existent
                { DATE_ACTIVE_MEGA: { [Op.ne]: null } },
                { DATE_EXPIRE_MEGA: { [Op.ne]: null } },
                // Calculer la différence en jours (moins de 30 jours)
                Sequelize.where(
                    Sequelize.fn('DATEDIFF', 
                        Sequelize.col('DATE_EXPIRE_MEGA'), 
                        Sequelize.col('DATE_ACTIVE_MEGA')
                    ),
                    { [Op.lt]: 30 }
                )
            ]
        }

        const result = await device.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [[sortModel, orderColumn, orderDirection]],
            where: {
                ...globalSearchWhereLike,
                ...dateCondition
            },
            include: [
                {
                    model: operateur_resau,
                    as: "operateur",
                },
                {
                    model: Vehicules,
                    as: "vehicule",
                    include: [
                        { model: Proprietaire, as: "proprietaire" },
                        {
                            model: marque,
                            as: "marques",
                        },
                        {
                            model: model_vehicule,
                            as: "modele",
                        },
                    ],
                },
            ],
        })
        
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des devices avec moins de 30 jours entre les dates",
            result: {
                data: result.rows,
                totalRecords: result.count
            },
        })
    } catch (error) {
        console.log(error)
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayer plus tard",
        })
    }
}
const imeiproche30jours = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query
        const defaultSortDirection = "ASC"
        const sortColumns = {
            device_info: {
                as: "device_info",
                fields: {
                    DEVICE_ID: "DEVICE_ID",
                    DATE_ACTIVE_MEGA: "DATE_ACTIVE_MEGA",
                    DATE_EXPIRE_MEGA: "DATE_EXPIRE_MEGA",
                },
            },
        }
        
        var orderColumn, orderDirection
        // sorting
        var sortModel
        if (sortField) {
            for (let key in sortColumns) {
                if (sortColumns[key].fields.hasOwnProperty(sortField)) {
                    sortModel = {
                        model: key,
                        as: sortColumns[key].as,
                    }
                    orderColumn = sortColumns[key].fields[sortField]
                    break
                }
            }
        }
        if (!orderColumn || !sortModel) {
            orderColumn = sortColumns.device_info.fields.DATE_ACTIVE_MEGA
            sortModel = {
                model: "device_info",
                as: sortColumns.device_info.as,
            }
        }
        
        // ordering
        if (sortOrder == 1) {
            orderDirection = "ASC"
        } else if (sortOrder == -1) {
            orderDirection = "DESC"
        } else {
            orderDirection = defaultSortDirection
        }

        // searching
        const globalSearchColumns = ["DEVICE_ID"]
        var globalSearchWhereLike = {}
        if (search && search.trim() != "") {
            const searchWildCard = {}
            globalSearchColumns.forEach((column) => {
                searchWildCard[column] = {
                    [Op.substring]: search,
                }
            })
            globalSearchWhereLike = {
                [Op.or]: searchWildCard,
            }
        }

        // Version debug - afficher tous les IMEI actifs pour voir les données
        const dateCondition = {
            [Op.and]: [
                // Vérifier que les deux dates existent
                { DATE_ACTIVE_MEGA: { [Op.ne]: null } },
                { DATE_EXPIRE_MEGA: { [Op.ne]: null } },
                // La date d'activation doit être dans le passé
                { DATE_ACTIVE_MEGA: { [Op.lt]: new Date() } },
                // La date d'expiration doit être dans le futur
                { DATE_EXPIRE_MEGA: { [Op.gt]: new Date() } }
                // Commenté temporairement pour debug
                // Calculer les jours écoulés depuis l'activation (entre 20 et 30 jours pour être "proche")
                // Sequelize.where(
                //     Sequelize.fn('DATEDIFF', 
                //         Sequelize.fn('NOW'),
                //         Sequelize.col('DATE_ACTIVE_MEGA')
                //     ),
                //     { [Op.between]: [20, 30] }
                // )
            ]
        }

        const result = await device.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [[sortModel, orderColumn, orderDirection]],
            where: {
                ...globalSearchWhereLike,
                ...dateCondition
            },
            include: [
                {
                    model: operateur_resau,
                    as: "operateur",
                },
                {
                    model: Vehicules,
                    as: "vehicule",
                    include: [
                        { model: Proprietaire, as: "proprietaire" },
                        {
                            model: marque,
                            as: "marques",
                        },
                        {
                            model: model_vehicule,
                            as: "modele",
                        },
                    ],
                },
            ],
            // Ajouter des attributs calculés
            attributes: {
                include: [
                    [
                        Sequelize.fn('DATEDIFF', 
                            Sequelize.fn('NOW'),
                            Sequelize.col('DATE_ACTIVE_MEGA')
                        ),
                        'jours_depuis_activation'
                    ],
                    [
                        Sequelize.fn('DATEDIFF', 
                            Sequelize.col('DATE_EXPIRE_MEGA'), 
                            Sequelize.col('DATE_ACTIVE_MEGA')
                        ),
                        'duree_totale_jours'
                    ],
                    [
                        Sequelize.fn('DATEDIFF', 
                            Sequelize.col('DATE_EXPIRE_MEGA'), 
                            Sequelize.fn('NOW')
                        ),
                        'jours_restants_avant_expiration'
                    ],
                    [
                        Sequelize.literal('30 - DATEDIFF(NOW(), DATE_ACTIVE_MEGA)'),
                        'jours_restants_avant_30'
                    ]
                ]
            }
        })
        
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Debug - Tous les IMEI actifs avec calcul des jours",
            result: {
                data: result.rows,
                totalRecords: result.count
            },
        })
    } catch (error) {
        console.log(error)
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayer plus tard",
        })
    }
}
const imeidepasse30jours = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query
        const defaultSortDirection = "DESC"
        const sortColumns = {
            device_info: {
                as: "device_info",
                fields: {
                    DEVICE_ID: "DEVICE_ID",
                    DATE_ACTIVE_MEGA: "DATE_ACTIVE_MEGA",
                    DATE_EXPIRE_MEGA: "DATE_EXPIRE_MEGA",
                },
            },
        }
        
        var orderColumn, orderDirection
        // sorting
        var sortModel
        if (sortField) {
            for (let key in sortColumns) {
                if (sortColumns[key].fields.hasOwnProperty(sortField)) {
                    sortModel = {
                        model: key,
                        as: sortColumns[key].as,
                    }
                    orderColumn = sortColumns[key].fields[sortField]
                    break
                }
            }
        }
        if (!orderColumn || !sortModel) {
            orderColumn = sortColumns.device_info.fields.DATE_EXPIRE_MEGA
            sortModel = {
                model: "device_info",
                as: sortColumns.device_info.as,
            }
        }
        
        // ordering
        if (sortOrder == 1) {
            orderDirection = "ASC"
        } else if (sortOrder == -1) {
            orderDirection = "DESC"
        } else {
            orderDirection = defaultSortDirection // Tri par date d'expiration décroissante par défaut
        }

        // searching
        const globalSearchColumns = ["DEVICE_ID"]
        var globalSearchWhereLike = {}
        if (search && search.trim() != "") {
            const searchWildCard = {}
            globalSearchColumns.forEach((column) => {
                searchWildCard[column] = {
                    [Op.substring]: search,
                }
            })
            globalSearchWhereLike = {
                [Op.or]: searchWildCard,
            }
        }

        // Condition pour filtrer les IMEI qui ont dépassé 30 jours depuis l'activation
        // ET qui ont dépassé leur date d'expiration
        const dateCondition = {
            [Op.and]: [
                // Vérifier que les deux dates existent
                { DATE_ACTIVE_MEGA: { [Op.ne]: null } },
                { DATE_EXPIRE_MEGA: { [Op.ne]: null } },
                // La date d'expiration doit être dans le passé (déjà expirée)
                { DATE_EXPIRE_MEGA: { [Op.lt]: new Date() } },
                // Les jours depuis l'activation doivent être > 30 jours
                Sequelize.where(
                    Sequelize.fn('DATEDIFF', 
                        Sequelize.fn('NOW'),
                        Sequelize.col('DATE_ACTIVE_MEGA')
                    ),
                    { [Op.gt]: 30 }
                )
            ]
        }

        const result = await device.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [[sortModel, orderColumn, orderDirection]],
            where: {
                ...globalSearchWhereLike,
                ...dateCondition
            },
            include: [
                {
                    model: operateur_resau,
                    as: "operateur",
                },
                {
                    model: Vehicules,
                    as: "vehicule",
                    include: [
                        { model: Proprietaire, as: "proprietaire" },
                        {
                            model: marque,
                            as: "marques",
                        },
                        {
                            model: model_vehicule,
                            as: "modele",
                        },
                    ],
                },
            ],
            // Ajouter des attributs calculés
            attributes: {
                include: [
                    [
                        Sequelize.fn('DATEDIFF', 
                            Sequelize.fn('NOW'),
                            Sequelize.col('DATE_ACTIVE_MEGA')
                        ),
                        'jours_depuis_activation'
                    ],
                    [
                        Sequelize.fn('DATEDIFF', 
                            Sequelize.fn('NOW'),
                            Sequelize.col('DATE_EXPIRE_MEGA')
                        ),
                        'jours_depuis_expiration'
                    ],
                    [
                        Sequelize.fn('DATEDIFF', 
                            Sequelize.col('DATE_EXPIRE_MEGA'), 
                            Sequelize.col('DATE_ACTIVE_MEGA')
                        ),
                        'duree_totale_activation_expiration'
                    ],
                    [
                        Sequelize.literal('DATEDIFF(NOW(), DATE_ACTIVE_MEGA) - 30'),
                        'jours_depassement_30'
                    ]
                ]
            }
        })
        
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des IMEI qui ont dépassé 30 jours d'activation et leur date d'expiration",
            result: {
                data: result.rows,
                totalRecords: result.count
            },
        })
    } catch (error) {
        console.log(error)
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayer plus tard",
        })
    }
}
const imeimoins30jours = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query
        const defaultSortDirection = "ASC"
        const sortColumns = {
            device_info: {
                as: "device_info",
                fields: {
                    DEVICE_ID: "DEVICE_ID",
                    DATE_ACTIVE_MEGA: "DATE_ACTIVE_MEGA",
                    DATE_EXPIRE_MEGA: "DATE_EXPIRE_MEGA",
                },
            },
        }
        
        var orderColumn, orderDirection
        // sorting
        var sortModel
        if (sortField) {
            for (let key in sortColumns) {
                if (sortColumns[key].fields.hasOwnProperty(sortField)) {
                    sortModel = {
                        model: key,
                        as: sortColumns[key].as,
                    }
                    orderColumn = sortColumns[key].fields[sortField]
                    break
                }
            }
        }
        if (!orderColumn || !sortModel) {
            orderColumn = sortColumns.device_info.fields.DATE_ACTIVE_MEGA
            sortModel = {
                model: "device_info",
                as: sortColumns.device_info.as,
            }
        }
        
        // ordering
        if (sortOrder == 1) {
            orderDirection = "ASC"
        } else if (sortOrder == -1) {
            orderDirection = "DESC"
        } else {
            orderDirection = defaultSortDirection // Tri par date d'activation croissante par défaut
        }

        // searching
        const globalSearchColumns = ["DEVICE_ID"]
        var globalSearchWhereLike = {}
        if (search && search.trim() != "") {
            const searchWildCard = {}
            globalSearchColumns.forEach((column) => {
                searchWildCard[column] = {
                    [Op.substring]: search,
                }
            })
            globalSearchWhereLike = {
                [Op.or]: searchWildCard,
            }
        }

        // Condition pour filtrer les IMEI qui ont moins de 30 jours depuis l'activation
        // ET qui ne sont pas proches d'expirer (plus de 30 jours restants avant expiration)
        const dateCondition = {
            [Op.and]: [
                // Vérifier que les deux dates existent
                { DATE_ACTIVE_MEGA: { [Op.ne]: null } },
                { DATE_EXPIRE_MEGA: { [Op.ne]: null } },
                // La date d'activation doit être dans le passé (déjà activé)
                { DATE_ACTIVE_MEGA: { [Op.lt]: new Date() } },
                // La date d'expiration doit être dans le futur (pas encore expiré)
                { DATE_EXPIRE_MEGA: { [Op.gt]: new Date() } },
                // Les jours depuis l'activation doivent être < 30 jours
                Sequelize.where(
                    Sequelize.fn('DATEDIFF', 
                        Sequelize.fn('NOW'),
                        Sequelize.col('DATE_ACTIVE_MEGA')
                    ),
                    { [Op.lt]: 30 }
                ),
                // Les jours restants avant expiration doivent être > 5 jours (pas proche d'expirer)
                Sequelize.where(
                    Sequelize.fn('DATEDIFF', 
                        Sequelize.col('DATE_EXPIRE_MEGA'), 
                        Sequelize.fn('NOW')
                    ),
                    { [Op.gt]: 5 }
                )
            ]
        }

        const result = await device.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [[sortModel, orderColumn, orderDirection]],
            where: {
                ...globalSearchWhereLike,
                ...dateCondition
            },
            include: [
                {
                    model: operateur_resau,
                    as: "operateur",
                },
                {
                    model: Vehicules,
                    as: "vehicule",
                    include: [
                        { model: Proprietaire, as: "proprietaire" },
                        {
                            model: marque,
                            as: "marques",
                        },
                        {
                            model: model_vehicule,
                            as: "modele",
                        },
                    ],
                },
            ],
            // Ajouter des attributs calculés
            attributes: {
                include: [
                    [
                        Sequelize.fn('DATEDIFF', 
                            Sequelize.fn('NOW'),
                            Sequelize.col('DATE_ACTIVE_MEGA')
                        ),
                        'jours_depuis_activation'
                    ],
                    [
                        Sequelize.fn('DATEDIFF', 
                            Sequelize.col('DATE_EXPIRE_MEGA'), 
                            Sequelize.fn('NOW')
                        ),
                        'jours_restants_avant_expiration'
                    ],
                    [
                        Sequelize.fn('DATEDIFF', 
                            Sequelize.col('DATE_EXPIRE_MEGA'), 
                            Sequelize.col('DATE_ACTIVE_MEGA')
                        ),
                        'duree_totale_jours'
                    ],
                    [
                        Sequelize.literal('30 - DATEDIFF(NOW(), DATE_ACTIVE_MEGA)'),
                        'jours_restants_avant_30'
                    ]
                ]
            }
        })
        
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des IMEI avec moins de 30 jours d'activation et pas proches d'expirer",
            result: {
                data: result.rows,
                totalRecords: result.count
            },
        })
    } catch (error) {
        console.log(error)
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayer plus tard",
        })
    }
}
module.exports = {
   findAll,
   createDevice,
   updateDevice,
   deleteItems,
   imeiproche30jours,
   imeidepasse30jours,
   imeimoins30jours
}
