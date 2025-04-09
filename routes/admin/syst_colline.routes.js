const express = require('express')
const colline_controller = require('../../controllers/admin/colline.controller')
const colline_routes = express.Router()
colline_routes.get('/:ZONE_ID', colline_controller.findAll)
module.exports = colline_routes