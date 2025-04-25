const express = require("express")
const chauffeur_controller = require("../../controllers/admin/chauffeur.controller")
const chauffeur_routes = express.Router()

chauffeur_routes.get("/", chauffeur_controller.findAll)
chauffeur_routes.post("/delete", chauffeur_controller.deleteItems)
chauffeur_routes.post("/create", chauffeur_controller.create_chauffeur)
chauffeur_routes.put("/update/:CHAUFFEUR_ID", chauffeur_controller.update_assureur)
chauffeur_routes.get("/byid/:CHAUFFEUR_ID", chauffeur_controller.findAllbyid)
chauffeur_routes.get("/allzone/:CHAUFFEUR_ID", chauffeur_controller.findAllzone)

module.exports = chauffeur_routes
