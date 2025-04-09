const express = require('express')
const zone_controller = require('../../controllers/admin/zone.controller')
const zone_routes = express.Router()

zone_routes.get('/:COMMUNE_ID', zone_controller.findAll)

module.exports = zone_routes