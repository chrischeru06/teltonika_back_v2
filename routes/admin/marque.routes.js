const express = require('express')
const marque_controller = require('../../controllers/admin/marque.controller')
const marque_routes = express.Router()

marque_routes.get('/', marque_controller.findAll)
marque_routes.post('/delete', marque_controller.deleteItems)
marque_routes.post('/create', marque_controller.createMarque)
marque_routes.put('/update/:ID_MARQUE', marque_controller.updateMarque)

module.exports = marque_routes