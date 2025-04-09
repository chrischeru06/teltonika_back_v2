const express = require("express")
const messages_riders_routes = require("./messages_riders.routes")
const messages_drivers_routes = require("./messages_drivers.routes")
const messageRouter = express.Router()

messageRouter.use("/riders", messages_riders_routes)
messageRouter.use("/drivers", messages_drivers_routes)

module.exports = messageRouter
