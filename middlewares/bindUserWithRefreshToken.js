const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
const { Op } = require("sequelize")
// const Utilisateurs_tokens = require("../models/Utilisateurs_tokens")
// const Utilisateurs = require("../models/Utilisateurs")
dotenv.config()

/**
 * Permet de modifier la requerte en verifiant l'access token et le refresh token
 * @param {express.Request} request
 * @param {express.Response} response
 * @param {express.NextFunction} next
 * @author darcydev <darcy@mediabox.bi>
 * @date 18/09/2023
 */
const bindUserWithRefreshToken = (request, response, next) => {
   const bearer = request.headers.authorization
   const bearerToken = bearer && bearer.split(" ")[1]
   const accessToken = bearerToken
   const refreshToken = request.headers["x-refresh-token"]
   if (accessToken) {
      jwt.verify(accessToken, process.env.JWT_PRIVATE_KEY, async (error, user) => {
         if (user) {
            const freshUser = await Utilisateurs.findOne({
               where: {
                  [Op.and]: [{ ID_UTILISATEUR: user.user }, { IS_ACTIF: 1 }],
               },
            })
            if (freshUser) {
               if (refreshToken) {
                  jwt.verify(refreshToken, process.env.JWT_REFRESH_PRIVATE_KEY, async (refreshError, refreshData) => {
                     if (refreshData) {
                        const token = await Utilisateurs_tokens.findOne({
                           where: {
                              [Op.and]: [{ REFRESH_TOKEN: refreshToken }, { IS_ACTIVE: 1 }],
                           },
                        })
                        if (token) {
                           request.userId = freshUser.ID_UTILISATEUR
                           request.authStatus = "OK"
                           next()
                        } else {
                           request.authStatus = "INVALID_REFRESH_TOKEN"
                           next()
                        }
                     } else {
                        request.authStatus = "INVALID_REFRESH_TOKEN"
                        next()
                     }
                  })
               } else {
                  next()
                  request.authStatus = "MISSING_REFRESH_TOKEN"
               }
            } else {
               next()
               request.authStatus = "INVALID_USER"
            }
         } else {
            request.authStatus = "INVALID_ACCESS_TOKEN"
            next()
         }
      })
   } else {
      request.authStatus = "MISSING_ACCESS_TOKEN"
      next()
   }
}
module.exports = bindUserWithRefreshToken
