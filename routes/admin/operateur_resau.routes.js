
const express = require('express')
const operateur_resau_controller = require('../../controllers/admin/operateur_reseau.controller')
const operateur_routes = express.Router()

operateur_routes.get('/', operateur_resau_controller.findAll)
operateur_routes.post('/delete', operateur_resau_controller.deleteItems)
operateur_routes.post('/create', operateur_resau_controller.create_operateur)
operateur_routes.put('/update/:OPERATEUR_ID', operateur_resau_controller.update_operateur)
module.exports = operateur_routes