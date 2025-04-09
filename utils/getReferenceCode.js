const moment = require("moment")

const getReferenceCode = async (id = "") => {
   const randomId = [...Array(2)].map(() => Math.floor(Math.random() * 10)).join("")
   return `${randomId}${id}${moment().format("mm")}${moment().format("ss")}`
}
module.exports = getReferenceCode
