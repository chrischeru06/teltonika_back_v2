const express = require("express")
const proprietaire_controller = require("../../controllers/admin/proprietaire.controller")
const proprietaire_routes = express.Router()

proprietaire_routes.get("/", proprietaire_controller.findAll)
proprietaire_routes.post("/delete", proprietaire_controller.deleteItems)
proprietaire_routes.post("/create", proprietaire_controller.create_proprietaire)
proprietaire_routes.put("/update/:PROPRIETAIRE_ID", proprietaire_controller.update_proprietaire)
proprietaire_routes.put("/change_status/:PROPRIETAIRE_ID", proprietaire_controller.change_status)
module.exports = proprietaire_routes
