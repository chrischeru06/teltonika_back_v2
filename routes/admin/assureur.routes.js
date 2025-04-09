const express = require('express')
const assureur_controller = require('../../controllers/admin/assureur.controller')
const assureur_routes = express.Router()

assureur_routes.get('/', assureur_controller.findAll)
assureur_routes.post('/delete', assureur_controller.deleteItems)
assureur_routes.post('/create', assureur_controller.create_assureur)
assureur_routes.put('/update/:ID_ASSUREUR', assureur_controller.update_assureur)
module.exports = assureur_routes