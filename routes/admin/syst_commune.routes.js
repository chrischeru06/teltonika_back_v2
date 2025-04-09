const express = require('express')
const commune_controller = require('../../controllers/admin/communes.controller')
const commune_routes = express.Router()

commune_routes.get('/:PROVINCE_ID', commune_controller.findAll)

module.exports = commune_routes