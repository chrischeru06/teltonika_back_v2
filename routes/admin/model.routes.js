const express = require('express')
const model_controller = require('../../controllers/admin/modele.controller')
const modele_routes = express.Router()

modele_routes.get('/', model_controller.findAll)
modele_routes.post('/delete', model_controller.deleteItems)
modele_routes.post('/create', model_controller.createModele)
modele_routes.put('/update/:ID_MODELE', model_controller.updateModele)
modele_routes.get('/allmodel/:ID_MARQUE', model_controller.findAllbyid)
module.exports = modele_routes