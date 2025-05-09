const express = require("express")
const RESPONSE_CODES = require("../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS")
const { Op } = require("sequelize")
const Validation = require("../../class/Validation")
const profiles = require("../../models/admin/Profils")

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
         profile_info: {
            as: "profile_info",
            fields: {
               PROFIL_ID: "PROFIL_ID",
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
         orderColumn = sortColumns.profile_info.fields.PROFIL_ID
         sortModel = {
            model: "profile_info",
            as: sortColumns.profile_info,
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
      const result = await profiles.findAndCountAll({
         limit: parseInt(rows),
         offset: parseInt(first),
         order: [[sortModel, orderColumn, orderDirection]],
         where: {
            ...globalSearchWhereLike,
         },
      })
      res.status(RESPONSE_CODES.OK).json({
         statusCode: RESPONSE_CODES.OK,
         httpStatus: RESPONSE_STATUS.OK,
         message: "Liste des profiles",
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
const createprofil = async (req, res) => {
   try {
      const { DESCRIPTION_PROFIL } = req.body
      const data = { ...req.body }
      const validation = new Validation(data, {
         DESCRIPTION_PROFIL: {
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

      const datainsert = await profiles.create({
         DESCRIPTION_PROFIL,
         CODE_PROFIL: 99999,
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

const updateprofil = async (req, res) => {
   try {
      const { PROFIL_ID } = req.params
      const { DESCRIPTION_PROFIL } = req.body
      const data = { ...req.body }
      const validation = new Validation(data, {
         DESCRIPTION_PROFIL: {
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

      const datainsert = await profiles.update(
         {
            DESCRIPTION_PROFIL,
         },
         {
            where: {
               PROFIL_ID: PROFIL_ID,
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
      await profiles.destroy({
         where: {
            PROFIL_ID: {
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
module.exports = {
   findAll,
   createprofil,
   updateprofil,
   deleteItems,
}
