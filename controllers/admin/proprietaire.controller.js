const express = require("express")
const RESPONSE_CODES = require("../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS")
const { Op } = require("sequelize")
const Validation = require("../../class/Validation")
const Proprietaire = require("../../models/admin/Proprietaire")
const ProprietaireUpload = require("../../class/uploads/ProprietaireUplaod")
const IMAGES_DESTINATIONS = require("../../constants/IMAGES_DESTINATIONS")
const Syst_communes = require("../../models/admin/Syst_commune")
const Syst_provinces = require("../../models/admin/Syst_province")
const Syst_collines = require("../../models/admin/Syst_colline")
const Syst_zones = require("../../models/admin/Syst_zone")
const Type_proprietaire = require("../../models/admin/Type_proprietaire")
const type_proprietaire_morale = require("../../models/admin/Type_proprietaire_moral")
const Vehicules = require("../../models/admin/Vehicules")
const marque = require("../../models/admin/Marque")
const model_vehicule = require("../../models/admin/Model")
const randomInt = require("../../utils/randomInt")
const bcrypt = require("bcrypt")
const Users = require("../../models/admin/Users")

/**
 * Lister tous les proprietaires
 * @param {express.Request} req
 * @param {express.Response} res
 * @author deco257
 */
const findAll = async (req, res) => {
   try {
      const { rows = 10, first = 0, sortField, sortOrder, search } = req.query
      const defaultSortDirection = "DESC"
      const sortColumns = {
         proprietaire: {
            as: "proprietaire",
            fields: {
               PROPRIETAIRE_ID: "PROPRIETAIRE_ID",
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
         orderColumn = sortColumns.proprietaire.fields.PROPRIETAIRE_ID
         sortModel = {
            model: "proprietaire",
            as: sortColumns.proprietaire,
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
      const result = await Proprietaire.findAndCountAll({
         limit: parseInt(rows),
         offset: parseInt(first),
         order: [[sortModel, orderColumn, orderDirection]],
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

         where: {
            ...globalSearchWhereLike,
         },
      })

      const driverIds = result.rows.map((e) => e.toJSON().PROPRIETAIRE_ID)
      const vehicule = await Vehicules.findAll({
         include: [
            {
               model: marque,
               as: "marques",
            },
            {
               model: model_vehicule,
               as: "modele",
            },
         ],
         where: {
            [Op.and]: {
               PROPRIETAIRE_ID: {
                  [Op.in]: driverIds,
               },
            },
         },
      })

      const resultss = await Promise.all(
         result.rows.map((driverObject) => {
            const proprietaire = driverObject.toJSON()
            const vehiculnombre = vehicule.filter((allC) => proprietaire.PROPRIETAIRE_ID == allC.PROPRIETAIRE_ID)
            // const controle= nombrecontrole.filter(allC => agent.PSR_AFFECTATION_ID == allC.PSR_AFFECTATION_ID)
            return {
               ...proprietaire,
               vehiculnombre,
               // controle,
            }
         }),
      )

      res.status(RESPONSE_CODES.OK).json({
         statusCode: RESPONSE_CODES.OK,
         httpStatus: RESPONSE_STATUS.OK,
         message: "Liste proprietaires des voitures",
         result: {
            data: resultss,
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
const create_proprietaire = async (req, res) => {
   try {
      const {
         // ID_TYPE_PROPRIO_MORALE,
         TYPE_PROPRIETAIRE_ID,
         NOM_PROPRIETAIRE,
         PRENOM_PROPRIETAIRE,
         PERSONNE_REFERENCE,
         EMAIL,
         TELEPHONE,
         CNI_OU_NIF,
         RC,
         PROVINCE_ID,
         COMMUNE_ID,
         ZONE_ID,
         COLLINE_ID,
         COUNTRY_ID,
         CATEGORIE_ID,
         ADRESSE,
      } = req.body
      const files = req.files || {}
      const { PHOTO_PASSPORT, FILE_CNI_PASSPORT, LOGO, FILE_NIF, FILE_RC } = files
      const data = { ...req.files, ...req.body }

      const validation = new Validation(data, {
         ID_TYPE_PROPRIO_MORALE: {
            required: true,
         },
         TYPE_PROPRIETAIRE_ID: {
            required: true,
         },
         NOM_PROPRIETAIRE: {
            required: true,
         },
         PRENOM_PROPRIETAIRE: {
            required: true,
         },
         PERSONNE_REFERENCE: {
            required: true,
         },
         EMAIL: {
            required: true,
         },
         TELEPHONE: {
            required: true,
         },
         CNI_OU_NIF: {
            required: true,
         },
         RC: {
            required: true,
         },
         // PROVINCE_ID: {
         //     required: true,
         // },
         // COMMUNE_ID: {
         //     required: true,
         // },
         // ZONE_ID: {
         //     required: true,
         // },
         // COLLINE_ID: {
         //     required: true,
         // },
         // COUNTRY_ID: {
         //     required: true,
         // },
         // CATEGORIE_ID: {
         //     required: true,
         // },
         ADRESSE: {
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
      const propietaireUpload = new ProprietaireUpload()
      var filename1
      var filename2
      var filename3
      var filename4
      var filename5
      if (PHOTO_PASSPORT) {
         const { fileInfo: fileInfo_1 } = await propietaireUpload.upload(PHOTO_PASSPORT, false)
         filename1 = fileInfo_1
      }
      if (FILE_CNI_PASSPORT) {
         const { fileInfo: fileInfo_2 } = await propietaireUpload.upload(FILE_CNI_PASSPORT, false)
         filename2 = fileInfo_2
      }
      if (LOGO) {
         const { fileInfo: fileInfo_3 } = await propietaireUpload.upload(LOGO, false)
         filename3 = fileInfo_3
      }
      if (FILE_NIF) {
         const { fileInfo: fileInfo_4 } = await propietaireUpload.upload(FILE_NIF, false)
         filename4 = fileInfo_4
      }
      if (FILE_RC) {
         const { fileInfo: fileInfo_5 } = await propietaireUpload.upload(FILE_RC, false)
         filename5 = fileInfo_5
      }

      const datainsert = await Proprietaire.create({
         TYPE_PROPRIETAIRE_ID,
         NOM_PROPRIETAIRE,
         PRENOM_PROPRIETAIRE,
         PERSONNE_REFERENCE,
         EMAIL,
         TELEPHONE,
         CNI_OU_NIF,
         RC,
         PROVINCE_ID,
         COMMUNE_ID,
         ZONE_ID,
         COLLINE_ID,
         COUNTRY_ID,
         CATEGORIE_ID,
         ADRESSE,
         PHOTO_PASSPORT: filename1
            ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.Proprietairepassport}/${filename1.fileName}`
            : null,
         FILE_CNI_PASSPORT: filename2
            ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.Proprietairepassport}/${filename2.fileName}`
            : null,
         LOGO: filename3
            ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.Proprietairepassport}/${filename3.fileName}`
            : null,
         FILE_NIF: filename4
            ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.Proprietairepassport}/${filename4.fileName}`
            : null,
         FILE_RC: filename5
            ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.Proprietairepassport}/${filename5.fileName}`
            : null,
         IS_ACTIVE: 1,
      })
      const proprioid = datainsert.toJSON().PROPRIETAIRE_ID
      // Generate a random identification code
      const identificationCode = randomInt(100000, 999999) // Generates a 6-digit code
      // Hash the password
      const hashedPassword = await bcrypt.hash("12345678", 10)
      await Users.create({
         IDENTIFICATION: identificationCode,
         USER_NAME: EMAIL,
         TELEPHONE,
         PASSWORD: hashedPassword,
         PROFIL_ID: 1,
         STATUT: 1,
         PROPRIETAIRE_ID: proprioid,
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
         message:error,
      })
   }
}
const update_proprietaire = async (req, res) => {
   try {
      const { PROPRIETAIRE_ID } = req.params
      const {
         // ID_TYPE_PROPRIO_MORALE,
         TYPE_PROPRIETAIRE_ID,
         NOM_PROPRIETAIRE,
         PRENOM_PROPRIETAIRE,
         PERSONNE_REFERENCE,
         EMAIL,
         TELEPHONE,
         CNI_OU_NIF,
         RC,
         PROVINCE_ID,
         COMMUNE_ID,
         ZONE_ID,
         COLLINE_ID,
         COUNTRY_ID,
         CATEGORIE_ID,
         ADRESSE,
      } = req.body
      const files = req.files || {}
      const { PHOTO_PASSPORT, FILE_CNI_PASSPORT, LOGO, FILE_NIF, FILE_RC } = files
      const data = { ...req.files, ...req.body }

      const validation = new Validation(data, {
         ID_TYPE_PROPRIO_MORALE: {
            required: true,
         },
         TYPE_PROPRIETAIRE_ID: {
            required: true,
         },
         NOM_PROPRIETAIRE: {
            required: true,
         },
         PRENOM_PROPRIETAIRE: {
            required: true,
         },
         PERSONNE_REFERENCE: {
            required: true,
         },
         EMAIL: {
            required: true,
         },
         TELEPHONE: {
            required: true,
         },
         CNI_OU_NIF: {
            required: true,
         },
         RC: {
            required: true,
         },
         PROVINCE_ID: {
            required: true,
         },
         COMMUNE_ID: {
            required: true,
         },
         ZONE_ID: {
            required: true,
         },
         COLLINE_ID: {
            required: true,
         },
         COUNTRY_ID: {
            required: true,
         },
         // CATEGORIE_ID: {
         //     required: true,
         // },
         ADRESSE: {
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
      const propietaireUpload = new ProprietaireUpload()
      var filename1
      var filename2
      var filename3
      var filename4
      var filename5
      if (PHOTO_PASSPORT) {
         const { fileInfo: fileInfo_1 } = await propietaireUpload.upload(PHOTO_PASSPORT, false)
         filename1 = fileInfo_1
      }
      if (FILE_CNI_PASSPORT) {
         const { fileInfo: fileInfo_2 } = await propietaireUpload.upload(FILE_CNI_PASSPORT, false)
         filename2 = fileInfo_2
      }
      if (LOGO) {
         const { fileInfo: fileInfo_3 } = await propietaireUpload.upload(LOGO, false)
         filename3 = fileInfo_3
      }
      if (FILE_NIF) {
         const { fileInfo: fileInfo_4 } = await propietaireUpload.upload(FILE_NIF, false)
         filename4 = fileInfo_4
      }
      if (FILE_RC) {
         const { fileInfo: fileInfo_5 } = await propietaireUpload.upload(FILE_RC, false)
         filename5 = fileInfo_5
      }
      const datainsert = await Proprietaire.update(
         {
            // ID_TYPE_PROPRIO_MORALE,
            TYPE_PROPRIETAIRE_ID,
            NOM_PROPRIETAIRE,
            PRENOM_PROPRIETAIRE,
            PERSONNE_REFERENCE,
            EMAIL,
            TELEPHONE,
            CNI_OU_NIF,
            RC,
            PROVINCE_ID,
            COMMUNE_ID,
            ZONE_ID,
            COLLINE_ID,
            COUNTRY_ID,
            CATEGORIE_ID,
            ADRESSE,
            PHOTO_PASSPORT: filename1
               ? `${req.protocol}://${req.get("host")}/${
                    IMAGES_DESTINATIONS.Proprietairepassport
                 }/${filename1.fileName}`
               : null,
            FILE_CNI_PASSPORT: filename2
               ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.Proprietairefilecni}/${filename2.fileName}`
               : null,
            LOGO: filename3
               ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.Proprietairelogo}/${filename3.fileName}`
               : null,
            FILE_NIF: filename4
               ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.Proprietairefilenif}/${filename4.fileName}`
               : null,
            FILE_RC: filename5
               ? `${req.protocol}://${req.get("host")}/${IMAGES_DESTINATIONS.Proprietairefilerc}/${filename5.fileName}`
               : null,
         },
         {
            where: {
               PROPRIETAIRE_ID: PROPRIETAIRE_ID,
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
      await Proprietaire.destroy({
         where: {
            PROPRIETAIRE_ID: {
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
const change_status = async (req, res) => {
    try {
       const {PROPRIETAIRE_ID} = req.params
       const UtiObject = await Proprietaire.findByPk(PROPRIETAIRE_ID, {
          attributes: ["PROPRIETAIRE_ID", "IS_ACTIVE"],
       })
       const user = UtiObject.toJSON()
       let IS_ACTIVE = 1
       if (user.IS_ACTIVE) {
          IS_ACTIVE = 0
       } else {
          IS_ACTIVE = 1
       }
       await Proprietaire.update(
          { IS_ACTIVE: IS_ACTIVE },
          {
             where: {PROPRIETAIRE_ID:PROPRIETAIRE_ID},
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
   create_proprietaire,
   update_proprietaire,
   deleteItems,
   change_status
}
