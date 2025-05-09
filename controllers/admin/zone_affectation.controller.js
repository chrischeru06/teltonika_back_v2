const express = require("express")
const RESPONSE_CODES = require("../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS")
const { Op} = require("sequelize")
const Validation = require("../../class/Validation")
const Zone_affectation = require("../../models/admin/Zone_affectation_chauffeur")
const Vehicules = require("../../models/admin/Vehicules")
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
        
        const { rows = 1000, first = 0, sortField, sortOrder, search } = req.query
        const defaultSortDirection = "DESC"
        const sortColumns = {
            zone_info: {
                as: "zone_info",
                fields: {
                    CHAUFF_ZONE_AFFECTATION_ID :"CHAUFF_ZONE_AFFECTATION_ID",
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
            orderColumn = sortColumns.zone_info.fields.CHAUFF_ZONE_AFFECTATION_ID
            sortModel = {
                model: 'zone_info',
                as: sortColumns.zone_info
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
        const result = await Zone_affectation.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            where: {
                
                ...globalSearchWhereLike,
            },
        })
         const driverIds = result.rows.map((e) => e.toJSON().VEHICULE_ID);
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
                    VEHICULE_ID: {
                      [Op.in]: driverIds,
                    },
                  },
                },
              });
              const resultss = await Promise.all(
                result.rows.map((driverObject) => {
                  const zone = driverObject.toJSON();
                  const vehiculnombre = vehicule.filter(
                    (allC) => zone.VEHICULE_ID == allC.VEHICULE_ID
                  );
                  // const controle= nombrecontrole.filter(allC => agent.PSR_AFFECTATION_ID == allC.PSR_AFFECTATION_ID)
                  return {
                    ...zone,
                    vehiculnombre,
                    // controle,
                  };
                })
              );
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des zonnes",
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

const createzone = async (req, res) => {
    try {
        const { DESCR_ZONE_AFFECTATION,COORD,COULEUR,CHAUFFEUR_ID,VEHICULE_ID } = req.body;
        const data = { ...req.body };
        const validation = new Validation(data, {
           
            DESCR_ZONE_AFFECTATION: {
                required: true
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
      
        const datainsert = await Zone_affectation.create({
            DESCR_ZONE_AFFECTATION,COORD,COULEUR,CHAUFFEUR_ID,VEHICULE_ID 
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

module.exports = {
    findAll,
    createzone
}