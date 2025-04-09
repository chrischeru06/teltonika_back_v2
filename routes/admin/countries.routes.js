const express = require('express')
const countries_controller = require('../../controllers/admin/Countries.controller')
const countries_routes = express.Router()

countries_routes.get('/', countries_controller.findAll)

module.exports = countries_routes