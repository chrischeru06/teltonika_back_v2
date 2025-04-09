const express = require('express')
const type_proprietaire_moral_controller = require('../../controllers/admin/type_proprietaire_morale.controller')
const type_proprietaire_morale_routes = express.Router()

type_proprietaire_morale_routes.get('/', type_proprietaire_moral_controller.findAll)
type_proprietaire_morale_routes.post('/delete', type_proprietaire_moral_controller.deleteItems)
type_proprietaire_morale_routes.post('/create', type_proprietaire_moral_controller.createtype_proprietairemoral)
type_proprietaire_morale_routes.put('/update/:ID_TYPE_PROPRIO_MORALE', type_proprietaire_moral_controller.updatetype_proprietairemoral)
module.exports = type_proprietaire_morale_routes