const express = require('express')
const affectation_chauffeur_controller = require('../../controllers/admin/affectation_chauffeur.controller')
const affectation_chauffeur_routes = express.Router()

affectation_chauffeur_routes.get('/', affectation_chauffeur_controller.findAll)
// affectation_chauffeur_routes.post('/delete', affectation_chauffeur_routes_controller.deleteItems)
affectation_chauffeur_routes.post('/create', affectation_chauffeur_controller.createAffectation)
// affectation_chauffeur_routes.put('/updateagence/:AGENCE_ID', affectation_chauffeur_routes_controller.updateAgence)

module.exports = affectation_chauffeur_routes