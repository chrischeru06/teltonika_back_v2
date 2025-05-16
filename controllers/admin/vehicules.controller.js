const express = require("express")
const RESPONSE_CODES = require("../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS")
const { Op } = require("sequelize")
const Validation = require("../../class/Validation")
const Vehicules = require("../../models/admin/Vehicules")
const marque = require("../../models/admin/Marque")
const model_vehicule = require("../../models/admin/Model")
const Proprietaire = require("../../models/admin/Proprietaire")
const shift_vehicule = require("../../models/admin/Shift")
const VehiculeUpload = require("../../class/uploads/vehiculeUpload")
const IMAGES_DESTINATIONS = require("../../constants/IMAGES_DESTINATIONS")
const type_proprietaire_morale = require("../../models/admin/Type_proprietaire_moral")
const Type_proprietaire = require("../../models/admin/Type_proprietaire")
const Syst_zones = require("../../models/admin/Syst_zone")
const Syst_collines = require("../../models/admin/Syst_colline")
const Syst_provinces = require("../../models/admin/Syst_province")
const Syst_communes = require("../../models/admin/Syst_commune")
const Zone_affectation = require("../../models/admin/Zone_affectation_chauffeur")
const chauffeur = require("../../models/admin/Chauffeur")

/**
 * Lister tous les clients
 * @param {express.Request} req
 * @param {express.Response} res
 * @author deco257
 */
const findAll = async (req, res) => {
   try {
      const { rows = 10, first = 0, sortField, sortOrder, search } = req.query
      const defaultSortDirection = "DESC"
      const sortColumns = {
         vehicule: {
            as: "vehicule",
            fields: {
               VEHICULE_ID: "VEHICULE_ID",
            },
         },
      }
      let orderColumn, orderDirection
      // sorting
      let sortModel
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
         orderColumn = sortColumns.vehicule.fields.VEHICULE_ID
         sortModel = {
            model: "vehicule",
            as: sortColumns.vehicule,
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
      let globalSearchWhereLike = {}
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
      const result = await Vehicules.findAndCountAll({
         limit: parseInt(rows),
         offset: parseInt(first),
         order: [[sortModel, orderColumn, orderDirection]],
         include: [
            {
               model: marque,
               as: "marques",
            },
            {
               model: model_vehicule,
               as: "modele",
            },
            {
               model: Proprietaire,
               as: "proprietaire",
            },
            {
               model: shift_vehicule,
               as: "shift_vehicule",
            },
         ],
         where: {
            ...globalSearchWhereLike,
         },
      })
      res.status(RESPONSE_CODES.OK).json({
         statusCode: RESPONSE_CODES.OK,
         httpStatus: RESPONSE_STATUS.OK,
         message: "Liste des vehicules",
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
const findAllbyid = async (req, res) => {
   try {
      const { VEHICULE_ID } = req.params
      const { rows = 10, first = 0, sortField, sortOrder, search } = req.query
      const defaultSortDirection = "DESC"
      const sortColumns = {
         vehicule: {
            as: "vehicule",
            fields: {
               VEHICULE_ID: "VEHICULE_ID",
            },
         },
      }
      let orderColumn, orderDirection
      // sorting
      let sortModel
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
         orderColumn = sortColumns.vehicule.fields.VEHICULE_ID
         sortModel = {
            model: "vehicule",
            as: sortColumns.vehicule,
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
      let globalSearchWhereLike = {}
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
      const result = await Vehicules.findAndCountAll({
         limit: parseInt(rows),
         offset: parseInt(first),
         order: [[sortModel, orderColumn, orderDirection]],
         include: [
            {
               model: marque,
               as: "marques",
            },
            {
               model: model_vehicule,
               as: "modele",
            },
            {
               model: Proprietaire,
               as: "proprietaire",
               include: [
                  {
                     model: Syst_communes,
                     as: "communeproprio",
                     attributes: ["COMMUNE_ID", "COMMUNE_NAME"],
                  },
                  {
                     model: Syst_provinces,
                     as: "provinceproprio",
                  },
                  {
                     model: Syst_collines,
                     as: "collineproprio",
                     attributes: ["COLLINE_ID", "COLLINE_NAME"],
                  },
                  {
                     model: Syst_zones,
                     as: "zoneeproprio",
                     attributes: ["ZONE_ID", "ZONE_NAME"],
                  },
                  {
                     model: Type_proprietaire,
                     as: "type_proprio",
                  },
                  {
                     model: type_proprietaire_morale,
                     as: "type_propriomorale",
                  },
               ],
            },
            {
               model: shift_vehicule,
               as: "shift_vehicule",
            },
         ],
         where: {
            VEHICULE_ID: VEHICULE_ID,
            ...globalSearchWhereLike,
         },
      })
      res.status(RESPONSE_CODES.OK).json({
         statusCode: RESPONSE_CODES.OK,
         httpStatus: RESPONSE_STATUS.OK,
         message: "Liste des vehicules",
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
 * Permet d'enregistrer un profile
 * @param {express.Request} req
 * @param {express.Response} res
 * @author deco257
 * @date 05/12/2023
 */
// const createVehicule = async (req, res) => {
//     try {
//         const {
//             ID_MARQUE, ID_MODELE, PLAQUE, PROPRIETAIRE_ID, ANNEE_FABRICATION, NUMERO_CHASSIS, COULEUR
//             , KILOMETRAGE, ID_ASSUREUR, DATE_DEBUT_ASSURANCE, DATE_FIN_ASSURANCE, DATE_DEBUT_CONTROTECHNIK, DATE_FIN_CONTROTECHNIK
//         } = req.body
//         const files = req.files || {};
//         const { PHOTO, FILE_ASSURANCE, FILE_CONTRO_TECHNIQUE, IMAGE_AVANT, IMAGE_ARRIERE, IMAGE_LATERALE_GAUCHE, IMAGE_LATERALE_DROITE
//             , IMAGE_TABLEAU_DE_BORD, IMAGE_SIEGE_AVANT, IMAGE_SIEGE_ARRIERE } = files
//         const data = { ...req.files, ...req.body };
// return console.log(data,'vehicules')
//         const validation = new Validation(data, {
//             ID_MARQUE: {
//                 required: true,
//             },
//             ID_MODELE: {
//                 required: true
//             }
//             ,
//             PLAQUE: {
//                 required: true,
//             }
//             ,
//             PROPRIETAIRE_ID: {
//                 required: true
//             },
//             ANNEE_FABRICATION: {
//                 required: true
//             },
//             NUMERO_CHASSIS: {
//                 required: true
//             },
//             COULEUR: {
//                 required: true
//             },
//             KILOMETRAGE: {
//                 required: true
//             },
//             DATE_DEBUT_ASSURANCE: {
//                 required: true
//             }
//             ,
//             DATE_FIN_ASSURANCE: {
//                 required: true
//             }
//             ,
//             DATE_DEBUT_CONTROTECHNIK: {
//                 required: true
//             }
//             ,
//             DATE_FIN_CONTROTECHNIK: {
//                 required: true
//             }
//         })

//         await validation.run();
//         const isValid = await validation.isValidate();
//         if (!isValid) {
//             const errors = await validation.getErrors();
//             return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
//                 statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
//                 httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
//                 message: "Problème de validation des données",
//                 result: errors,
//             });
//         }
//         const vehiculeUpload = new VehiculeUpload();
//         let filename;  let filename2; let filename3; let filename4; let filename5; let filename6; let filename7; let filename8; let filename9; let filename10;
//         if (FILE_ASSURANCE) {
//             const { fileInfo } = await vehiculeUpload.upload(FILE_ASSURANCE, false);
//             filename = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule
//                 }/${fileInfo.fileName}`;
//         }

//         if (FILE_CONTRO_TECHNIQUE) {
//             const { fileInfo } = await vehiculeUpload.upload(FILE_CONTRO_TECHNIQUE, false);
//             filename2 = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule
//                 }/${fileInfo.fileName}`;
//         }
//         if (IMAGE_AVANT) {
//             const { fileInfo } = await vehiculeUpload.upload(IMAGE_AVANT, false);
//             filename3 = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule
//                 }/${fileInfo.fileName}`;
//         }
//         if (IMAGE_ARRIERE) {
//             const { fileInfo } = await vehiculeUpload.upload(IMAGE_ARRIERE, false);
//             filename4 = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule
//                 }/${fileInfo.fileName}`;
//         }
//         if (IMAGE_LATERALE_GAUCHE) {
//             const { fileInfo } = await vehiculeUpload.upload(IMAGE_LATERALE_GAUCHE, false);
//             filename5 = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule
//                 }/${fileInfo.fileName}`;
//         }
//         if (IMAGE_LATERALE_DROITE) {
//             const { fileInfo } = await vehiculeUpload.upload(IMAGE_LATERALE_DROITE, false);
//             filename6 = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule
//                 }/${fileInfo.fileName}`;
//         }
//         if (IMAGE_TABLEAU_DE_BORD) {
//             const { fileInfo } = await vehiculeUpload.upload(IMAGE_TABLEAU_DE_BORD, false);
//             filename7 = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule
//                 }/${fileInfo.fileName}`;
//         }
//         if (IMAGE_SIEGE_AVANT) {
//             const { fileInfo } = await vehiculeUpload.upload(IMAGE_SIEGE_AVANT, false);
//             filename8 = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule
//                 }/${fileInfo.fileName}`;
//         }
//         if (IMAGE_SIEGE_ARRIERE) {
//             const { fileInfo } = await vehiculeUpload.upload(IMAGE_SIEGE_ARRIERE, false);
//             filename9 = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule
//                 }/${fileInfo.fileName}`;
//         }
//         if (PHOTO) {
//             const { fileInfo } = await vehiculeUpload.upload(PHOTO, false);
//             filename10 = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule
//                 }/${fileInfo.fileName}`;
//         }

//         const datainsert = await Vehicules.create({
//             ID_MARQUE, ID_MODELE, PLAQUE, PROPRIETAIRE_ID, ANNEE_FABRICATION, NUMERO_CHASSIS, COULEUR
//             , KILOMETRAGE, DATE_DEBUT_ASSURANCE, DATE_FIN_ASSURANCE, DATE_DEBUT_CONTROTECHNIK, DATE_FIN_CONTROTECHNIK,
//             FILE_ASSURANCE: filename
//                 ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule
//                 }/${filename.fileName}`
//                 : null,
//             FILE_CONTRO_TECHNIQUE: filename2
//                 ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule
//                 }/${filename2.fileName}`
//                 : null,
//             IMAGE_AVANT: filename3
//                 ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule
//                 }/${filename3.fileName}`
//                 : null,
//             IMAGE_ARRIERE: filename4
//                 ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule
//                 }/${filename4.fileName}`
//                 : null,
//             IMAGE_LATERALE_GAUCHE: filename5
//                 ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule
//                 }/${filename5.fileName}`
//                 : null,
//             IMAGE_LATERALE_DROITE: filename6
//                 ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule
//                 }/${filename6.fileName}`
//                 : null,
//             IMAGE_TABLEAU_DE_BORD: filename7
//                 ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule
//                 }/${filename7.fileName}`
//                 : null,
//             IMAGE_SIEGE_AVANT: filename8
//                 ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule
//                 }/${filename8.fileName}`
//                 : null,
//             IMAGE_SIEGE_ARRIERE: filename9
//                 ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule
//                 }/${filename9.fileName}`
//                 : null,

//             PHOTO: filename10
//                 ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule
//                 }/${filename10.fileName}`
//                 : null,
//             IS_ACTIVE: 1,
//             CODE: 12334450505,
//             STATUT_VEH_AJOUT: 1,
//             STATUT: 1,
//             TRAITEMENT_DEMANDE_ID: 0,
//             SHIFT_ID: 0,
//             STAT_NOTIFICATION: 1,
//             USAGE_ID: 1, ID_ASSUREUR
//         });

//         res.status(RESPONSE_CODES.CREATED).json({
//             statusCode: RESPONSE_CODES.CREATED,
//             httpStatus: RESPONSE_STATUS.CREATED,
//             message: "Vehicule enregistré avec succès",
//             result: datainsert
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
//             statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
//             httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
//             message: "Erreur interne du serveur, réessayez plus tard",
//         });
//     }
// };

const createVehicule = async (req, res) => {
   try {
      const {
         ID_MARQUE,
         ID_MODELE,
         PLAQUE,
         PROPRIETAIRE_ID,
         ANNEE_FABRICATION,
         NUMERO_CHASSIS,
         COULEUR,
         CODE,
         KILOMETRAGE,
         ID_ASSUREUR,
         DATE_DEBUT_ASSURANCE,
         DATE_FIN_ASSURANCE,
         DATE_DEBUT_CONTROTECHNIK,
         DATE_FIN_CONTROTECHNIK,
      } = req.body

      const files = req.files || {}
      //    return  console.log(files, 'Fichiers reç/us');

      const data = { ...files, ...req.body }

      const validation = new Validation(data, {
         ID_MARQUE: { required: true },
         ID_MODELE: { required: true },
         PLAQUE: { required: true },
         PROPRIETAIRE_ID: { required: true },
         ANNEE_FABRICATION: { required: true },
         NUMERO_CHASSIS: { required: true },
         COULEUR: { required: true },
         KILOMETRAGE: { required: true },
         DATE_DEBUT_ASSURANCE: { required: true },
         DATE_FIN_ASSURANCE: { required: true },
         DATE_DEBUT_CONTROTECHNIK: { required: true },
         DATE_FIN_CONTROTECHNIK: { required: true },
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

      const vehiculeUpload = new VehiculeUpload()
      const filenames = {}

      const fileKeys = [
         "FILE_ASSURANCE",
         "FILE_CONTRO_TECHNIQUE",
         "IMAGE_AVANT",
         "IMAGE_ARRIERE",
         "IMAGE_LATERALE_GAUCHE",
         "IMAGE_LATERALE_DROITE",
         "IMAGE_TABLEAU_DE_BORD",
         "IMAGE_SIEGE_AVANT",
         "IMAGE_SIEGE_ARRIERE",
         "PHOTO",
      ]

      for (const key of fileKeys) {
         if (files[key]) {
            const { fileInfo } = await vehiculeUpload.upload(files[key], false)
            filenames[key] = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule}/${fileInfo.fileName}`
         }
      }

      const datainsert = await Vehicules.create({
         ID_MARQUE,
         ID_MODELE,
         PLAQUE,
         PROPRIETAIRE_ID,
         ANNEE_FABRICATION,
         NUMERO_CHASSIS,
         COULEUR,
         KILOMETRAGE,
         DATE_DEBUT_ASSURANCE,
         DATE_FIN_ASSURANCE,
         DATE_DEBUT_CONTROTECHNIK,
         DATE_FIN_CONTROTECHNIK,
         ...filenames,
         IS_ACTIVE: 1,
         CODE: CODE,
         STATUT_VEH_AJOUT: 1,
         STATUT: 1,
         TRAITEMENT_DEMANDE_ID: 0,
         SHIFT_ID: 0,
         STAT_NOTIFICATION: 1,
         USAGE_ID: 1,
         ID_ASSUREUR,
      })

      res.status(RESPONSE_CODES.CREATED).json({
         statusCode: RESPONSE_CODES.CREATED,
         httpStatus: RESPONSE_STATUS.CREATED,
         message: "Véhicule enregistré avec succès",
         result: datainsert,
      })
   } catch (error) {
      console.log(error)
      res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
         statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
         httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
         message: "Erreur interne du serveur, réessayez plus tard",
         message: error
      })
   }
}
/**
 * Permet de faire une modification d'un profile
 * @param {express.Request} req
 * @param {express.Response} res
 * @author deco257
 * @date 05/12/2023
 */
const updateVehicule = async (req, res) => {
   try {
      const { VEHICULE_ID } = req.params
      const {
         ID_MARQUE,
         ID_MODELE,
         PLAQUE,
         PROPRIETAIRE_ID,
         ANNEE_FABRICATION,
         NUMERO_CHASSIS,
         COULEUR,
         PHOTO,
         KILOMETRAGE,
         DATE_DEBUT_ASSURANCE,
         DATE_FIN_ASSURANCE,
         DATE_DEBUT_CONTROTECHNIK,
         DATE_FIN_CONTROTECHNIK,
      } = req.body
      const files = req.files || {}
      const {
         FILE_ASSURANCE,
         FILE_CONTRO_TECHNIQUE,
         IMAGE_AVANT,
         IMAGE_ARRIERE,
         IMAGE_LATERALE_GAUCHE,
         IMAGE_LATERALE_DROITE,
         IMAGE_TABLEAU_DE_BORD,
         IMAGE_SIEGE_AVANT,
         IMAGE_SIEGE_ARRIERE,
      } = files
      const data = { ...req.files, ...req.body }

      const validation = new Validation(data, {
         ID_MARQUE: {
            required: true,
         },
         ID_MODELE: {
            required: true,
         },
         PLAQUE: {
            required: true,
         },
         PROPRIETAIRE_ID: {
            required: true,
         },
         USAGE_ID: {
            required: true,
         },
         ANNEE_FABRICATION: {
            required: true,
         },
         NUMERO_CHASSIS: {
            required: true,
         },
         COULEUR: {
            required: true,
         },
         PHOTO: {
            required: true,
         },
         KILOMETRAGE: {
            required: true,
         },
         // SHIFT_ID: {
         //     required: true
         // }
         // ,
         DATE_DEBUT_ASSURANCE: {
            required: true,
         },
         DATE_FIN_ASSURANCE: {
            required: true,
         },
         DATE_DEBUT_CONTROTECHNIK: {
            required: true,
         },
         DATE_FIN_CONTROTECHNIK: {
            required: true,
         },
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
      const vehiculeUploads = new VehiculeUpload()
      let filename
      let filename2
      let filename3
      let filename4
      let filename5
      let filename6
      let filename7
      let filename8
      let filename9
      if (FILE_ASSURANCE) {
         const { fileInfo } = await vehiculeUploads.upload(FILE_ASSURANCE, false)
         filename = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule}/${fileInfo.fileName}`
      }

      if (FILE_CONTRO_TECHNIQUE) {
         const { fileInfo } = await vehiculeUploads.upload(FILE_CONTRO_TECHNIQUE, false)
         filename2 = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule}/${fileInfo.fileName}`
      }
      if (IMAGE_AVANT) {
         const { fileInfo } = await vehiculeUploads.upload(IMAGE_AVANT, false)
         filename3 = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule}/${fileInfo.fileName}`
      }
      if (IMAGE_ARRIERE) {
         const { fileInfo } = await vehiculeUploads.upload(IMAGE_ARRIERE, false)
         filename4 = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule}/${fileInfo.fileName}`
      }
      if (IMAGE_LATERALE_GAUCHE) {
         const { fileInfo } = await vehiculeUploads.upload(IMAGE_LATERALE_GAUCHE, false)
         filename5 = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule}/${fileInfo.fileName}`
      }
      if (IMAGE_LATERALE_DROITE) {
         const { fileInfo } = await vehiculeUploads.upload(IMAGE_LATERALE_DROITE, false)
         filename6 = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule}/${fileInfo.fileName}`
      }
      if (IMAGE_TABLEAU_DE_BORD) {
         const { fileInfo } = await vehiculeUploads.upload(IMAGE_TABLEAU_DE_BORD, false)
         filename7 = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule}/${fileInfo.fileName}`
      }
      if (IMAGE_SIEGE_AVANT) {
         const { fileInfo } = await vehiculeUploads.upload(IMAGE_SIEGE_AVANT, false)
         filename8 = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule}/${fileInfo.fileName}`
      }
      if (IMAGE_SIEGE_ARRIERE) {
         const { fileInfo } = await vehiculeUploads.upload(IMAGE_SIEGE_ARRIERE, false)
         filename9 = `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule}/${fileInfo.fileName}`
      }

      const datainsert = await Vehicules.create(
         {
            ID_MARQUE,
            ID_MODELE,
            PLAQUE,
            PROPRIETAIRE_ID,
            USAGE_ID: 1,
            ANNEE_FABRICATION,
            NUMERO_CHASSIS,
            COULEUR,
            PHOTO,
            KILOMETRAGE,
            SHIFT_ID: 1,
            DATE_DEBUT_ASSURANCE,
            DATE_FIN_ASSURANCE,
            DATE_DEBUT_CONTROTECHNIK,
            DATE_FIN_CONTROTECHNIK,
            FILE_ASSURANCE: filename
               ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule}/${filename.fileName}`
               : null,
            FILE_CONTRO_TECHNIQUE: filename2
               ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule}/${filename.fileName}`
               : null,
            IMAGE_AVANT: filename3
               ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule}/${filename3.fileName}`
               : null,
            IMAGE_ARRIERE: filename4
               ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule}/${filename4.fileName}`
               : null,
            IMAGE_LATERALE_GAUCHE: filename5
               ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule}/${filename5.fileName}`
               : null,
            IMAGE_LATERALE_DROITE: filename6
               ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule}/${filename6.fileName}`
               : null,
            IMAGE_TABLEAU_DE_BORD: filename7
               ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule}/${filename7.fileName}`
               : null,
            IMAGE_SIEGE_AVANT: filename8
               ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule}/${filename8.fileName}`
               : null,
            IMAGE_SIEGE_ARRIERE: filename9
               ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.vehicule}/${filename9.fileName}`
               : null,
         },
         {
            where: {
               VEHICULE_ID: VEHICULE_ID,
            },
         },
      )

      res.status(RESPONSE_CODES.CREATED).json({
         statusCode: RESPONSE_CODES.CREATED,
         httpStatus: RESPONSE_STATUS.CREATED,
         message: "Vehicule enregistré avec succès",
         result: datainsert,
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
 * Permet de faire la suppression d'une agence
 * @param {express.Request} req
 * @param {express.Response} res
 * @author deco257
 * @date 05/12/2023
 */

const deleteItems = async (req, res) => {
   try {
      const { ids } = req.body
      const itemsIds = JSON.parse(ids)
      await Vehicules.destroy({
         where: {
            VEHICULE_ID: {
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
const findAllcode = async (req, res) => {
   try {
      const { CODE } = req.params
      const { rows = 10, first = 0, sortField, sortOrder, search } = req.query
      const defaultSortDirection = "DESC"
      const sortColumns = {
         vehicule: {
            as: "vehicule",
            fields: {
               VEHICULE_ID: "VEHICULE_ID",
            },
         },
      }
      let orderColumn, orderDirection
      // sorting
      let sortModel
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
         orderColumn = sortColumns.vehicule.fields.VEHICULE_ID
         sortModel = {
            model: "vehicule",
            as: sortColumns.vehicule,
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
      let globalSearchWhereLike = {}
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
      const result = await Vehicules.findAndCountAll({
         limit: parseInt(rows),
         offset: parseInt(first),
         order: [[sortModel, orderColumn, orderDirection]],
         include: [
            {
               model: marque,
               as: "marques",
            },
            {
               model: model_vehicule,
               as: "modele",
            },
            {
               model: Proprietaire,
               as: "proprietaire",
               include: [
                  {
                     model: Syst_communes,
                     as: "communeproprio",
                     attributes: ["COMMUNE_ID", "COMMUNE_NAME"],
                  },
                  {
                     model: Syst_provinces,
                     as: "provinceproprio",
                  },
                  {
                     model: Syst_collines,
                     as: "collineproprio",
                     attributes: ["COLLINE_ID", "COLLINE_NAME"],
                  },
                  {
                     model: Syst_zones,
                     as: "zoneeproprio",
                     attributes: ["ZONE_ID", "ZONE_NAME"],
                  },
                  {
                     model: Type_proprietaire,
                     as: "type_proprio",
                  },
                  {
                     model: type_proprietaire_morale,
                     as: "type_propriomorale",
                  },
               ],
            },
            {
               model: shift_vehicule,
               as: "shift_vehicule",
            },
         ],
         where: {
            CODE: CODE,
            ...globalSearchWhereLike,
         },
      })
      const vehicules = result.rows
      const ids = vehicules.map((v) => v.VEHICULE_ID) // Récupérer tous les IDs des véhicules
      // Afficher les IDs des véhicules
      const chauffeurers = await Zone_affectation.findAndCountAll({
         include: {
            model: chauffeur,
            as: "chauffeur",
         },
         where: {
            VEHICULE_ID: ids,
         },
      })
      res.status(RESPONSE_CODES.OK).json({
         statusCode: RESPONSE_CODES.OK,
         httpStatus: RESPONSE_STATUS.OK,
         message: "Liste des vehicules",
         result: {
            data: result.rows,
            chauffeurs: chauffeurers,
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
const change_status = async (req, res) => {
   try {
      const { VEHICULE_ID } = req.params
      const UtiObject = await Vehicules.findByPk(VEHICULE_ID, {
         attributes: ["VEHICULE_ID", "IS_ACTIVE"],
      })
      const user = UtiObject.toJSON()
      let IS_ACTIVE = 1
      if (user.IS_ACTIVE) {
         IS_ACTIVE = 0
      } else {
         IS_ACTIVE = 1
      }
      await Vehicules.update(
         { IS_ACTIVE: IS_ACTIVE },
         {
            where: { VEHICULE_ID: VEHICULE_ID },
         },
      )
      res.status(RESPONSE_CODES.OK).json({
         statusCode: RESPONSE_CODES.OK,
         httpStatus: RESPONSE_STATUS.OK,
         message: "succès",
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
   createVehicule,
   updateVehicule,
   deleteItems,
   findAllbyid,
   findAllcode,
   change_status,
}
