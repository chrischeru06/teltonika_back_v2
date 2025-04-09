const express = require("express")
const utilisateur_routes_controller = require("../../controllers/admin/utilisateurs_admin.controller")
const utilisateur_routes = express.Router()

/**
 * Une route pour insert un utilisateur
 *@method POST
 * @url /admin/utilisateurs/
 */
utilisateur_routes.post("/", utilisateur_routes_controller.createUtilisateur)

module.exports = utilisateur_routes
