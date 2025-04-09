const express = require("express")
const dashboard_contorller = require("../../controllers/dashboard/dashboard.controller")
const dashboardRouter = express.Router()

dashboardRouter.get("/drivers/todap_performance", dashboard_contorller.getDriverTodayPerformacne)
dashboardRouter.get("/drivers/overview", dashboard_contorller.getTripsByCategory)

module.exports = dashboardRouter
