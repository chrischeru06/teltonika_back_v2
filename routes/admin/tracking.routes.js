const express = require('express')
const tracking_controller = require('../../controllers/admin/trackingdata.controller')
const tracking_routes= express.Router()
tracking_routes.post('/create', tracking_controller.createtrucking)
tracking_routes.post('/create2', tracking_controller.createtrucking2)
// tracking_routes.get('/gethisto', tracking_controller.findtrackingbyimei)
tracking_routes.get('/alltruck', tracking_controller.findallcartruck)
tracking_routes.get('/alltruckbyimei/:imei', tracking_controller.findallcartruckbyimei)
tracking_routes.get('/get-file', tracking_controller.getTrackingFile);
tracking_routes.get('/gethisto', tracking_controller.getHistorique);
module.exports = tracking_routes