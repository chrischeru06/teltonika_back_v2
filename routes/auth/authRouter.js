const express = require("express")
const auth_utilisateurs_routes = require("./auth_utilisateurs.routes")
const authRouter = express.Router()

authRouter.use("/", auth_utilisateurs_routes)

module.exports = authRouter
