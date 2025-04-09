const { Op } = require("sequelize")
const moment = require("moment")

// eslint-disable-next-line no-unused-vars
const UPDATE_DRIVER_LAST_ONLINE_DATE = async (data, io) => {
   const { driverId } = data
   //         console.log(data)
   if (driverId) {
      // eslint-disable-next-line no-undef
      Drivers.update(
         {
            LAST_EN_LIGNE_DATE: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
            // LAST_LOCATION_DATE: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
         },
         {
            where: {
               [Op.and]: [{ ID_DRIVER: driverId }, { EN_LIGNE: 1 }],
            },
         },
      )
   }
}

module.exports = UPDATE_DRIVER_LAST_ONLINE_DATE
