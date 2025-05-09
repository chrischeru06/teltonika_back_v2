const express = require('express')
const user_controller = require('../../controllers/admin/users.controller')
const user_routes= express.Router()
user_routes.get('/', user_controller.findAll)
user_routes.put('/change_status/:USER_ID', user_controller.change_status)
module.exports = user_routes