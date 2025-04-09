const express = require('express')
const type_proprietaire_controller = require('../../controllers/admin/Type_proprietaire.controller')
const type_proprietaire_routes = express.Router()

type_proprietaire_routes.get('/', type_proprietaire_controller.findAll)
type_proprietaire_routes.post('/delete', type_proprietaire_controller.deleteItems)
type_proprietaire_routes.post('/create', type_proprietaire_controller.createtype_proprietaire)
type_proprietaire_routes.put('/update/:TYPE_PROPRIETAIRE_ID', type_proprietaire_controller.updatetype_proprietaire)
module.exports = type_proprietaire_routes