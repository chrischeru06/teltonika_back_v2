const express = require('express')
const user_controller = require('../../controllers/admin/login.controller')
const user_routes = express.Router()
user_routes.post('/login', user_controller.login)
module.exports = user_routes