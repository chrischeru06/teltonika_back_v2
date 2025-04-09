const express = require('express')
const vehicule_controller = require('../../controllers/admin/vehicules.controller')
const vehicule_routes= express.Router()

vehicule_routes.get('/', vehicule_controller.findAll)
vehicule_routes.post('/delete', vehicule_controller.deleteItems)
vehicule_routes.post('/create', vehicule_controller.createVehicule)
vehicule_routes.put('/update/:VEHICULE_ID', vehicule_controller.updateVehicule)
vehicule_routes.get('/byid/:VEHICULE_ID', vehicule_controller.findAllbyid)

module.exports = vehicule_routes