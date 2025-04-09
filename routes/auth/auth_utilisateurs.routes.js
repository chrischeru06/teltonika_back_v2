const express = require("express")
const auth_controller = require("../../controllers/auth/auth.controller")
const auth_riders_routes = express.Router()
/**
/**
 * Une route pour controller la connnexion d'un riders
 *@method POST
 * @url /auth/login
 */
auth_riders_routes.post("/login", auth_controller.login)
/**
 * Cette route permet supprimer le token d'auth dans la base de donnees
 *@method PUT
 * @url /auth/logout
 */
auth_riders_routes.delete("/logout", auth_controller.logout)

/**
 * Cette route permet de recevoir un nouveau token d'access
 *@method POST
 * @url /auth/access_token
 */
auth_riders_routes.post("/access_token", auth_controller.getNewAccessToken)

module.exports = auth_riders_routes
