const express = require('express')
const province_controller = require('../../controllers/admin/province.controller')
const province_routes = express.Router()

province_routes.get('/', province_controller.findAll)

module.exports = province_routes