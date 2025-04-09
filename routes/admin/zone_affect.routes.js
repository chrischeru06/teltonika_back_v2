const express = require('express')
const zone_controller = require('../../controllers/admin/zone_affectation.controller')
const zone_routes= express.Router()

zone_routes.get('/', zone_controller.findAll)
// zone_routes.post('/delete', zone_controller.deleteItems)
zone_routes.post('/create', zone_controller.createzone)
module.exports = zone_routes