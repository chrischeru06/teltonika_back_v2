const express = require('express')
const realtimedata = require('../../controllers/admin/realtimedata_controller')
const realtimedata_routes = express.Router()
realtimedata_routes.post('/senddata', realtimedata.alldata)
module.exports = realtimedata_routes