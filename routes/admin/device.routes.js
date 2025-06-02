const express = require('express')
const device_controller = require('../../controllers/admin/device.controller')
const device_routes = express.Router()

device_routes.get('/', device_controller.findAll)
device_routes.post('/delete', device_controller.deleteItems)
device_routes.post('/create', device_controller.createDevice)
device_routes.put('/update/:DEVICE_ID', device_controller.updateDevice)
device_routes.get('/moinsde30', device_controller.imeimoins30jours)
device_routes.get('/procheexpire', device_controller.imeiproche30jours)
device_routes.get('/gexpirer', device_controller.imeidepasse30jours)

module.exports = device_routes