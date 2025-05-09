const express = require("express")
const RESPONSE_CODES = require("../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS")
const { Op} = require("sequelize")
const Users = require("../../models/admin/Users")
const profiles = require("../../models/admin/Profils")
const Proprietaire = require("../../models/admin/Proprietaire")
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
         user_info: {
            as: "user_info",
            fields: {
               USER_ID: "USER_ID",
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
         orderColumn = sortColumns.user_info.fields.USER_ID
         sortModel = {
            model: "user_info",
            as: sortColumns.user_info,
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
      const result = await Users.findAndCountAll({
         limit: parseInt(rows),
         offset: parseInt(first),
         order: [[sortModel, orderColumn, orderDirection]],
         where: {
            ...globalSearchWhereLike,
         },
         include:[
            {
               model:profiles,
               as:'profile'
            },
            {
               model:Proprietaire,
               as:'proprietaire'
            }
         ]
      })
      res.status(RESPONSE_CODES.OK).json({
         statusCode: RESPONSE_CODES.OK,
         httpStatus: RESPONSE_STATUS.OK,
         message: "Liste des utilisateurs",
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

const change_status = async (req, res) => {
     try {
       const {USER_ID} = req.params;
       const UtiObject = await Users.findByPk(USER_ID, {
         attributes: ["USER_ID", "STATUT"],
       });
       const user = UtiObject.toJSON();
       let STATUT = 1;
       if (user.STATUT) {
         STATUT = 0;
       } else {
         STATUT = 1;
       }
       await Users.update(
         {STATUT:STATUT},
         {
           where: {USER_ID:USER_ID},
         }
       );
       res.status(RESPONSE_CODES.OK).json({
         statusCode: RESPONSE_CODES.OK,
         httpStatus: RESPONSE_STATUS.OK,
         message: "succès",
       });
     } catch (error) {
       console.log(error);
       res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
         statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
         httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
         message: "Erreur interne du serveur, réessayer plus tard",
   });}};
module.exports = {
   findAll,
   change_status
}
