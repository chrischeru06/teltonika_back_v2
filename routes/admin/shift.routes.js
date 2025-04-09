const express = require('express')
const shift_controller = require('../../controllers/admin/shift.controller')
const shift_routes = express.Router()

shift_routes.get('/', shift_controller.findAll)
shift_routes.post('/delete', shift_controller.deleteItems)
shift_routes.post('/create', shift_controller.createshift)
shift_routes.put('/update/:SHIFT_ID', shift_controller.updateShift)
module.exports = shift_routes