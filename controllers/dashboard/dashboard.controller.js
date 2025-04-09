/* eslint-disable no-undef */
const RESPONSE_CODES = require("../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS")

/**
 * Retourne la performance d'un chauffeur d'ajourd'hui
 * @author Dukizwe Darcie <darcy@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res
 */
const getDriverTodayPerformacne = async (req, res) => {
   try {
      const today = new Date()
      const sqlQuery = `
                    SELECT COUNT(ID_COURSE) course, SUM(DISTANCE_PARCOURUE) distance, SUM(DUREE_PARCOURUE) duree, SUM(MONTANT) gagne
                              FROM courses
                    WHERE ID_DRIVER = ? AND ID_STATUT IN (?) AND DAY(DATE_INSERTION) = ? AND MONTH(DATE_INSERTION) = ? AND YEAR(DATE_INSERTION) = ?
                    `
      const performance = (
         await query(sqlQuery, [
            req.userId,
            [IDS_COURSE_STATUS.COURSE_TERMINE, IDS_COURSE_STATUS.TERMINE_PAR_ADMIN],
            moment(new Date(today)).tz("Africa/Bujumbura").get("date"),
            moment(new Date(today)).tz("Africa/Bujumbura").get("month") + 1,
            moment(new Date(today)).tz("Africa/Bujumbura").get("year"),
         ])
      )[0]
      res.status(RESPONSE_CODES.OK).json({
         statusCode: RESPONSE_CODES.OK,
         httpStatus: RESPONSE_STATUS.OK,
         message: "Performance d'ajourd'hui d'un chauffeur",
         result: {
            ...performance,
            gagne: parseFloat(parseFloat(performance.gagne).toFixed(2)),
         },
      })
   } catch (error) {
      console.log(error)
      res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
         statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
         httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
         message: "Erreur interne du serveur, réessayer plus tard",
      })
   }
}

const getTripsByCategory = async (req, res) => {
   try {
      const { startDate, endDate } = req.query
      const startDateFormat = moment
         .tz(startDate, req.headers.timezone || DEFAULT_TIMEZONE)
         .set("hours", 0)
         .set("minutes", 0)
         .set("seconds", 0)
         .utc()
         .format("YYYY-MM-DD HH:mm:ss")
      const endDateFormat = endDate
         ? moment
              .tz(endDate, req.headers.timezone || DEFAULT_TIMEZONE)
              .set("hours", 23)
              .set("minutes", 59)
              .set("seconds", 59)
              .utc()
              .format("YYYY-MM-DD HH:mm:ss")
         : moment
              .tz(new Date(), req.headers.timezone || DEFAULT_TIMEZONE)
              .set("hours", 23)
              .set("minutes", 59)
              .set("seconds", 59)
              .utc()
              .format("YYYY-MM-DD HH:mm:ss")
      const trips = await Courses.findAll({
         attributes: ["ID_COURSE", "MONTANT", "DATE_INSERTION", "ID_COURSE_TYPE"],
         include: [
            {
               attributes: ["ID_CORP_CORPORATE", "NOM", "ICON"],
               model: Corp_corporates,
               as: "corp_corporates",
               required: false,
            },
            {
               model: Course_corporate_config,
               as: "course_corporate_config",
               required: false,
               attributes: ["COMISSION_RATE"],
            },
         ],
         where: {
            [Op.and]: [
               { ID_DRIVER: req.userId },
               {
                  DATE_INSERTION: {
                     [Op.between]: [startDateFormat, endDateFormat],
                  },
               },
               {
                  ID_STATUT: {
                     [Op.in]: [IDS_COURSE_STATUS.COURSE_TERMINE, IDS_COURSE_STATUS.TERMINE_PAR_ADMIN],
                  },
               },
            ],
         },
      })
      var tripsByCorpo = []
      const regularsTips = trips.filter((trip) => !trip.corp_corporates)
      const corpoTips = trips.filter((trip) => trip.corp_corporates)
      corpoTips.forEach((tripObject) => {
         const trip = tripObject.toJSON()
         const isThere = tripsByCorpo.find((corpo) => corpo.ID_CORP_CORPORATE == trip.corp_corporates.ID_CORP_CORPORATE)
         if (isThere) {
            const corpo = {
               ...isThere,
               trips: [...isThere.trips, trip],
            }
            tripsByCorpo = tripsByCorpo.map((corpoTrip) => {
               if (corpoTrip.ID_CORP_CORPORATE == corpo.ID_CORP_CORPORATE) {
                  return corpo
               } else {
                  return corpoTrip
               }
            })
         } else {
            const newCorpo = {
               ...trip.corp_corporates,
               trips: [trip],
            }
            tripsByCorpo.push(newCorpo)
         }
      })
      const tripsPerCategory = tripsByCorpo.map((corpo) => {
         return {
            label: corpo.NOM,
            percentage: parseFloat(((corpo.trips.length * 1) / trips.length).toFixed(1)),
         }
      })
      tripsPerCategory.push({
         label: req.__("dashboard.controller.getTripsByCategory.regular"),
         percentage: parseFloat(((regularsTips.length * 1) / trips.length).toFixed(1)),
      })
      var revenue = 0
      var commission = 0
      trips.forEach((trip) => {
         revenue += trip.MONTANT
         commission += (trip.MONTANT * trip.course_corporate_config.COMISSION_RATE) / 100
      })
      const earnings = revenue - commission
      const slots = [
         {
            label: "00-05",
            start: [0, 0],
            end: [5, 59],
         },
         {
            label: "06-11",
            start: [6, 0],
            end: [11, 59],
         },
         {
            label: "12-17",
            start: [12, 0],
            end: [17, 59],
         },
         {
            label: "18-23",
            start: [18, 0],
            end: [23, 59],
         },
      ]
      const tripsBySlots = slots.map((slot) => {
         const start = moment
            .tz(startDate ? startDate : new Date(), req.headers.timezone || DEFAULT_TIMEZONE)
            .set("hours", slot.start[0])
            .set("minutes", slot.start[1])
            .set("seconds", 0)
            .utc()
         const end = moment
            .tz(startDate ? startDate : new Date(), req.headers.timezone || DEFAULT_TIMEZONE)
            .set("hours", slot.end[0])
            .set("minutes", slot.end[1])
            .set("seconds", 0)
            .utc()
         const slotTrips = trips.filter((trip) => {
            return moment(trip.toJSON().DATE_INSERTION) >= start && moment(trip.toJSON().DATE_INSERTION) <= end
         })
         return {
            ...slot,
            total: slotTrips.length,
            trips: slotTrips,
         }
      })
      const tripsTypes = [
         {
            label: req.__("dashboard.controller.getTripsByCategory.hele"),
            total: trips.filter((trip) => trip.toJSON().ID_COURSE_TYPE == 2).length,
            color: "#5248b5",
         },
         {
            label: req.__("dashboard.controller.getTripsByCategory.normal"),
            total: trips.filter((trip) => trip.toJSON().ID_COURSE_TYPE == 1).length,
            color: "#48b3b5",
         },
      ]
      const tripsCategories = {
         partener: trips.filter((trip) => trip.toJSON().corp_corporates).length,
         regular: trips.filter((trip) => ~trip.toJSON().corp_corporates).length,
      }
      res.status(RESPONSE_CODES.OK).json({
         statusCode: RESPONSE_CODES.OK,
         httpStatus: RESPONSE_STATUS.OK,
         message: "Trajets par categorie",
         result: {
            tripsPerCategory,
            totalTrips: trips.length,
            revenue,
            commission,
            earnings,
            tripsBySlots,
            tripsTypes,
            tripsCategories,
         },
      })
   } catch (error) {
      console.log(error)
      res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
         statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
         httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
         message: "Erreur interne du serveur, réessayer plus tard",
      })
   }
}

module.exports = {
   getDriverTodayPerformacne,
   getTripsByCategory,
}
