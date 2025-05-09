
const express = require('express')
const profil_controller = require('../../controllers/admin/profil.controller')
const profil_routes = express.Router()

profil_routes.get('/', profil_controller.findAll)
profil_routes.post('/delete', profil_controller.deleteItems)
profil_routes.post('/create', profil_controller.createprofil)
profil_routes.put('/update/:PROFIL_ID', profil_controller.updateprofil)
module.exports = profil_routes