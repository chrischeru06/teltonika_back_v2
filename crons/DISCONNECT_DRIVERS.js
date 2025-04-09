const { Op } = require("sequelize")
const moment = require("moment")

/**
 * Le temps que ca va prendre pour deconnecter le chauffeur automatiquement
 */
const TIME_TO_DISCONNECT_DRIVER_IN_MINUTES = 300

const MILLISECONDS = TIME_TO_DISCONNECT_DRIVER_IN_MINUTES * 60 * 1000
/**
 * Un cron qui permet de deconnecter automatiquement les chauffeurs apres x temps sans faire une action sur leur appllication
 * @author Dukizwe Darcy <darcy@mediabox.bi>
 * @date 28/12/2023
 */
const DISCONNECT_DRIVERS = (io) => {
   var interval = setInterval(
      () => {
         clearInterval(interval)
         researchAgain(io)
      },
      2 * 60 * 1000,
   ) // every 2 minutes
}

const researchAgain = async () => {
   try {
      // eslint-disable-next-line no-undef
      await Drivers.update(
         {
            EN_LIGNE: 0,
         },
         {
            where: {
               [Op.and]: [
                  { EN_LIGNE: 1 },
                  {
                     LAST_LOCATION_DATE: {
                        [Op.lt]: moment(new Date(new Date() - MILLISECONDS)).utc(),
                     },
                  },
               ],
            },
         },
      )
      DISCONNECT_DRIVERS()
   } catch (error) {
      console.log(error)
   }
}

module.exports = DISCONNECT_DRIVERS
